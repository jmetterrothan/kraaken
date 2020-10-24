import { vec2 } from "gl-matrix";

import State from "@src/states/State";

class MenuState extends State<void> {
  constructor() {
    super();
  }

  public async init(): Promise<void> {}

  public mounted(): void {}

  public unmounted(): void {}

  public update(delta: number): void {}

  public render(alpha: number): void {}

  public handleKeyboardInput(key: string, active: boolean): void {}

  public handleMouseLeftBtnPressed(active: boolean, position: vec2): void {}

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {}

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {}

  public handleMouseMove(position: vec2): void {}

  public handleFullscreenChange(b: boolean): void {}

  public handleResize(): void {}
}

export default MenuState;
