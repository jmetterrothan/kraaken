import { Observable, Subject } from "rxjs";
import { v4 as uuidv4 } from 'uuid';

import Component from "./Component";

class Entity {
  public readonly type: string;
  public readonly uuid: string;

  private _components: Map<symbol, Component> = new Map();
  private readonly _componentAddedSubject$ = new Subject<Component>();
  private readonly _componentRemovedSubject$ = new Subject<Component>();

  public constructor(type: string, uuid: string = uuidv4()) {
    this.type = type;
    this.uuid = uuid;
  }

  public addComponent(component: Component): Entity {
    this._components.set(component.type, component);
    this._componentAddedSubject$.next(component);

    return this;
  }

  public removeComponent(type: symbol): Entity {
    const component = this._components.get(type);

    if (typeof component !== "undefined") {
      this._components.delete(type);
      this._componentRemovedSubject$.next(component);
    }

    return this;
  }

  public getComponent<T extends Component = Component>(type: symbol): T | undefined {
    const component = this._components.get(type);
    if (typeof component !== "undefined") {
      return component as T;
    }
    return undefined;
  }

  public hasComponent(type: symbol): boolean {
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
    str += `Entity - ${this.type}\n`;
    str += `UUID: ${this.uuid}\n`;
    this._components.forEach((component) => {
      str += component.toString() + "\n";
    });
    return str;
  }
}

export default Entity;
