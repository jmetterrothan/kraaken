import Stats from "stats-js";
import { debounce } from 'debounce';

import EditorState from "@src/states/EditorState";
import LevelState from "@src/states/LevelState";
import MenuState from "@src/states/MenuState";
import StateManager from "@src/states/StateManager";

import { GameStates, IGameOptions } from "@shared/models/game.model";

import * as GameEventTypes from '@shared/events/constants';
import * as GameEvents from '@shared/events';

import { getMouseOffsetX, getMouseOffsetY, getCoord } from "@shared/utility/Utility";

import { driver } from '@shared/drivers/DriverFactory';
import { configSvc } from "@src/shared/services/ConfigService";
import editorStore from "./states/EditorState/editorStore";

import config from '@src/config';

const instanceSym = Symbol("instance");

let wrapper: HTMLElement;
let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;

class Game {
  set fullscreen(b: boolean) {
    if (b) {
      const element = document.documentElement;

      if (this.options.allowFullscreen && element.requestFullscreen) {
        element.requestFullscreen();
        this.resize(window.screen.width, window.screen.height);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();

        const { width, height } = this.computeDimensions();
        this.resize(width, height);
      }
    }
  }

  get fullscreen(): boolean {
    return document.fullscreenElement !== null;
  }

  public static readonly TARGET_UPS: number = config.TARGET_UPS;
  public static readonly MS_PER_UPDATE: number = 1000 / Game.TARGET_UPS;

  public static create(options?: Partial<IGameOptions>): Game {
    if (!(Game[instanceSym] instanceof Game)) {
      const mergedOptions = Object.assign({}, Game.DEFAULT_OPTIONS, options);

      Game[instanceSym] = new Game(mergedOptions);
      Game[instanceSym].init(options.levelId);
    }
    return Game[instanceSym];
  }

  private static DEFAULT_OPTIONS: IGameOptions = {
    allowFullscreen: true,
    height: 600,
    width: 800,
    root: document.body,
    levelId: '',
  };

  private options: IGameOptions;

  private events: Map<string, CallableFunction | null>;

  private stateManager: StateManager;

  private lag: number;
  private nextTime: number;
  private lastTime: number;

  private stats: Stats;
  private upsPanel: Stats.Panel;

  private targetScale: number;

  private ups: number;

  private paused: boolean;

  private constructor(options: IGameOptions) {
    this.options = options;

    this.stateManager = new StateManager();

    this.events = new Map<string, CallableFunction | null>();
    this.events.set("resize", null);
    this.events.set("fullscreen", null);

    this.lag = 0;
    this.lastTime = window.performance.now();
    this.nextTime = this.lastTime;

    this.targetScale = 1;

    if (config.DEBUG) {
      this.stats = new Stats();
      this.upsPanel = this.stats.addPanel(new Stats.Panel("UPS", "#ff8", "#221"));
    }

    this.ups = 0;

    this.paused = false; // !document.hasFocus();
  }

  public resize(targetWidth: number, targetHeight: number): void {
    const ratio: number = window.devicePixelRatio || 1;
    const scale: number = Math.round(this.targetScale * ratio);

    // fix for tearing issues
    const w: number = Math.round(targetWidth / 8) * 8;
    const h: number = Math.round(targetHeight / 8) * 8;

    const hdpiW: number = Math.trunc(w * ratio);
    const hdpiH: number = Math.trunc(h * ratio);

    if (hdpiW !== canvas.width || hdpiH !== canvas.height || configSvc.scale !== scale) {
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = hdpiW;
      canvas.height = hdpiH;

      wrapper.style.width = `${w}px`;
      wrapper.style.height = `${h}px`;

      configSvc.innerSize.w = canvas.width / scale;
      configSvc.innerSize.h = canvas.height / scale;

      configSvc.frameSize.w = canvas.width;
      configSvc.frameSize.h = canvas.height;

      configSvc.scale = scale;

      gl.viewport(0, 0, canvas.width, canvas.height);

      const resizeCallback = this.events.get("resize");
      
      if (resizeCallback) {
        resizeCallback(configSvc.frameSize, configSvc.innerSize);
      }

      this.stateManager.handleResize();
    }
  }

  public on(event: string, callback: CallableFunction): void {
    if (!this.events.has(event)) {
      console.warn(`Event "${event}" does not exist`);
      return;
    }

    this.events.set(event, callback);
  }

  public update(delta: number): void {
    this.stateManager.update(delta);
  }

  public render(alpha: number): void {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.stateManager.render(alpha);
  }

  public computeDimensions(): { width: number; height: number; } {
    let width = this.options.width === 'auto' ? window.innerWidth : this.options.width;
    let height = this.options.height === 'auto' ? window.innerHeight : this.options.height;

    if (width > this.options.maxWidth) {
      width = this.options.maxWidth;
    }

    if (width < this.options.minWidth) {
      width = this.options.minWidth;
    }

    if (height > this.options.maxHeight) {
      height = this.options.maxHeight;
    }

    if (height < this.options.minHeight) {
      height = this.options.minHeight;
    }

    return { width, height };
  }

  public run(): void {
    if (config.DEBUG) {
      this.stats.begin();
    }

    if (!this.paused) {
      const time = window.performance.now();
      const elapsed = time - this.lastTime;

      if (time > this.nextTime) {
        this.nextTime += 1000;

        if (config.DEBUG) {
          this.upsPanel.update(this.ups);
        }
        this.ups = 0;
      }

      this.lastTime = time;
      this.lag += elapsed;

      let nbOfSteps = 0;

      while (this.lag >= Game.MS_PER_UPDATE) {
        this.update(Game.MS_PER_UPDATE / 1000);

        this.ups++;

        this.lag -= Game.MS_PER_UPDATE;

        if (++nbOfSteps >= 240) {
          this.lag = 0;
        }
      }
    }

    this.render(this.lag / Game.MS_PER_UPDATE);
    if (config.DEBUG) {
      this.stats.end();
    }

    window.requestAnimationFrame(this.run.bind(this));
  }

  private init(levelId: string) {
    this.initCanvas();
    this.initWebGL();
    this.initEvents();

    // Stats
    if (config.DEBUG) {
      this.stats.showPanel(0);
      this.stats.dom.style.position = "absolute";
      this.stats.dom.style.top = "unset";
      this.stats.dom.style.bottom = 0;
      this.stats.dom.style.left = "unset";
      this.stats.dom.style.right = 0;

      wrapper.appendChild(this.stats.dom);
    }

    // State manager
    this.stateManager.add(GameStates.MENU, new MenuState());
    this.stateManager.add(GameStates.LEVEL, new LevelState());
    this.stateManager.add(GameStates.EDITOR, new EditorState());

    this.stateManager.switch(GameStates.EDITOR, {
      id: levelId,
      blueprint: driver.load(levelId),
    });

    const { width, height } = this.computeDimensions();
    this.resize(width, height);
  }

  private initCanvas() {
    // Main elements
    wrapper = document.createElement("div");
    wrapper.classList.add("kraaken");

    canvas = document.createElement("canvas");
    canvas.classList.add("kraaken-canvas");
    canvas.classList.add("pixelated");

    wrapper.appendChild(canvas);
    this.options.root.appendChild(wrapper);
  }

  private initWebGL() {
    // Webgl
    gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

    if (!gl) {
      throw new Error("WebGL2 context is not available.");
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.depthFunc(gl.LEQUAL);

    gl.clearDepth(1.0);
    gl.clearColor(65 / 255, 140 / 255, 191 / 255, 1.0);
  }

  private initEvents() {
    // disable right click contextual menu on the canvas
    wrapper.addEventListener("contextmenu", (e) => e.preventDefault());

    // Keyboard events
    window.addEventListener(
      "keyup",
      (e) => {
        this.stateManager.handleKeyboardInput(e.key, false);
      },
      false
    );
    window.addEventListener(
      "keydown",
      (e) => {
        switch (e.key) {
          case "F11":
            e.preventDefault();
            break;

          case "f":
            this.fullscreen = !this.fullscreen;
            break;
        }

        this.stateManager.handleKeyboardInput(e.key, true);
      },
      false
    );

    // Click events
    wrapper.addEventListener(
      "mouseup",
      (e: MouseEvent) => {
        if (canvas.contains(e.target as Node)) {
          const x = getMouseOffsetX(canvas, e);
          const y = getMouseOffsetY(canvas, e);
          this.stateManager.handleMousePressed(e.button, false, getCoord(canvas, x, y));
        }
      },
      false
    );

    wrapper.addEventListener(
      "mousedown",
      (e: MouseEvent) => {
        if (canvas.contains(e.target as Node)) {
          const x = getMouseOffsetX(canvas, e);
          const y = getMouseOffsetY(canvas, e);
          this.stateManager.handleMousePressed(e.button, true, getCoord(canvas, x, y));
        }
      },
      false
    );

    wrapper.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        if (canvas.contains(e.target as Node)) {
          const x = getMouseOffsetX(canvas, e);
          const y = getMouseOffsetY(canvas, e);
          this.stateManager.handleMouseMove(getCoord(canvas, x, y));
        }
      },
      false
    );

    wrapper.addEventListener("mousewheel", (e: WheelEvent) => {
      if (canvas.contains(e.target as Node)) {
        const scale = this.targetScale + (e.deltaY > 0 ? -1 : 1);
        editorStore.setScale(scale);
      }
    });

    // Fullscreen events
    document.addEventListener("webkitfullscreenchange", this.fullscreenChange, false);

    document.addEventListener("mozfullscreenchange", this.fullscreenChange, false);

    document.addEventListener("msfullscreenchange", this.fullscreenChange, false);

    document.addEventListener("fullscreenchange", this.fullscreenChange, false);

    window.addEventListener("blur", () => {
      this.paused = true;
    });

    window.addEventListener("focus", () => {
      this.paused = false;

      const elapsed = this.nextTime - this.lastTime;
      this.lastTime = window.performance.now();
      this.nextTime = this.lastTime + elapsed;
    });

    // needed if we switch screen and the pixel ratio has changed
    window.addEventListener("resize", debounce(this.refreshScreenSize));

    // game events
    window.addEventListener(GameEventTypes.LEVEL_STATE_SWITCH_EVENT, (e: GameEvents.LevelStateSwitchEvent) => { 
      this.stateManager.switch(GameStates.LEVEL, { 
        id: e.detail.id,
        blueprint: driver.load(e.detail.id),
      });
    });

    window.addEventListener(GameEventTypes.EDITOR_STATE_SWITCH_EVENT, (e: GameEvents.EditorStateSwitchEvent) => {
      this.stateManager.switch(GameStates.EDITOR, {
        id: e.detail.id,
        blueprint: driver.load(e.detail.id),
      });
    });

    window.addEventListener(GameEventTypes.ZOOM_EVENT, (e: GameEvents.ZoomEvent) => {
      let scale = e.detail.scale;

      if (scale < 1) {
        scale = 1;
      }
      if (scale > 20) {
        scale = 20;
      }

      if (scale !== this.targetScale) {
        this.targetScale = scale;
        this.refreshScreenSize();
      }
    });
  }

  private refreshScreenSize = () => {
    if (this.fullscreen) {
      this.resize(window.screen.width, window.screen.height);
    } else {
      const { width, height } = this.computeDimensions();
      this.resize(width, height);
    }
  };

  private fullscreenChange = () => {
    const fullscreenCallback = this.events.get("fullscreen");
    if (fullscreenCallback) {
      fullscreenCallback(this.fullscreen);
    }

    this.stateManager.handleFullscreenChange(this.fullscreen);
  };
}

export { wrapper, canvas, gl };

export default Game;
