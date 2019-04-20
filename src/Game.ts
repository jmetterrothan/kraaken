import { vec2 } from 'gl-matrix';
import Stats from 'stats-js';

import EditorState from '@src/states/EditorState';
import LevelState from '@src/states/LevelState';
import MenuState from '@src/states/MenuState';
import StateManager from '@src/states/StateManager';

import { GameStates, IGameOptions } from '@shared/models/game.model';
import { configSvc } from '@shared/services/config.service';

const instanceSym = Symbol('instance');

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
        this.resize(this.options.width, this.options.height);
      }
    }
  }

  get fullscreen(): boolean {
    // @ts-ignore
    return document.fullscreenElement !== null;
  }
  public static readonly TARGET_UPS: number = 30;
  public static readonly MS_PER_UPDATE: number = 1000 / Game.TARGET_UPS;
  public static readonly DEFAULT_SCALE: number = 3;

  public static create(options?: IGameOptions): Game {
    if (!(Game[instanceSym] instanceof Game)) {
      const mergedOptions = Object.assign({}, Game.DEFAULT_OPTIONS, options);

      Game[instanceSym] = new Game(mergedOptions);
      Game[instanceSym].init();
    }
    return Game[instanceSym];
  }

  private static DEFAULT_OPTIONS: IGameOptions = {
    allowFullscreen: true,
    height: 600,
    width: 800,
  };

  private options: IGameOptions;

  private events: Map<string, CallableFunction|null>;

  private stateManager: StateManager;

  private lag: number;
  private nextTime: number;
  private lastTime: number;

  private stats: Stats;
  private upsPanel: Stats.Panel;

  private ups: number;
  private ticks: number;

  private paused: boolean;
  private targetScale: number;

  private constructor(options: IGameOptions) {
    this.options = options;

    this.stateManager = new StateManager();

    this.events = new Map<string, CallableFunction|null>();
    this.events.set('resize', null);
    this.events.set('fullscreen', null);

    this.lag = 0;
    this.lastTime = window.performance.now();
    this.nextTime = this.lastTime;

    this.stats = new Stats();
    this.upsPanel = this.stats.addPanel(new Stats.Panel('UPS', '#ff8', '#221'));

    this.ups = 0;
    this.ticks = 0;

    this.paused = false; // !document.hasFocus();

    this.targetScale = Game.DEFAULT_SCALE;
  }

  public resize(targetWidth: number, targetHeight: number) {
    const ratio: number = window.devicePixelRatio || 1;
    const scale: number = Math.round(this.targetScale * ratio);

    // fix for tearing issues
    const w: number = Math.round(targetWidth / 2) * 2;
    const h: number = Math.round(targetHeight / 2) * 2;

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

      const resizeCallback = this.events.get('resize');
      if (resizeCallback) {
        resizeCallback(configSvc.frameSize, configSvc.innerSize);
      }

      this.stateManager.handleResize();
    }
  }

  public on(event: string, callback: CallableFunction) {
    if (!this.events.has(event)) {
      console.warn(`Event "${event}" does not exist`);
      return;
    }

    this.events.set(event, callback);
  }

  public update(delta: number) {
    this.stateManager.update(delta);
  }

  public render(alpha: number) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.stateManager.render(alpha);
  }

  public run() {
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
        this.ticks++;

        this.lag -= Game.MS_PER_UPDATE;

        if (++nbOfSteps >= 240) {
          this.lag = 0;
        }
      }
    }

    this.render(this.lag / Game.MS_PER_UPDATE);
    this.stats.end();

    window.requestAnimationFrame(this.run.bind(this));
  }

  private init() {
    this.initCanvas();
    this.initWebGL();
    this.initEvents();

    // Stats
    this.stats.showPanel(3);
    this.stats.dom.style.display = configSvc.debug ? 'block' : 'none';

    document.body.appendChild(this.stats.dom);

    // State manager
    this.stateManager.add(GameStates.MENU, new MenuState());
    this.stateManager.add(GameStates.LEVEL, new LevelState());
    this.stateManager.add(GameStates.EDITOR, new EditorState());

    this.stateManager.switch(GameStates.LEVEL);

    this.resize(this.options.width, this.options.height);
  }

  private initCanvas() {
    // Main elements
    wrapper = document.createElement('div');
    wrapper.classList.add('kraken-wrapper');

    canvas = document.createElement('canvas');
    canvas.classList.add('kraken-canvas');

    wrapper.appendChild(canvas);
    document.body.appendChild(wrapper);
  }

  private initWebGL() {
    // Webgl
    gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

    if (!gl) {
      throw new Error('WebGL2 context is not available.');
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.depthFunc(gl.LEQUAL);

    gl.clearDepth(1.0);
    gl.clearColor(0.25, 0.55, 0.75, 1.0);
  }

  private initEvents() {
    // Keyboard events
    window.addEventListener('keyup', (e) => this.stateManager.handleKeyboardInput(e.key, false), false);
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'F11':
          e.preventDefault();
          break;

        case 'f':
          this.fullscreen = !this.fullscreen;
          break;
      }

      this.stateManager.handleKeyboardInput(e.key, true);
    }, false);

    const getCoord = (c: HTMLCanvasElement, x: number, y: number): vec2 => {
      const rect = c.getBoundingClientRect();
      return vec2.fromValues((x - rect.left) * window.devicePixelRatio, (y - rect.top) * window.devicePixelRatio);
    };

    // Click events
    canvas.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.stateManager.handleMousePressed(e.button, false, getCoord(canvas, e.offsetX, e.offsetY));
    }, false);

    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.stateManager.handleMousePressed(e.button, true, getCoord(canvas, e.offsetX, e.offsetY));
    }, false);

    canvas.addEventListener('mousemove', (e) => {
      e.preventDefault();
      this.stateManager.handleMouseMove(getCoord(canvas, e.offsetX, e.offsetY));
    }, false);

    canvas.addEventListener('mousewheel', (e: WheelEvent) => {
      this.targetScale += e.deltaY > 0 ? -1 : 1;
      if (this.targetScale <= 0) {
        this.targetScale = 1;
      }

      this.refreshScreenSize();
    });

    // Fullscreen events
    document.addEventListener('webkitfullscreenchange', this.fullscreenChange, false);
    document.addEventListener('mozfullscreenchange', this.fullscreenChange, false);
    document.addEventListener('msfullscreenchange', this.fullscreenChange, false);
    document.addEventListener('fullscreenchange', this.fullscreenChange, false);

    window.addEventListener('blur', () => {
      this.paused = true;
    });

    window.addEventListener('focus', () => {
      this.paused = false;

      const elapsed = this.nextTime - this.lastTime;
      this.lastTime = window.performance.now();
      this.nextTime = this.lastTime + elapsed;
    });

    window.addEventListener('resize', () => {
      // needed if we switch screen and the pixel ratio has changed
      this.refreshScreenSize();
    });
  }

  private refreshScreenSize = () => {
    if (this.fullscreen) {
      this.resize(window.screen.width, window.screen.height);
    } else {
      this.resize(this.options.width, this.options.height);
    }
  }

  private fullscreenChange = () => {
    const fullscreenCallback = this.events.get('fullscreen');
    if (fullscreenCallback) {
      fullscreenCallback(this.fullscreen);
    }

    this.stateManager.handleFullscreenChange(this.fullscreen);
  }
}

export { wrapper, canvas, gl };

export default Game;
