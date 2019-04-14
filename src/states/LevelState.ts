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

  async init() {
    console.info('Level initialized');
    await this.world.init();
  }

  mounted() {
    console.info('Level mounted');
  }

  dismounted() {
    
  }

  update(delta: number) {
    this.world.update(delta);
  }

  render(alpha: number) {
    this.world.render(alpha);
  }

  handleKeyboardInput(key: string, active: boolean) {
    this.world.handleKeyboardInput(key, active);
  }

  handleMousePressed(button: number, active: boolean, position: vec2) {
    this.world.handleMousePressed(button, active, position);
  }

  handleMouseMove(position: vec2) {
    this.world.handleMouseMove(position);
  }

  handleFullscreenChange(b: boolean) {
    this.world.handleFullscreenChange(b);
  }

  handleResize() {
    this.world.handleResize();
  }
}

export default LevelState;