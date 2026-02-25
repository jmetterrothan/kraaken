import Stats from "stats-js";
import { debounce } from "debounce";

import EditorState from "@src/states/EditorState";
import LevelState from "@src/states/LevelState";
import MenuState from "@src/states/MenuState";
import StateManager from "@src/states/StateManager";
import editorStore from "@src/states/EditorState/editorStore";

import { GameState, IGameOptions } from "@src/shared/models/game.model";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@src/shared/events";

import { getMouseOffsetX, getMouseOffsetY, getCoord } from "@src/shared/utility/Utility";

import { driver } from "@src/shared/drivers/DriverFactory";
import { configSvc } from "@src/shared/services/ConfigService";

import config from "@src/config";

import "@src/assets/sass/kraaken.scss";
import { clamp } from "./shared/utility/MathHelpers";
import { debugSvc } from "./shared/services/Debug";
import { DebugFlag } from "./enums/DebugFlag";
import { StateOptions } from "./states/State";

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

  public static [instanceSym]: Game;

  public static readonly TARGET_UPS: number = config.TARGET_UPS;
  public static readonly MS_PER_UPDATE: number = 1000 / Game.TARGET_UPS;

  public static create(customOptions: Partial<IGameOptions>): Game {
    if (!(Game[instanceSym] instanceof Game)) {
      const options = { ...Game.DEFAULT_OPTIONS, ...customOptions };

      Game[instanceSym] = new Game(options);
      Game[instanceSym].init();

      console.debug("Debug flags:", debugSvc.flags);
    }
    return Game[instanceSym];
  }

  private static DEFAULT_OPTIONS: IGameOptions = {
    allowFullscreen: true,
    height: 900,
    width: 1280,
    root: document.body,
  };

  private options: IGameOptions;

  private events: Map<string, CallableFunction | null>;

  private stateManager: StateManager;

  private lag: number;
  private nextTime: number;
  private lastTime: number;

  private stats: any;
  private upsPanel: any;

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

    this.stats = new Stats();
    this.upsPanel = this.stats.addPanel(new Stats.Panel("UPS", "#ff8", "#221"));

    this.ups = 0;

    this.paused = false; // !document.hasFocus();
  }

  public resize(targetWidth: number, targetHeight: number): void {
    const ratio: number = window.devicePixelRatio || 1;
    const scale = Math.max(1, Math.floor(this.targetScale * ratio));

    // fix for tearing issues
    const w: number = Math.floor(targetWidth / 8) * 8;
    const h: number = Math.floor(targetHeight / 8) * 8;

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

  public computeDimensions(): { width: number; height: number } {
    let width = this.options.width === "auto" ? window.innerWidth : this.options.width;
    let height = this.options.height === "auto" ? window.innerHeight : this.options.height;

    if (typeof this.options.maxWidth === "number" && width > this.options.maxWidth) {
      width = this.options.maxWidth;
    }

    if (typeof this.options.minWidth === "number" && width < this.options.minWidth) {
      width = this.options.minWidth;
    }

    if (typeof this.options.maxHeight === "number" && height > this.options.maxHeight) {
      height = this.options.maxHeight;
    }

    if (typeof this.options.minHeight === "number" && height < this.options.minHeight) {
      height = this.options.minHeight;
    }

    return { width, height };
  }

  public run(): void {
    this.stats.begin();

    if (!this.paused) {
      const time = window.performance.now();
      const elapsed = time - this.lastTime;

      if (time > this.nextTime) {
        this.nextTime += 1000;

        this.upsPanel.update(this.ups);

        this.ups = 0;
      }

      this.lastTime = time;
      this.lag += elapsed;

      let nbOfSteps = 0;

      while (this.lag >= Game.MS_PER_UPDATE) {
        this.update(Game.MS_PER_UPDATE / 1000);

        this.ups++;

        this.lag -= Game.MS_PER_UPDATE;

        if (++nbOfSteps >= 10) {
          this.lag = 0;
        }
      }
    }

    this.render(this.lag / Game.MS_PER_UPDATE);

    this.stats.end();

    window.requestAnimationFrame(this.loop);
  }

  private readonly loop = () => this.run();

  private init() {
    this.initCanvas();
    this.initWebGL();
    this.initEvents();

    // Stats
    this.stats.dom.style.position = "absolute";
    this.stats.dom.style.top = "unset";
    this.stats.dom.style.bottom = 0;
    this.stats.dom.style.left = "unset";
    this.stats.dom.style.right = 0;
    this.stats.showPanel(-1);

    [...this.stats.dom.children].forEach((c) => {
      c.style.display = "block";
      c.style.verticalAlign = "top";
    });

    if (debugSvc.enabled(DebugFlag.STATS)) {
      this.stats.dom.style.display = "initial";
    } else {
      this.stats.dom.style.display = "none";
    }

    wrapper.appendChild(this.stats.dom);

    // State manager
    this.stateManager.add(GameState.MENU, new MenuState());
    this.stateManager.add(GameState.LEVEL, new LevelState());
    this.stateManager.add(GameState.EDITOR, new EditorState());
  }

  private initCanvas() {
    if (!this.options.root) {
      throw new Error("Missing root elment");
    }

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
    gl.clearColor(0, 0, 0, 1.0);

    const { width, height } = this.computeDimensions();

    this.resize(width, height);
  }

  public load<O extends StateOptions = StateOptions>(state: GameState, { projectId, ...options }: O): void {
    // Driver
    driver
      .ping()
      .catch(() => {
        alert("Failed to establish a connexion with the server, some features may not work properly...");
      })
      .finally(() => {
        this.stateManager.switch(state, {
          projectId,
          blueprint: driver.load(projectId),
          ...options,
        });
      });
  }

  private initEvents() {
    // disable right click contextual menu on the canvas
    wrapper.addEventListener("contextmenu", (e) => e.preventDefault());

    // Keyboard events
    window.addEventListener(
      "keyup",
      (e) => {
        this.stateManager.handleKeyboardInput(e, false);
      },
      false
    );
    window.addEventListener(
      "keydown",
      (e) => {
        switch (e.code) {
          case "F1":
            e.stopPropagation();
            e.preventDefault();
            debugSvc.toggle(DebugFlag.STATS);

            if (debugSvc.enabled(DebugFlag.STATS)) {
              this.stats.dom.style.display = "initial";
            } else {
              this.stats.dom.style.display = "none";
            }
            break;

          case "F2":
            e.stopPropagation();
            e.preventDefault();
            debugSvc.toggle(DebugFlag.CAMERA);
            break;

          case "F3":
            e.stopPropagation();
            e.preventDefault();
            debugSvc.toggle(DebugFlag.GRID);
            break;

          case "F4":
            e.stopPropagation();
            e.preventDefault();
            debugSvc.toggle(DebugFlag.COLLISION);
            break;

          case "F5":
            e.stopPropagation();
            e.preventDefault();
            debugSvc.toggle(DebugFlag.PLACEABLE_ENTITIES);
            break;

          case "F6":
            e.stopPropagation();
            e.preventDefault();
            debugSvc.toggle(DebugFlag.ZONE_ENTITIES);
            break;

          case "F11":
            e.preventDefault();
            e.stopPropagation();
            this.fullscreen = !this.fullscreen;
            break;
        }

        this.stateManager.handleKeyboardInput(e, true);
      },
      false
    );

    // Gamepad events
    window.addEventListener(
      "gamepadconnected",
      (e: GamepadEvent) => {
        console.debug('Gamepad connected (index = %d, id = "%s"): %d buttons, %d axes.', e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
      },
      false
    );

    window.addEventListener(
      "gamepaddisconnected",
      (e: GamepadEvent) => {
        console.debug("Gamepad disconnected (index = %d, id = $s)", e.gamepad.index, e.gamepad.id);
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
          this.stateManager.handleMouseInput(e, false, getCoord(canvas, x, y));
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
          this.stateManager.handleMouseInput(e, true, getCoord(canvas, x, y));
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
          this.stateManager.handleMouseMove(e, getCoord(canvas, x, y));
        }
      },
      false
    );

    wrapper.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        if (canvas.contains(e.target as Node)) {
          e.preventDefault();
          const step = 1;
          const value = this.targetScale + (e.deltaY > 0 ? -step : step);

          const scale = clamp(Math.round(value * 10) / 10, 1, 20);

          editorStore.setScale(scale);
        }
      },
      { passive: false }
    );

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
      this.stateManager.switch(GameState.LEVEL, {
        projectId: e.detail.projectId,
        levelId: e.detail.levelId,
        blueprint: driver.load(e.detail.projectId),
      });
    });

    window.addEventListener(GameEventTypes.EDITOR_STATE_SWITCH_EVENT, (e: GameEvents.EditorStateSwitchEvent) => {
      this.stateManager.switch(GameState.EDITOR, {
        projectId: e.detail.projectId,
        levelId: e.detail.levelId,
        blueprint: driver.load(e.detail.projectId),
      });
    });

    window.addEventListener(GameEventTypes.ZOOM_EVENT, (e: GameEvents.ZoomEvent) => {
      this.setTargetScale(e.detail.scale);
    });

    window.addEventListener(GameEventTypes.ZOOM_OUT_EVENT, () => {
      this.setTargetScale(this.targetScale - 1);
    });

    window.addEventListener(GameEventTypes.ZOOM_IN_EVENT, () => {
      this.setTargetScale(this.targetScale + 1);
    });
  }

  private setTargetScale(scale: number) {
    this.targetScale = clamp(scale, 1, 20);
    this.refreshScreenSize();
  }

  private refreshScreenSize = () => {
    if (this.fullscreen) {
      this.resize(window.innerWidth, window.innerHeight);
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
