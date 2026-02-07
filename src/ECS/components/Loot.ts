import { IVector2 } from "@src/shared/models/math.model";
import { Component } from "../Component";

type ILootDropMetadata = {
  type?: string;
  chance?: number;
  min?: number;
  max?: number;
};

type IDrop = {
  type: string;
  chance: number;
  min: number;
  max: number;
};

type IScatter = {
  angle: number;
  impulse: IVector2;
};

interface ILootMetadata {
  drops?: ILootDropMetadata[];
  scatter?: {
    angle: number;
    impulse: IVector2;
  };
}

export class Loot extends Component {
  public static COMPONENT_TYPE = "loot";

  public readonly drops: IDrop[];
  public readonly scatter: IScatter;

  public dropped: boolean;

  public constructor(metadata: ILootMetadata = {}) {
    super();

    const drops = metadata.drops?.map<IDrop>(({ type = "void", min = 1, max = 1, chance = 1 }) => ({ type, min, max, chance: Math.max(chance, 0) })) ?? [];
    const sum = drops.reduce((acc, value) => acc + value.chance, 0);

    // normalize drop chances 0...1
    this.drops = drops.map((drop) => ({ ...drop, chance: sum > 0 ? drop.chance / sum : 0 })).sort((a, b) => b.chance - a.chance);
    this.scatter = { angle: metadata?.scatter?.angle ?? 0, impulse: { x: metadata?.scatter?.impulse?.x ?? 0, y: metadata?.scatter?.impulse?.y ?? 0 } };

    this.dropped = false;
  }

  public toString(): string {
    return Loot.COMPONENT_TYPE;
  }
}
