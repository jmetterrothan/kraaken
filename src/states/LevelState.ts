import { vec2 } from 'gl-matrix';

import State from '@src/states/State';
import World from '@src/world/World';

import data from '@src/data';

class LevelState  extends State {
  private world: World;

  constructor() {
    super();
    this.world = new World(data);
  }

  public async init() {
    console.info('Level initialized');
    await this.world.init();
  }

  public mounted() {
    console.info('Level mounted');
  }

  public dismounted() {

  }

  public update(delta: number) {
    this.world.update(delta);
  }

  public render(alpha: number) {
    this.world.render(alpha);
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
