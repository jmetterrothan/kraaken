import { Component } from "@src/ECS";

interface IPatrolAIMetadata {
  probeDistance?: number;
  autoOrient?: boolean;
}

export class PatrolAI implements Component {
  public static COMPONENT_TYPE = "patrol_ai";

  public readonly probeDistance: number;
  public readonly autoOrient: boolean;

  public constructor({ probeDistance, autoOrient }: IPatrolAIMetadata) {
    this.probeDistance = probeDistance ?? 0;
    this.autoOrient = autoOrient ?? false;
  }

  public toString(): string {
    return PatrolAI.COMPONENT_TYPE;
  }
}
