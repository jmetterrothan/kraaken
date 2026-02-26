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
import { debugOverlay } from "@src/Game";

const snapToTileCenter = (value: number, tileSize: number) => {
  return Math.floor(value / tileSize) * tileSize + tileSize / 2;
};

class EntityMode {
  private loaded: boolean;

  public focusedEntity: Entity | null;
  public selectedEntity: Entity | null;
  public previewEntity: Entity | null;

  private editor: EditorState;

  private events: Array<() => void>;

  public constructor(editor: EditorState) {
    this.editor = editor;

    this.events = [];
  }

  public createPreviewEntity(type: string): void {
    const entity = this.editor.currentLevel.world.createEntity(type);

    entity.removeComponent(Placeable.COMPONENT_TYPE);

    const sprite = entity.getComponent(Sprite);

    sprite.renderOptions = {
      ...sprite.renderOptions,
      alpha: 0.65,
    };

    this.editor.currentLevel.world.addEntity(entity);
    this.previewEntity = entity;

    this.editor.currentLevel.cursor.visible = false;
  }

  public removePreviewEntity(): void {
    if (this.previewEntity) {
      this.editor.currentLevel.world.removeEntity(this.previewEntity);
      this.editor.currentLevel.cursor.visible = true;
      this.previewEntity = null;
    }
  }

  public mounted(): void {
    if (this.loaded) {
      throw new Error("Entity mode already mounted");
    }

    debugSvc.set(DebugFlag.GRID, true);
    debugSvc.set(DebugFlag.COLLISION, false);
    debugSvc.set(DebugFlag.PLACEABLE_ENTITIES, false);
    debugSvc.set(DebugFlag.ZONE_ENTITIES, false);

    editorStore.subscribe((state) => {
      this.removePreviewEntity();

      if (state.entityType) {
        this.createPreviewEntity(state.entityType);
      }
    });

    this.events.push(
      this.editor.registerEvent(GameEventTypes.SPAWN_EVENT, (e: GameEvents.SpawnEvent) => {
        const { spawnPoint: spawnPoint, onSuccess, onFailure, pushToStack } = e.detail || {};

        const level = this.editor.currentLevel.world.projectBlueprint.levels.find((level) => level.id === this.editor.currentLevelId);

        if (!level) {
          throw new Error(`Unknown level`);
        }

        const index = level.spawnPoints.findIndex(({ uuid }) => uuid === spawnPoint.uuid);

        try {
          if (index !== -1) {
            const oldSpawnPoint = level.spawnPoints[index];
            level.spawnPoints[index] = spawnPoint;

            if (pushToStack) {
              eventStackSvc.undoStack.push({
                undo: () => driver.spawn(this.editor.currentLevelId, oldSpawnPoint, false),
                redo: () => driver.spawn(this.editor.currentLevelId, spawnPoint, false),
              });
            }
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

          const { uuid, components = {} } = spawnPoint;

          // if entity already exists in the world we update its position
          const entity = this.editor.currentLevel.world.getEntityByUuid(uuid);

          if (entity) {
            if (entity.hasComponent(Position.COMPONENT_TYPE)) {
              const position = entity.getComponent(Position);
              position.fromValues(components?.position?.x ?? 0, components?.position?.y ?? 0);
            }

            if (entity.hasComponent(RigidBody.COMPONENT_TYPE)) {
              const rigidBody = entity.getComponent(RigidBody);
              rigidBody.direction.fromValues(components?.rigid_body?.direction?.x ?? 1, components?.rigid_body?.direction?.y ?? 1);
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

        const level = this.editor.currentLevel.world.projectBlueprint.levels.find((level) => level.id === this.editor.currentLevelId);

        if (!level) {
          throw new Error(`Unknown level "${this.editor.currentLevelId}"`);
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

  public update(_delta: number): void {
    const entities = this.editor.currentLevel.world.getEntities([Placeable.COMPONENT_TYPE, Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, Sprite.COMPONENT_TYPE]);

    this.focusedEntity = null;

    if (!this.previewEntity) {
      for (const entity of entities) {
        if (!entity.visible) {
          continue;
        }

        const bbox = entity.getComponent(BoundingBox);
        const sprite = entity.getComponent(Sprite);

        if (bbox.containsPointWithVector2(this.editor.mouse)) {
          this.focusedEntity = entity;
        }

        sprite.renderOptions.outline = this.focusedEntity === entity || this.selectedEntity === entity;
      }
    } else {
      const entity = this.previewEntity;
      const position = entity.getComponent(Position);

      position.fromValues(Math.round(this.editor.mouse.x), Math.round(this.editor.mouse.y));
    }

    if (this.focusedEntity) {
      const bbox = this.focusedEntity.getComponent(BoundingBox);

      const v = this.editor.currentLevel.world.worldToScreenCoords([bbox.x1 + bbox.width / 2, bbox.y1 - 4]);

      debugOverlay.text(this.focusedEntity.type, v.x, v.y, "center");
    }
  }

  public render(_alpha: number): void {}

  public handleKeyboardInput(_e: KeyboardEvent, _active: boolean): void {}

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    const snapToGrid = e.shiftKey;

    if (active) {
      const coords = this.editor.currentLevel.world.screenToWorldCoords(position);
      const tileSize = this.editor.currentLevel.world.tileMap.getTileSize();

      const tile = this.editor.currentLevel.world.tileMap.getTileAtCoords(coords.x, coords.y);

      if (matchMouseBinding(mouseBindings.editor.entityMode.spawn, e)) {
        const x = tile && snapToGrid ? snapToTileCenter(coords.x, tileSize) : Math.round(coords.x);
        const y = tile && snapToGrid ? snapToTileCenter(coords.y, tileSize) : Math.round(coords.y);

        if (this.selectedEntity) {
          const selectedEntityPos = this.selectedEntity.getComponent(Position);
          selectedEntityPos.fromValues(x, y);

          driver.spawn(
            this.editor.currentLevelId,
            {
              uuid: this.selectedEntity.uuid,
              type: this.selectedEntity.type,
              components: {
                position: { x, y },
                rigid_body: { direction: { x: 1, y: 1 } },
              },
            },
            true
          );

          this.selectedEntity.visible = true;
          this.selectedEntity = null;
          this.focusedEntity = null;

          editorStore.setSelectedEntityType(null);
        } else {
          if (this.focusedEntity && this.focusedEntity.hasComponent(Placeable.COMPONENT_TYPE)) {
            this.selectedEntity = this.focusedEntity;
            this.focusedEntity = null;
            this.selectedEntity.visible = false;
            editorStore.setSelectedEntityType(this.selectedEntity.type);
          } else {
            if (this.editor.state.entityType) {
              driver.spawn(
                this.editor.currentLevelId,
                {
                  uuid: uuidv4(),
                  type: this.editor.state.entityType,
                  components: { position: { x, y }, rigid_body: { direction: { x: 1, y: 1 } } },
                },
                true
              );
            }

            editorStore.setSelectedEntityType(null);
          }
        }
      } else if (matchMouseBinding(mouseBindings.editor.entityMode.despawn, e)) {
        if (this.selectedEntity) {
          this.selectedEntity.visible = true;
          this.selectedEntity = null;
        }
        if (this.focusedEntity) {
          driver.despawn(this.editor.currentLevelId, this.focusedEntity.uuid, true);
          this.focusedEntity = null;
        }

        editorStore.setSelectedEntityType(null);
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

  public handleMouseMove(): void {}
}

export default EntityMode;
