import { Position } from "@src/ECS/components";
import { Entity } from "@src/ECS";

import EditorState from "@src/states/EditorState";

import { TileLayer } from "@src/shared/models/tilemap.model";

import { driver } from "@src/shared/drivers/DriverFactory";

import { vec2 } from "gl-matrix";

import mouseBindings, { matchMouseBinding } from "@src/mouseBindings";

class CollisionMode {
  public focusedEntity: Entity | undefined;
  public selectedEntity: Entity | undefined;

  private editor: EditorState;

  public constructor(editor: EditorState) {
    this.editor = editor;
  }

  public mounted(): void {}

  public unmounted(): void {}

  public update(_delta: number): void {
    const cursorPosition = this.editor.currentRoom.cursor.getComponent(Position);
    const gridCursorPosition = this.editor.currentRoom.gridCursor.getComponent(Position);

    cursorPosition.fromValues(this.editor.mouse.x, this.editor.mouse.y);

    const tile = this.editor.currentRoom.world.tileMap.getTileAtCoords(this.editor.mouse.x, this.editor.mouse.y);

    if (tile) {
      const x = tile.position.x + tile.size / 2;
      const y = tile.position.y + tile.size / 2;
      gridCursorPosition.fromValues(x, y);
    }
  }

  public render(_alpha: number): void {}

  public handleKeyboardInput(_e: KeyboardEvent, _active: boolean): void {}

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    if (active) {
      const coords = this.editor.currentRoom.world.screenToCameraCoords(position);

      if (matchMouseBinding(mouseBindings.editor.collisionMode.place, e)) {
        driver.place({ layerId: TileLayer.L0, tileTypeId: 1, coords: [coords] }, true);
      } else if (matchMouseBinding(mouseBindings.editor.collisionMode.erase, e)) {
        driver.place({ layerId: TileLayer.L0, tileTypeId: 0, coords: [coords] }, true);
      }
    }
  }

  public handleMouseMove(): void {}
}

export default CollisionMode;
