import { Observable, Subject } from "rxjs";

import Entity from "@src/ECS/Entity";
import Component from "@src/ECS/Component";

class Bundle {
  public static generateId(components: ReadonlyArray<symbol>): string {
    return components.map((type) => type.toString()).join("-");
  }

  private readonly _componentTypes: ReadonlyArray<symbol>;

  private readonly _entities: Entity[] = [];
  private readonly _entityAddedSubject$ = new Subject<Entity>();
  private readonly _entityRemovedSubject$ = new Subject<Entity>();

  public constructor(componentTypes: ReadonlyArray<symbol>) {
    this._componentTypes = [...componentTypes];
  }

  private match(entity: Entity): boolean {
    if (this.has(entity)) {
      return false;
    }

    return this._componentTypes.reduce((acc, componentType) => {
      return acc && entity.hasComponent(componentType);
    }, true);
  }

  public has(entity: Entity): boolean {
    return this._entities.findIndex((temp) => temp.uuid === entity.uuid) !== -1;
  }

  private add(entity: Entity): void {
    this._entities.push(entity);
    this._entityAddedSubject$.next(entity);
  }

  public addIfMatch(entity: Entity): void {
    if (this.match(entity)) {
      this.add(entity);
    }
  }

  public remove(entity: Entity): void {
    const index = this._entities.findIndex((temp) => temp === entity);
    if (index !== -1) {
      this._entities.splice(index, 1);
      this._entityRemovedSubject$.next(entity);
    }
  }

  public onComponentAdded(entity: Entity, component: Component): void {
    this.addIfMatch(entity);
  }

  public onComponentRemoved(entity: Entity, component: Component): void {
    if (this._componentTypes.findIndex((temp) => temp === component.type) !== -1) {
      this.remove(entity);
    }
  }

  get entityAdded$(): Observable<Entity> {
    return this._entityAddedSubject$;
  }

  get entityRemoved$(): Observable<Entity> {
    return this._entityRemovedSubject$;
  }

  public getEntities(): ReadonlyArray<Entity> {
    return this._entities;
  }
}

export default Bundle;
