import { v4 as uuidv4 } from 'uuid';
import { vec2 } from "gl-matrix";

import { Entity }  from '@src/ECS';
import { BoundingBox, Position, Sprite, Placeable } from "@src/ECS/components";

import EditorState from '@src/states/EditorState';

import * as GameEventTypes from "@shared/events/constants";
import dispatch, * as GameEvents from '@shared/events';

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
      const { spawnpoint, onSuccess, onFailure, pushToStack } = e.detail || {};

      const index = this.editor.world.blueprint.level.spawnPoints.findIndex(({ uuid }) => uuid === spawnpoint.uuid);

      try {
        if (index !== -1) {
          this.editor.world.blueprint.level.spawnPoints[index] = spawnpoint;

          // TODO: push to event stack
        } else {
          this.editor.world.spawn(spawnpoint);
          this.editor.world.blueprint.level.spawnPoints.push(spawnpoint);

          if (pushToStack) {
            eventStackSvc.undoStack.push({
              undo: GameEvents.despawnEvent(spawnpoint.uuid, false),
              redo: GameEvents.spawnEvent(
                spawnpoint.uuid, //
                spawnpoint.type,
                spawnpoint.position,
                spawnpoint.direction,
                spawnpoint.debug,
                false
              ),
            });
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
            undo: GameEvents.spawnEvent(
              spawnPoint.uuid, //
              spawnPoint.type,
              spawnPoint.position,
              spawnPoint.direction,
              spawnPoint.debug,
              false
            ),
            redo: GameEvents.despawnEvent(spawnPoint.uuid, false),
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

        dispatch(GameEvents.spawnEvent(this.selectedEntity.uuid, this.selectedEntity.type, { x, y }));

        this.selectedEntity = undefined;
      } else {
        if (this.focusedEntity && this.focusedEntity.hasComponent(Placeable.COMPONENT_TYPE)) {
          const focusedEntityPos = this.focusedEntity.getComponent(Position);
          const placeable = this.focusedEntity.getComponent(Placeable);
          placeable.follow(this.editor.cursor, focusedEntityPos);

          this.selectedEntity = this.focusedEntity;
        } else {
          dispatch(GameEvents.spawnEvent(uuidv4(), this.editor.state.entityType, { x, y }));
        }
      }
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    if (active) {
      if (this.focusedEntity) {
        dispatch(GameEvents.despawnEvent(this.focusedEntity.uuid));
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
