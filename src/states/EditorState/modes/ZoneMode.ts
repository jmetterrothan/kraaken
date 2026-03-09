import { vec2, vec4 } from "gl-matrix";

import EditorState from "@src/states/EditorState";

import { debugStore } from "@src/shared/services/Debug";
import { DebugFlag } from "@src/enums/DebugFlag";
import { BoundingBox, EventZone, Position } from "@src/ECS/components";
import { Entity } from "@src/ECS";
import mouseBindings, { matchMouseBinding } from "@src/mouseBindings";
import { debugOverlay } from "@src/Game";

export const ACTIVE_ZONE_OUTLINE_COLOR: vec4 = [0.6, 0.4, 1, 1];
export const ACTIVE_ZONE_FILL_COLOR: vec4 = [0.6, 0.4, 1, 0.1];

class ZoneMode {
  private loaded: boolean;

  public focusedEntity: Entity | null;
  public selectedEntity: Entity | null;

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

    debugStore.set(DebugFlag.GRID, true);
    debugStore.set(DebugFlag.COLLISION, false);
    debugStore.set(DebugFlag.PLACEABLE_ENTITIES, false);
    debugStore.set(DebugFlag.ZONE_ENTITIES, true);

    this.editor.currentLevel.cursor.visible = true;
    this.editor.currentLevel.world.grid.showSelection = false;

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

  public update(_delta: number): void {
    const zones = this.editor.currentLevel.world.getEntities([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, EventZone.COMPONENT_TYPE]);

    this.focusedEntity = null;

    for (const zone of zones) {
      const eventZone = zone.getComponent(EventZone);
      const bbox = zone.getComponent(BoundingBox);

      if (bbox.containsPointWithVector2(this.editor.mouse)) {
        this.focusedEntity = zone;
      }

      if (this.selectedEntity === zone || this.focusedEntity === zone) {
        bbox.helper.outlineColor = ACTIVE_ZONE_OUTLINE_COLOR;
        bbox.helper.fillColor = ACTIVE_ZONE_FILL_COLOR;
      } else {
        bbox.helper.outlineColor = bbox.helper.defaultOutlineColor;
        bbox.helper.fillColor = bbox.helper.defaultFillColor;
      }

      const v = this.editor.currentLevel.world.worldToScreenCoords([bbox.x1 + bbox.width / 2, bbox.y1 + bbox.height / 2]);
      debugOverlay.text(`${eventZone.type}`, v.x, v.y, "center");
    }
  }

  public render(_alpha: number): void {}

  public handleKeyboardInput(_e: KeyboardEvent, _active: boolean): void {}

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    const worldPos = this.editor.currentLevel.world.screenToWorldCoords(position);
    const grid = this.editor.currentLevel.world.grid;

    if (active) {
      grid.beginSelection(worldPos);

      if (matchMouseBinding(mouseBindings.editor.zoneMode.select, e)) {
        this.selectedEntity = this.focusedEntity;
      } else {
        this.selectedEntity = null;
      }
    } else {
      const coords = grid.selection;
      if (coords.length === 0) {
        return;
      }

      grid.endSelection();
    }
  }

  public handleMouseMove(_e: MouseEvent, position: vec2): void {
    const worldPos = this.editor.currentLevel.world.screenToWorldCoords(position);

    this.editor.currentLevel.world.grid.setCursorPosition(worldPos);
    this.editor.currentLevel.world.grid.updateSelection(worldPos);
  }
}

export default ZoneMode;
