import { Component } from "@src/ECS";

interface IProjectileMetadata {
  speed?: number;
}

export class Projectile implements Component {
  public static COMPONENT_TYPE = "projectile";

  public readonly speed: number;

  public constructor(metadata: IProjectileMetadata = {}) {
    this.speed = metadata.speed ?? 0;
  }

  public toString(): string {
    return Projectile.COMPONENT_TYPE;
  }
}
