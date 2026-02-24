import { vec2 } from "gl-matrix";

import EditorState from "@src/states/EditorState";

import { debugSvc } from "@src/shared/services/Debug";
import { DebugFlag } from "@src/enums/DebugFlag";

class ZoneMode {
  private loaded: boolean;

  private editor: EditorState;

  private events: Array<() => void>;

  public constructor(editor: EditorState) {
    this.editor = editor;

    this.events = [];
  }

  public mounted(): void {
    if (this.loaded) {
      throw new Error("Zone mode already mounted");
    }

    debugSvc.set(DebugFlag.GRID, true);
    debugSvc.set(DebugFlag.COLLISION, false);
    debugSvc.set(DebugFlag.PLACEABLE_ENTITIES, false);
    debugSvc.set(DebugFlag.ZONE_ENTITIES, true);

    this.loaded = true;

    console.debug("Zone mode mounted");
  }

  public unmounted(): void {
    this.events.map((callback) => {
      callback();
    });

    this.loaded = false;

    console.debug("Zone mode unmounted");
  }

  public update(_delta: number): void {}

  public render(_alpha: number): void {}

  public handleKeyboardInput(_e: KeyboardEvent, _active: boolean): void {}

  public handleMouseInput(_e: MouseEvent, active: boolean, position: vec2): void {
    const worldPos = this.editor.currentLevel.world.screenToCameraCoords(position);
    const grid = this.editor.currentLevel.world.grid;

    if (active) {
      grid.beginSelection(worldPos);
    } else {
      const coords = grid.selection;
      if (coords.length === 0) {
        return;
      }

      grid.endSelection();
    }
  }

  public handleMouseMove(_e: MouseEvent, position: vec2): void {
    const worldPos = this.editor.currentLevel.world.screenToCameraCoords(position);

    this.editor.currentLevel.world.grid.setCursorPosition(worldPos);
    this.editor.currentLevel.world.grid.updateSelection(worldPos);
  }
}

export default ZoneMode;
