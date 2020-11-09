import Component from "@src/ECS/Component";

import { EDIT_MODE_COMPONENT } from "../types";

export class EditMode implements Component {
  public readonly type: symbol = EDIT_MODE_COMPONENT;

  public toString(): string {
    return `Edit mode`;
  }
}
