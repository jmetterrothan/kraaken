import Component from "@src/ECS/Component";

import { PROJECTILE_COMPONENT } from "../types";

interface IProjectileMetadata {
  speed?: number;
  ttl?: number;
}

export class Projectile implements Component {
  public readonly type: symbol = PROJECTILE_COMPONENT;

  public speed: number;
  public ttl: number;

  public constructor(metadata: IProjectileMetadata = {}) {
    this.speed = metadata.speed ?? 0;
    this.ttl = metadata.ttl ?? -1;
  }

  public toString(): string {
    return `Projectile`;
  }
}
