import { IConsummableMetadata } from "@src/ECS/components";
import { Component } from "../Component";

type IExpireAction = "kill" | "despawn" | "respawn";

interface IFuseMetadata extends IConsummableMetadata {
  delay?: number;
  expireAction?: IExpireAction;
}

export class Fuse extends Component {
  public static COMPONENT_TYPE = "fuse";

  public readonly delay: number;
  public readonly expireAction: IExpireAction;

  public remainingMs: number;
  public triggered: boolean;

  public constructor(metadata: IFuseMetadata = {}) {
    super();

    this.delay = metadata.delay ?? 0;
    this.expireAction = metadata.expireAction ?? "despawn";

    this.remainingMs = this.delay;
    this.triggered = false;
  }

  public toString(): string {
    return Fuse.COMPONENT_TYPE;
  }
}
