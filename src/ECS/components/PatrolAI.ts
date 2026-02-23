import { Component } from "@src/ECS";

interface IPatrolAIMetadata {
  probeDistance?: number;
}

export class PatrolAI implements Component {
  public static COMPONENT_TYPE = "patrol_ai";

  public readonly probeDistance: number;

  public constructor({ probeDistance }: IPatrolAIMetadata) {
    this.probeDistance = probeDistance ?? 3;
  }

  public toString(): string {
    return PatrolAI.COMPONENT_TYPE;
  }
}
