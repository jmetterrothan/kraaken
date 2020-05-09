import { vec2 } from "gl-matrix";

import State from "@src/states/State";
import World from "@src/world/World";
import { loadData } from "@src/world/World";

class LevelState extends State {
  public readonly id: number;

  private ready: boolean;
  private world: World;

  constructor(id: number = 1) {
    super();

    this.id = id;
    this.ready = false;
  }

  public async init() {
    console.info("Level initialized");

    const data = await loadData(this.id);
    this.world = new World(data);

    await this.world.init();

    this.ready = true;
  }

  public mounted() {
    console.info("Level mounted");
  }

  public unmounted() {
    console.info("Level unmounted");
  }

  public update(delta: number) {
    if (this.ready) {
      this.world.update(delta);
    }
  }

  public render(alpha: number) {
    if (this.ready) {
      this.world.render(alpha);
    }
  }

  public handleKeyboardInput(key: string, active: boolean) {
    if (this.ready) {
      this.world.handleKeyboardInput(key, active);
    }
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2) {
    if (this.ready) {
      this.world.handleMouseLeftBtnPressed(active, position);
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2) {
    if (this.ready) {
      this.world.handleMouseMiddleBtnPressed(active, position);
    }
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2) {
    if (this.ready) {
      this.world.handleMouseRightBtnPressed(active, position);
    }
  }

  public handleMouseMove(position: vec2) {
    if (this.ready) {
      this.world.handleMouseMove(position);
    }
  }

  public handleFullscreenChange(b: boolean) {
    if (this.ready) {
      this.world.handleFullscreenChange(b);
    }
  }

  public handleResize() {
    if (this.ready) {
      this.world.handleResize();
    }
  }
}

export default LevelState;
