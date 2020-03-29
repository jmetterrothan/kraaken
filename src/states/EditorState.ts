import { vec2 } from "gl-matrix";

import State from "@src/states/State";

class EditorState extends State {
  constructor() {
    super();
  }

  public async init() {}

  public mounted() {}

  public dismounted() {}

  public update(delta: number) {}

  public render(alpha: number) {}

  public handleKeyboardInput(key: string, active: boolean) {}

  public handleMouseLeftBtnPressed(active: boolean, position: vec2) {}

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2) {}

  public handleMouseRightBtnPressed(active: boolean, position: vec2) {}

  public handleMouseMove(position: vec2) {}

  public handleFullscreenChange(b: boolean) {}

  public handleResize() {}
}

export default EditorState;
