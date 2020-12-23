import { v4 as uuidv4 } from 'uuid';
import { vec2 } from "gl-matrix";

import { Entity }  from '@src/ECS';
import { RigidBody, BoundingBox, Position, Sprite, Placeable } from "@src/ECS/components";

import EditorState from '@src/states/EditorState';

import { driver } from '@shared/drivers/DriverFactory';

import * as GameEventTypes from "@shared/events/constants";
import * as GameEvents from '@shared/events';

import eventStackSvc from "@shared/services/EventStackService";

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

      const index = this.editor.world.blueprint.level.spawnPoints.findIndex(({ uuid }) => uuid === spawnPoint.uuid);

      try {
        if (index !== -1) {
          this.editor.world.blueprint.level.spawnPoints[index] = spawnPoint;

          // TODO: push to event stack
        } else {
          this.editor.world.spawn(spawnPoint);
          this.editor.world.blueprint.level.spawnPoints.push(spawnPoint);

          if (pushToStack) {
            eventStackSvc.undoStack.push({
              undo: () => driver.despawn(spawnPoint.uuid, false),
              redo: () => driver.spawn(spawnPoint, false),
            });
          }
        }

        // if entity already exists in the world we update its position
        const entity = this.editor.world.getEntityByUuid(spawnPoint.uuid);
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

      const index = this.editor.world.blueprint.level.spawnPoints.findIndex((spawnPoint) => spawnPoint.uuid === uuid);
      const spawnPoint = this.editor.world.blueprint.level.spawnPoints[index];

      try {
        if (!spawnPoint) {
          throw new Error(`Unknown entity with uuid "${uuid}"`);
        }

        this.editor.world.despawn(spawnPoint.uuid);
        this.editor.world.blueprint.level.spawnPoints.splice(index, 1);

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

  public unmounted(): void {

  }
  
  public update(delta: number): void {
    const position = this.editor.cursor.getComponent(Position);
    position.fromValues(this.editor.mouse.x, this.editor.mouse.y);
  }
  
  public render(alpha: number): void {
    
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    
  }
  
  public handleMouseLeftBtnPressed(active: boolean, position: vec2): void {
    if (active) {
      const coords = this.editor.world.screenToCameraCoords(position);
      
      const tile = this.editor.world.tileMap.getTileAtCoords(coords.x, coords.y);
  
      const x = tile.position.x + tile.size / 2;
      const y = tile.position.y + tile.size / 2;
 
      if (this.selectedEntity) {
        const selectedEntityPos = this.selectedEntity.getComponent(Position);
        const placeable = this.selectedEntity.getComponent(Placeable);

        placeable.unfollow();
        selectedEntityPos.fromValues(x, y);

        driver.spawn({ 
          uuid: this.selectedEntity.uuid,
          type: this.selectedEntity.type,
          position: { x, y },
          direction: { x: 1, y: 1 },
        }, true);

        this.selectedEntity = undefined;
      } else {
        if (this.focusedEntity && this.focusedEntity.hasComponent(Placeable.COMPONENT_TYPE)) {
          const focusedEntityPos = this.focusedEntity.getComponent(Position);
          const placeable = this.focusedEntity.getComponent(Placeable);

          placeable.follow(this.editor.cursor, focusedEntityPos);

          this.selectedEntity = this.focusedEntity;
        } else {
          driver.spawn({
            uuid: uuidv4(),
            type: this.editor.state.entityType,
            position: { x, y },
            direction: { x: 1, y: 1 },
          }, true);
        }
      }
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    if (active) {
      if (this.focusedEntity) {
        driver.despawn(this.focusedEntity.uuid, true);
      }
    }
  }

  public handleMouseMove(): void {
    const entities = this.editor.world.getEntities([
      Placeable.COMPONENT_TYPE,
      Position.COMPONENT_TYPE,
      BoundingBox.COMPONENT_TYPE,
      Sprite.COMPONENT_TYPE
    ]);
    
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
