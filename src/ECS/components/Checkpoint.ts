import { Component } from "@src/ECS";
import Vector2 from "@src/shared/math/Vector2";
import { IVector2 } from "@src/shared/models/math.model";

type ICheckpointMetadata = {
  moveTo?: IVector2;
  lookAt?: IVector2;
};

export class Checkpoint extends Component {
  static COMPONENT_TYPE = "checkpoint_event";

  public moveTo: Vector2;
  public lookAt: Vector2;

  constructor({ moveTo, lookAt }: ICheckpointMetadata) {
    super();

    this.moveTo = new Vector2(moveTo?.x ?? 0, moveTo?.y ?? 0);
    this.lookAt = new Vector2(lookAt?.x ?? 1, lookAt?.y ?? 1);
  }

  public toString(): string {
    return Checkpoint.COMPONENT_TYPE;
  }
}
