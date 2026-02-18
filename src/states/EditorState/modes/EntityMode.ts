import { v4 as uuidv4 } from "uuid";

import { Entity } from "@src/ECS";
import { RigidBody, BoundingBox, Position, Sprite, Placeable } from "@src/ECS/components";

import EditorState from "@src/states/EditorState";

import { driver } from "@src/shared/drivers/DriverFactory";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@src/shared/events";

import eventStackSvc from "@src/shared/services/EventStackService";

import { vec2 } from "gl-matrix";
import editorStore from "../editorStore";
import mouseBindings, { matchMouseBinding } from "@src/mouseBindings";
import { DebugFlag } from "@src/enums/DebugFlag";
import { debugSvc } from "@src/shared/services/Debug";

const snapToTileCenter = (value: number, tileSize: number) => {
  return Math.floor(value / tileSize) * tileSize + tileSize / 2;
};

class EntityMode {
  private loaded: boolean;

  public focusedEntity: Entity | undefined;
  public selectedEntity: Entity | undefined;

  private editor: EditorState;

  private events: Array<() => void>;

  public constructor(editor: EditorState) {
    this.editor = editor;

    this.events = [];
  }

  public mounted(): void {
    if (this.loaded) {
      throw new Error("Entity mode already mounted");
    }

    debugSvc.set(DebugFlag.GRID, true);
    debugSvc.set(DebugFlag.COLLISION, false);
    debugSvc.set(DebugFlag.ENTITIES, true);

    this.events.push(
      this.editor.registerEvent(GameEventTypes.SPAWN_EVENT, (e: GameEvents.SpawnEvent) => {
        const { spawnpoint: spawnPoint, onSuccess, onFailure, pushToStack } = e.detail || {};

        const level = this.editor.currentLevel.world.projectBlueprint.levels.find((level) => level.id === this.editor.currentLevel.world.projectBlueprint.defaultLevelId);

        if (!level) {
          throw new Error(`Unknown level`);
        }

        const index = level.spawnPoints.findIndex(({ uuid }) => uuid === spawnPoint.uuid);

        try {
          if (index !== -1) {
            level.spawnPoints[index] = spawnPoint;

            // TODO: push to event stack
          } else {
            this.editor.currentLevel.world.spawn(spawnPoint);
            level.spawnPoints.push(spawnPoint);

            if (pushToStack) {
              eventStackSvc.undoStack.push({
                undo: () => driver.despawn(this.editor.currentLevelId, spawnPoint.uuid, false),
                redo: () => driver.spawn(this.editor.currentLevelId, spawnPoint, false),
              });
            }
          }

          // if entity already exists in the world we update its position
          const entity = this.editor.currentLevel.world.getEntityByUuid(spawnPoint.uuid);
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
      })
    );

    this.events.push(
      this.editor.registerEvent(GameEventTypes.DESPAWN_EVENT, (e: GameEvents.DespawnEvent) => {
        const { uuid, pushToStack, onSuccess, onFailure } = e.detail || {};

        const level = this.editor.currentLevel.world.projectBlueprint.levels.find((level) => level.id === this.editor.currentLevel.world.projectBlueprint.defaultLevelId);

        if (!level) {
          throw new Error(`Unknown level "${this.editor.currentLevel.world.projectBlueprint.defaultLevelId}"`);
        }

        const index = level.spawnPoints.findIndex((spawnPoint) => spawnPoint.uuid === uuid);
        const spawnPoint = level.spawnPoints[index];

        try {
          if (!spawnPoint) {
            throw new Error(`Unknown entity with uuid "${uuid}"`);
          }
          if (!spawnPoint.uuid) {
            throw new Error(`Spawnpoint w/o uuid`);
          }

          this.editor.currentLevel.world.despawn(spawnPoint.uuid);
          level.spawnPoints.splice(index, 1);

          if (pushToStack) {
            eventStackSvc.undoStack.push({
              undo: () => driver.spawn(this.editor.currentLevelId, spawnPoint, false),
              redo: () => driver.despawn(this.editor.currentLevelId, spawnPoint.uuid, false),
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
      })
    );

    this.loaded = true;

    console.debug("Entity mode mounted");
  }

  public unmounted(): void {
    this.events.map((callback) => {
      callback();
    });

    this.loaded = false;

    console.debug("Entity mode unmounted");
  }

  public update(_delta: number): void {}

  public render(_alpha: number): void {}

  public handleKeyboardInput(_e: KeyboardEvent, _active: boolean): void {}

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    const snapToGrid = e.shiftKey;

    if (active) {
      const coords = this.editor.currentLevel.world.screenToCameraCoords(position);
      const tileSize = this.editor.currentLevel.world.tileMap.getTileSize();

      const tile = this.editor.currentLevel.world.tileMap.getTileAtCoords(coords.x, coords.y);

      if (matchMouseBinding(mouseBindings.editor.entityMode.spawn, e)) {
        const x = tile && snapToGrid ? snapToTileCenter(coords.x, tileSize) : Math.round(coords.x);
        const y = tile && snapToGrid ? snapToTileCenter(coords.y, tileSize) : Math.round(coords.y);

        if (this.selectedEntity) {
          const selectedEntityPos = this.selectedEntity.getComponent(Position);
          const placeable = this.selectedEntity.getComponent(Placeable);

          placeable.unfollow();
          selectedEntityPos.fromValues(x, y);

          driver.spawn(
            this.editor.currentLevelId,
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

            placeable.follow(this.editor.currentLevel.cursor, focusedEntityPos);

            this.selectedEntity = this.focusedEntity;
            editorStore.setSelectedEntityType(this.selectedEntity.type);
          } else {
            driver.spawn(
              this.editor.currentLevelId,
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
      } else if (matchMouseBinding(mouseBindings.editor.entityMode.despawn, e)) {
        if (this.focusedEntity) {
          driver.despawn(this.editor.currentLevelId, this.focusedEntity.uuid, true);
        }
      } else if (matchMouseBinding(mouseBindings.editor.entityMode.test, e)) {
        const player = this.editor.currentLevel.world.player;

        if (player) {
          const playerPosition = player.getComponent(Position);

          const startTile = this.editor.currentLevel.world.tileMap.getTileAtCoords(coords.x, coords.y);
          const goalTile = this.editor.currentLevel.world.tileMap.getTileAtCoords(playerPosition.x, playerPosition.y);

          if (startTile && goalTile) {
            this.editor.currentLevel.world.tileMap.aStar(startTile, goalTile);
          }
        }
      }
    }
  }

  public handleMouseMove(): void {
    const entities = this.editor.currentLevel.world.getEntities([Placeable.COMPONENT_TYPE, Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, Sprite.COMPONENT_TYPE]);

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
