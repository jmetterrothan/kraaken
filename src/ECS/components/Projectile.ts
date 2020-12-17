import { Component } from "@src/ECS";

interface IProjectileMetadata {
  speed?: number;
  ttl?: number;
}

export class Projectile implements Component {
  public static COMPONENT_TYPE = "projectile";

  public speed: number;
  public ttl: number;

  public constructor(metadata: IProjectileMetadata = {}) {
    this.speed = metadata.speed ?? 0;
    this.ttl = metadata.ttl ?? -1;
  }

  public toString(): string {
    return Projectile.COMPONENT_TYPE;
  }
}
