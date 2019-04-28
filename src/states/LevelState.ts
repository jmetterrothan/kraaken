import { vec2 } from 'gl-matrix';

import State from '@src/states/State';
import World from '@src/world/World';

import data from '@src/data/data';

class LevelState  extends State {
  private world: World;
  private ready: boolean;

  constructor() {
    super();
    this.world = new World(data);
    this.ready = false;
  }

  public async init() {
    console.info('Level initialized');
    await this.world.init();
    this.ready = true;
  }

  public mounted() {
    console.info('Level mounted');
  }

  public dismounted() {

  }

  public update(delta: number) {
    if (this.ready) { this.world.update(delta); }
  }

  public render(alpha: number) {
    if (this.ready) { this.world.render(alpha); }
  }

  public handleKeyboardInput(key: string, active: boolean) {
    this.world.handleKeyboardInput(key, active);
  }

  public handleMousePressed(button: number, active: boolean, position: vec2) {
    this.world.handleMousePressed(button, active, position);
  }

  public handleMouseMove(position: vec2) {
    this.world.handleMouseMove(position);
  }

  public handleFullscreenChange(b: boolean) {
    this.world.handleFullscreenChange(b);
  }

  public handleResize() {
    this.world.handleResize();
  }
}

export default LevelState;
