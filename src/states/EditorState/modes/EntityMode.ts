import { v4 as uuidv4 } from 'uuid';
import { vec2 } from "gl-matrix";

import  Entity  from '@src/ECS/Entity';
import { BoundingBox, Position, Sprite } from "@src/ECS/components";
import { EDIT_MODE_COMPONENT, POSITION_COMPONENT, SPRITE_COMPONENT, BOUNDING_BOX_COMPONENT } from "@src/ECS/types";

import EditorState from '@src/states/EditorState';

import * as GameEventTypes from "@shared/events/constants";
import dispatch, * as GameEvents from '@shared/events';

import eventStackSvc from "@shared/services/EventStackService";

class EntityMode {
  public selectedEntity: Entity | undefined;

  private editor: EditorState;

  public constructor(editor: EditorState) {
    this.editor = editor;
  }

  public mounted(): void {
    this.editor.registerEvent(GameEventTypes.SPAWN_EVENT, (e: GameEvents.SpawnEvent) => {
      const { spawnpoint, onSuccess, onFailure, pushToStack } = e.detail || {};

      try {
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
    const position = this.editor.cursor.getComponent<Position>(POSITION_COMPONENT);
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

      dispatch(GameEvents.spawnEvent(uuidv4(), this.editor.state.entityType, { x, y }));
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    if (active) {
      if (this.selectedEntity) {
        dispatch(GameEvents.despawnEvent(this.selectedEntity.uuid));
      }
    }
  }

  public handleMouseMove(): void {
    const entities = this.editor.world.getEntities([EDIT_MODE_COMPONENT, POSITION_COMPONENT, BOUNDING_BOX_COMPONENT, SPRITE_COMPONENT]);
    
    this.selectedEntity = undefined;

    entities.forEach((entity) => {
      const bbox = entity.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);
      const sprite = entity.getComponent<Sprite>(SPRITE_COMPONENT);

      if (bbox.containsPoint(this.editor.mouse)) {
        this.selectedEntity = entity;
        sprite.renderOptions.outline = true;
      }
      else {
        sprite.renderOptions.outline = false;
      }
    });
  }
}

export default EntityMode;
