import State from '@src/states/State';

class LevelState  extends State {
  constructor() {
    super();
  }

  async init() {
    console.info('Level init');
  }

  mounted() {
    console.info('Level mounted');
  }

  dismounted() {
    
  }

  update(delta: number) {

  }

  render(alpha: number) {

  }

  handleKeyboardInput(key: string, active: boolean) {
    
  }

  handleMousePressed(button: number, active: boolean, x: number, y: number) {
    
  }

  handleMouseMove(x: number, y: number) {
    
  }

  handleFullscreenChange(b: boolean) {
    
  }
}

export default LevelState;