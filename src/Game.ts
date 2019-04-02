import Stats from 'stats-js';

import StateManager from '@src/StateManager';
import { configSvc } from '@shared/services/config.service';

const instanceSym = Symbol('instance');

let wrapper: HTMLElement;
let canvas : HTMLCanvasElement;
let gl: WebGLRenderingContext;

class Game {
  private static MS_PER_UPDATE = 1000 / 30;

  private events: Map<string, CallableFunction|null>;

  private scale: number;
  private width: number;
  private height: number;

  private stateManager: StateManager;

  private lag: number;
  private nextTime: number;
  private lastTime: number;

  private stats: Stats;
  private upsPanel: Stats.Panel;
  private ups: number;
  private ticks: number;

  private paused: boolean;

  private constructor() {
    this.stateManager = new StateManager();

    this.events = new Map<string, CallableFunction|null>();
    this.events.set('resize', null);
    this.events.set('fullscreen', null);

    this.lag = 0;
    this.lastTime = window.performance.now();
    this.nextTime = window.performance.now();

    this.stats = new Stats();
    this.upsPanel = this.stats.addPanel(new Stats.Panel('UPS', '#ff8', '#221'));
    this.ups = 0;
    this.ticks = 0;

    this.width = 800;
    this.height = 600;

    this.paused = false;
  }

  private init() {
    this.initCanvas();
    this.initWebGL();
    
    this.resize(this.width, this.height);

    this.stateManager.init();

    // Events
    window.addEventListener('keyup', (e) => this.stateManager.handleKeyboardInput(e.key, false), false);
    window.addEventListener('keydown', (e) => {
      if(e.key == 'F11') { e.preventDefault(); }
      this.stateManager.handleKeyboardInput(e.key, true);
    }, false);
    canvas.addEventListener('mouseup', () => this.stateManager.handleMousePressed(false), false);
    canvas.addEventListener('mousedown', () => this.stateManager.handleMousePressed(true), false);
    canvas.addEventListener('mousemove', (e) => this.stateManager.handleMouseMove(e.offsetX, e.offsetY), false);
    canvas.addEventListener('click', (e) => this.stateManager.handleMouseClick(e.offsetX, e.offsetY), false);
    document.addEventListener('webkitfullscreenchange', this.fullscreenChange, false);
    document.addEventListener('mozfullscreenchange', this.fullscreenChange, false);
    document.addEventListener('msfullscreenchange', this.fullscreenChange, false);
    document.addEventListener('fullscreenchange', this.fullscreenChange, false);

    this.stats.showPanel(3);
    this.stats.dom.style.display = configSvc.debug ? 'block' : 'none';

    document.body.appendChild(this.stats.dom);
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
    gl = <WebGLRenderingContext>canvas.getContext('webgl2');

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

  public resize(targetWidth: number, targetHeight: number) {
    const ratio: number = window.devicePixelRatio || 1;
    const scale: number = Math.round(4 * ratio);

    // fix for tearing issues
    let w: number = Math.round(targetWidth / 8) * 8;
    let h: number = Math.round(targetHeight / 8) * 8;

    let hdpiW: number = Math.trunc(w * ratio);
    let hdpiH: number = Math.trunc(h * ratio);

    if (hdpiW !== canvas.width || hdpiH !== canvas.height) {
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = hdpiW;
      canvas.height = hdpiH;

      wrapper.style.width = `${w}px`;
      wrapper.style.height = `${h}px`;

      this.width = canvas.width / scale;
      this.height = canvas.height  / scale;

      this.scale = scale;

      gl.viewport(0, 0, canvas.width, canvas.height);

      const resizeCallback = this.events.get('resize');
      if (resizeCallback) {
        resizeCallback(this.width, this.height);
      }
    }
  }

  public on(event: string, callback: CallableFunction) {
    if (!this.events.has(event)) {
      console.warn(`Event "${event}" does not exist`);
      return;
    }

    this.events.set(event, callback);
  }

  public update() {
    this.stateManager.update();
  }

  public render(delta: number) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.stateManager.render(delta);
  }

  public run() {
    this.stats.begin();

    const time = window.performance.now();
    const elapsed = time - this.lastTime;

    if (time >= this.nextTime) {
      this.nextTime += 1000;

      this.upsPanel.update(this.ups);
      this.ups = 0;
    }

    if (!this.paused) {
        this.lastTime = time;
        this.lag += elapsed;

        let nbOfSteps = 0;
        while (this.lag >= Game.MS_PER_UPDATE) {
            this.update();

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

  private fullscreenChange = () => {
    const fullscreenCallback = this.events.get('fullscreen');
    if (fullscreenCallback) {
      fullscreenCallback(this.fullscreen);
    }

    this.stateManager.handleFullscreenChange(this.fullscreen);
  }

  set fullscreen(b: boolean) {
    if (b) {
      const element = document.documentElement;

      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  get fullscreen(): boolean {
    return document.fullscreenElement !== null;
  }

  static instance(): Game {
    if (!(Game[instanceSym] instanceof Game)) {
      Game[instanceSym] = new Game();
      Game[instanceSym].init();
    }
    return Game[instanceSym];
  }
}

export { wrapper, canvas, gl };

export default Game;