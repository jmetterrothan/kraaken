import { vec2 } from 'gl-matrix';

import State from '@src/states/State';
import Animation from '@src/animation/Animation';
import Sprite from '@src/animation/Sprite';

import imgAtlas32x32 from '@assets/textures/atlas32x32.png';

const LOOT_CHERRY = {
  type: "CHERRY",
  width: 16,
  height: 16,
  offset: { left: 8, top: 8 },
  animations: {
    idle: {
      sprite: "atlas",
      loop:  true,
      keyframes: [
        { row: 1, col:  0, duration: 75 },
        { row: 1, col:  1, duration: 75 },
        { row: 1, col:  2, duration: 75 },
        { row: 1, col:  3, duration: 75 },
        { row: 1, col:  4, duration: 75 },
        { row: 1, col:  5, duration: 75 },
        { row: 1, col:  6, duration: 75 },
      ]
    }
  }
};

class LevelState  extends State {
  private test: Animation;

  constructor() {
    super();
  }

  async init() {
    await Sprite.create(imgAtlas32x32, 'atlas', 32, 32);

    this.test = new Animation('cherry_idle', LOOT_CHERRY.animations.idle);

    console.info('Level initialized');
  }

  mounted() {
    console.info('Level mounted');
  }

  dismounted() {
    
  }

  update(delta: number) {
    this.test.update();
  }

  render(alpha: number) {
    
  }

  handleKeyboardInput(key: string, active: boolean) {
    
  }

  handleMousePressed(button: number, active: boolean, position: vec2) {

  }

  handleMouseMove(position: vec2) {
    
  }

  handleFullscreenChange(b: boolean) {
    
  }
}

export default LevelState;