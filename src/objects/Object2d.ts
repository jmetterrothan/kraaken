import { mat3 } from 'gl-matrix';

import Vector2 from '@shared/math/Vector2';
import { uuid } from '@shared/utility/Utility';

class Object2d {
  public previousPosition: Vector2;
  protected visible: boolean;

  protected modelMatrix: mat3;
  private position: Vector2;

  private uuid: string;
  private dirty: boolean;
  private shouldUpdateModelMatrix: boolean;

  private children: Map<string, Object2d>;

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this.previousPosition = new Vector2(x, y);

    this.uuid = uuid();
    this.visible = true;
    this.dirty = false;

    this.modelMatrix = mat3.create();
    this.shouldUpdateModelMatrix = true;

    this.children = new Map<string, Object2d>();
  }

  public update(delta: number) {
    if (this.shouldUpdateModelMatrix) {
      this.modelMatrix = mat3.fromTranslation(mat3.create(), this.position.toGlArray());
      this.shouldUpdateModelMatrix = false;

      console.log(`${this.toString()} | model matrix`);
    }

    this.children.forEach((child) => child.update(delta));
  }

  public render(viewProjectionMatrix: mat3) {
    this.children.forEach((child) => child.render(viewProjectionMatrix));
  }

  public add(object: Object2d) {
    this.children.set(object.getUUID(), object);
  }

  public remove(object: Object2d) {
    this.children.delete(object.getUUID());
  }

  public setPosition(x: number, y: number) {
    this.shouldUpdateModelMatrix = this.shouldUpdateModelMatrix || this.position.x !== x || this.position.y !== y;

    this.previousPosition.copy(this.position);

    this.position.x = x;
    this.position.y = y;
  }

  public setPositionFromVector2(v: Vector2) { this.setPosition(v.x, v.y); }

  public setX(x: number) { this.setPosition(x, this.position.y); }
  public setY(y: number) { this.setPosition(this.position.x, y); }

  public getX(): number { return this.position.x; }
  public getY(): number { return this.position.y; }

  public getPosition(): Vector2 { return this.position.clone(); }
  public getModelMatrix(): mat3 { return this.modelMatrix; }

  public isVisible(): boolean { return this.visible; }

  public isDirty(): boolean { return this.dirty; }

  public setDirty(b: boolean) {
    this.dirty = b;
  }

  public hasChangedPosition(): boolean { return this.position.notEquals(this.previousPosition); }

  public toString(): string { return this.uuid; }
  public getUUID(): string { return this.uuid; }
}

export default Object2d;