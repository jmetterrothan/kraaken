import { Entity } from "@src/ECS";

import EditorState from "@src/states/EditorState";

import { TileLayer } from "@src/shared/models/tilemap.model";

import { driver } from "@src/shared/drivers/DriverFactory";

import { vec2 } from "gl-matrix";

import mouseBindings, { matchMouseBinding } from "@src/mouseBindings";
import { debugSvc } from "@src/shared/services/Debug";
import { DebugFlag } from "@src/enums/DebugFlag";

class CollisionMode {
  public focusedEntity: Entity | undefined;
  public selectedEntity: Entity | undefined;

  private editor: EditorState;

  private events: Array<() => void>;

  public constructor(editor: EditorState) {
    this.editor = editor;

    this.events = [];
  }

  public mounted(): void {
    debugSvc.set(DebugFlag.GRID, true);
    debugSvc.set(DebugFlag.COLLISION, true);
    debugSvc.set(DebugFlag.ENTITIES, false);
  }

  public unmounted(): void {
    this.events.map((callback) => {
      callback();
    });
  }

  public update(_delta: number): void {}

  public render(_alpha: number): void {}

  public handleKeyboardInput(_e: KeyboardEvent, _active: boolean): void {}

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    const worldPos = this.editor.currentRoom.world.screenToCameraCoords(position);
    const grid = this.editor.currentRoom.world.grid;

    if (active) {
      grid.beginSelection(worldPos);
    } else {
      const coords = grid.selection;
      if (coords.length === 0) {
        return;
      }

      if (matchMouseBinding(mouseBindings.editor.collisionMode.place, e)) {
        driver.place({ layerId: TileLayer.L0, tileTypeId: 1, coords }, true);
      } else if (matchMouseBinding(mouseBindings.editor.collisionMode.erase, e)) {
        driver.place({ layerId: TileLayer.L0, tileTypeId: 0, coords }, true);
      }

      grid.endSelection();
    }
  }

  public handleMouseMove(_e: MouseEvent, position: vec2): void {
    const worldPos = this.editor.currentRoom.world.screenToCameraCoords(position);

    this.editor.currentRoom.world.grid.setCursorPosition(worldPos);
    this.editor.currentRoom.world.grid.updateSelection(worldPos);
  }
}

export default CollisionMode;
