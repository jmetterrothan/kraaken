import { vec2 } from "gl-matrix";

import State, { StateOptions } from "@src/states/State";

export type MenuStateOptions = StateOptions;

class MenuState extends State<MenuStateOptions> {
  public async init(_o: StateOptions): Promise<void> {}

  public mounted(): void {}

  public unmounted(): void {}

  public update(_delta: number): void {}

  public render(_alpha: number): void {}

  public handleGamepadInput(): void {}

  public handleKeyboardInput(_e: KeyboardEvent, _active: boolean): void {}

  public handleMouseInput(_e: MouseEvent, _active: boolean, _position: vec2): void {}

  public handleMouseMove(_e: MouseEvent, _position: vec2): void {}

  public handleFullscreenChange(_b: boolean): void {}

  public handleResize(): void {}
}

export default MenuState;
