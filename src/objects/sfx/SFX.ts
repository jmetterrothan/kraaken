import AnimatedObject2d from "@src/objects/AnimatedObject2d";
import Vector2 from "@src/shared/math/Vector2";
import Fifo from "@src/shared/utility/Fifo";
import World from "@src/world/World";

class SFX extends AnimatedObject2d {
  public static DATA = {};

  public static createPoolIfNotExists(name: string) {
    if (!SFX.POOL.has(name)) {
      SFX.POOL.set(name, new Fifo<SFX>());
    }
  }

  public static create(
    x: number,
    y: number,
    direction: Vector2,
    name: string
  ): SFX {
    SFX.createPoolIfNotExists(name);

    const sfx = SFX.POOL.get(name).pop();
    if (!sfx) {
      return new SFX(x, y, direction, name);
    }

    sfx.objectWillBeAdded(x, y);
    return sfx;
  }

  private static POOL: Map<string, Fifo<SFX>> = new Map<string, Fifo<SFX>>();
  private reference: string;

  constructor(x: number, y: number, direction: Vector2, reference: string) {
    super(x, y, direction, SFX.DATA[reference]);
    this.reference = reference;
  }

  public update(world: World, delta: number) {
    super.update(world, delta);
    this.updateAnimation(world, delta);

    if (!this.isDirty() && this.animation.playedOnce()) {
      this.setDirty(true);
    }
  }

  public objectWillBeAdded(x: number, y: number): void {
    this.setPosition(x, y, true);
    this.setDirty(false);
    this.setVisible(true);
    this.animation.reset();
  }

  public objectWillBeRemoved(): void {
    SFX.createPoolIfNotExists(this.reference);

    SFX.POOL.get(this.reference).push(this);
  }
}

export default SFX;
