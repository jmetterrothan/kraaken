import { v4 as uuidv4 } from "uuid";

import { Entity } from "@src/ECS";
import { RigidBody, BoundingBox, Position, Sprite, Placeable } from "@src/ECS/components";

import EditorState from "@src/states/EditorState";

import { driver } from "@src/shared/drivers/DriverFactory";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@src/shared/events";

import eventStackSvc from "@src/shared/services/EventStackService";
import MouseButton from "@src/enums/MouseButton";

import { vec2 } from "gl-matrix";

const snapToTileCenter = (value: number, tileSize: number) => {
  return Math.floor(value / tileSize) * tileSize + tileSize / 2;
};

class EntityMode {
  public focusedEntity: Entity | undefined;
  public selectedEntity: Entity | undefined;

  private editor: EditorState;

  public constructor(editor: EditorState) {
    this.editor = editor;
  }

  public mounted(): void {
    this.editor.registerEvent(GameEventTypes.SPAWN_EVENT, (e: GameEvents.SpawnEvent) => {
      const { spawnpoint: spawnPoint, onSuccess, onFailure, pushToStack } = e.detail || {};

      const room = this.editor.currentRoom.world.levelBlueprint.rooms.find((room) => room.id === this.editor.currentRoom.world.levelBlueprint.defaultRoomId);

      if (!room) {
        throw new Error(`Unknown room`);
      }

      const index = room.spawnPoints.findIndex(({ uuid }) => uuid === spawnPoint.uuid);

      try {
        if (index !== -1) {
          room.spawnPoints[index] = spawnPoint;

          // TODO: push to event stack
        } else {
          this.editor.currentRoom.world.spawn(spawnPoint);
          room.spawnPoints.push(spawnPoint);

          if (pushToStack) {
            eventStackSvc.undoStack.push({
              undo: () => driver.despawn(spawnPoint.uuid, false),
              redo: () => driver.spawn(spawnPoint, false),
            });
          }
        }

        // if entity already exists in the world we update its position
        const entity = this.editor.currentRoom.world.getEntityByUuid(spawnPoint.uuid);
        if (entity) {
          if (entity.hasComponent(Position.COMPONENT_TYPE)) {
            const position = entity.getComponent(Position);
            position.fromValues(spawnPoint.position.x, spawnPoint.position.y);
          }

          if (entity.hasComponent(RigidBody.COMPONENT_TYPE)) {
            const rigidBody = entity.getComponent(RigidBody);
            rigidBody.direction.fromValues(spawnPoint.direction.x || 1, spawnPoint.direction.y || 1);
          }
        }

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      } catch (e) {
        if (typeof onFailure === "function") {
          onFailure();
        }
      }
    });

    this.editor.registerEvent(GameEventTypes.DESPAWN_EVENT, (e: GameEvents.DespawnEvent) => {
      const { uuid, pushToStack, onSuccess, onFailure } = e.detail || {};

      const room = this.editor.currentRoom.world.levelBlueprint.rooms.find((room) => room.id === this.editor.currentRoom.world.levelBlueprint.defaultRoomId);

      if (!room) {
        throw new Error(`Unknown room "${this.editor.currentRoom.world.levelBlueprint.defaultRoomId}"`);
      }

      const index = room.spawnPoints.findIndex((spawnPoint) => spawnPoint.uuid === uuid);
      const spawnPoint = room.spawnPoints[index];

      try {
        if (!spawnPoint) {
          throw new Error(`Unknown entity with uuid "${uuid}"`);
        }
        if (!spawnPoint.uuid) {
          throw new Error(`Spawnpoint w/o uuid`);
        }

        this.editor.currentRoom.world.despawn(spawnPoint.uuid);
        room.spawnPoints.splice(index, 1);

        if (pushToStack) {
          eventStackSvc.undoStack.push({
            undo: () => driver.spawn(spawnPoint, false),
            redo: () => driver.despawn(spawnPoint.uuid, false),
          });
        }

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      } catch (e) {
        if (typeof onFailure === "function") {
          onFailure();
        }
      }
    });
  }

  public unmounted(): void {}

  public update(_delta: number): void {
    const position = this.editor.currentRoom.cursor.getComponent(Position);
    position.fromValues(this.editor.mouse.x, this.editor.mouse.y);
  }

  public render(_alpha: number): void {}

  public handleKeyboardInput(_key: string, _active: boolean): void {}

  public handleMouseInput(button: MouseButton, shiftKey: boolean, _ctrlKey: boolean, active: boolean, position: vec2): void {
    const snapToGrid = shiftKey;

    if (active) {
      const coords = this.editor.currentRoom.world.screenToCameraCoords(position);
      const tileSize = this.editor.currentRoom.world.tileMap.getTileSize();

      const tile = this.editor.currentRoom.world.tileMap.getTileAtCoords(coords.x, coords.y);
      switch (button) {
        case MouseButton.LEFT: {
          const x = tile && snapToGrid ? snapToTileCenter(coords.x, tileSize) : Math.round(coords.x);
          const y = tile && snapToGrid ? snapToTileCenter(coords.y, tileSize) : Math.round(coords.y);

          if (this.selectedEntity) {
            const selectedEntityPos = this.selectedEntity.getComponent(Position);
            const placeable = this.selectedEntity.getComponent(Placeable);

            placeable.unfollow();
            selectedEntityPos.fromValues(x, y);

            driver.spawn(
              {
                uuid: this.selectedEntity.uuid,
                type: this.selectedEntity.type,
                position: { x, y },
                direction: { x: 1, y: 1 },
              },
              true
            );

            this.selectedEntity = undefined;
          } else {
            if (this.focusedEntity && this.focusedEntity.hasComponent(Placeable.COMPONENT_TYPE)) {
              const focusedEntityPos = this.focusedEntity.getComponent(Position);
              const placeable = this.focusedEntity.getComponent(Placeable);

              placeable.follow(this.editor.currentRoom.cursor, focusedEntityPos);

              this.selectedEntity = this.focusedEntity;
            } else {
              driver.spawn(
                {
                  uuid: uuidv4(),
                  type: this.editor.state.entityType,
                  position: { x, y },
                  direction: { x: 1, y: 1 },
                },
                true
              );
            }
          }

          break;
        }

        case MouseButton.RIGHT: {
          if (this.focusedEntity) {
            driver.despawn(this.focusedEntity.uuid, true);
          }
          break;
        }
      }
    }
  }

  public handleMouseMove(): void {
    const entities = this.editor.currentRoom.world.getEntities([Placeable.COMPONENT_TYPE, Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, Sprite.COMPONENT_TYPE]);

    this.focusedEntity = undefined;

    entities.forEach((entity) => {
      const bbox = entity.getComponent(BoundingBox);
      const sprite = entity.getComponent(Sprite);

      if (bbox.containsPointWithVector2(this.editor.mouse)) {
        this.focusedEntity = entity;
      }

      sprite.renderOptions.outline = this.focusedEntity === entity || this.selectedEntity === entity;
    });
  }
}

export default EntityMode;
