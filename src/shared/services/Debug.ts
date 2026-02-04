import { DebugFlag } from "@src/enums/DebugFlag";

class Debug {
  public constructor(private _flags: number = DebugFlag.NONE) {}

  enabled(flag: DebugFlag): boolean {
    return (this._flags & flag) !== 0;
  }

  set(flag: DebugFlag, on: boolean): void {
    if (on) {
      // | (OR) take all where bit is 1 from both
      this._flags |= flag;
    } else {
      // & (AND) take all common 1
      // ~ (NOT) inverse
      this._flags &= ~flag;
    }
  }

  toggle(flag: DebugFlag): void {
    // ^ (XOR)
    this._flags ^= flag;
  }

  get flags(): number {
    return this._flags;
  }

  set flags(v: number) {
    this._flags = v;
  }
}

export const debugSvc = new Debug();
