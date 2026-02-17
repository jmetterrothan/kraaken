import { Component } from "@src/ECS";

type IRespawnEventMetadata = Record<string, unknown>;

export class RespawnEvent extends Component {
  static COMPONENT_TYPE = "respawn_event";

  public amount: number;

  constructor(_metadata: IRespawnEventMetadata) {
    super();
  }

  public toString(): string {
    return RespawnEvent.COMPONENT_TYPE;
  }
}
