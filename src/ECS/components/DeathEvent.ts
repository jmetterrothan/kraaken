import { Component } from "@src/ECS";

type IDeathEventMetadata = {};

export class DeathEvent extends Component {
  static COMPONENT_TYPE = "death_event";

  public amount: number;

  constructor(_metadata: IDeathEventMetadata) {
    super();
  }

  public toString(): string {
    return DeathEvent.COMPONENT_TYPE;
  }
}
