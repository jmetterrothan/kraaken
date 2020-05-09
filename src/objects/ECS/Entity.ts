import { Observable, Subject } from "rxjs";

import { Component } from "./Component";

import * as utility from "@src/shared/utility/Utility";

export class Entity {
  public readonly uuid: string;

  private _components: Map<string, Component> = new Map();
  private readonly _componentAddedSubject$ = new Subject<Component>();
  private readonly _componentRemovedSubject$ = new Subject<Component>();

  public constructor(uuid: string = utility.uuid()) {
    this.uuid = uuid;
  }

  public addComponent(component: Component): Entity {
    this._components.set(component.type, component);
    this._componentAddedSubject$.next(component);

    return this;
  }

  public removeComponent(type: string): Entity {
    const component = this._components.get(type);

    if (typeof component !== "undefined") {
      this._components.delete(type);
      this._componentRemovedSubject$.next(component);
    }

    return this;
  }

  public getComponent<T extends Component = Component>(type: string): T | undefined {
    const component = this._components.get(type);
    if (typeof component !== "undefined") {
      return component as T;
    }
    return undefined;
  }

  public hasComponent(type: string): boolean {
    return this._components.has(type);
  }

  get componentAdded$(): Observable<Component> {
    return this._componentAddedSubject$;
  }

  get componentRemoved$(): Observable<Component> {
    return this._componentRemovedSubject$;
  }

  public toString(): string {
    let str = "";
    str += `Entity - ${this.uuid}\n`;
    this._components.forEach((component) => {
      str += component.toString() + "\n";
    });
    return str;
  }
}
