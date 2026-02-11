export type IKeyBindingMetadata = {
  code: KeyboardEvent["code"];
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

export const IS_MAC_PLATFORM = /Mac|iPhone|iPad|iPod/.test(navigator.platform);

const map: Record<string, string> = {
  NumpadSubtract: "-",
  NumpadAdd: "+",
  PageDown: "Page Down",
  PageUp: "Page Up",
  Space: "Space",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Escape: "Esc",
  Enter: "Enter",
  Tab: "Tab",
  Backspace: "Backspace",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  ControlLeft: "Ctrl",
  ControlRight: "Ctrl",
  AltLeft: "Alt",
  AltRight: "Alt",
  MetaLeft: "Cmd",
  MetaRight: "Cmd",
};

function codeToLabel(code: string) {
  if (map[code]) return map[code];

  // KeyboardEvent.code patterns
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return "Num " + code.slice(6);

  return code;
}

class KeyBinding {
  public readonly code: string;
  public readonly ctrl: boolean;
  public readonly shift: boolean;
  public readonly alt: boolean;
  public readonly meta: boolean;

  public constructor({ code, ctrl, shift, alt, meta }: IKeyBindingMetadata) {
    this.code = code;
    this.ctrl = ctrl ?? false;
    this.shift = shift ?? false;
    this.alt = alt ?? false;
    this.meta = meta ?? false;
  }

  public match(e: KeyboardEvent) {
    const matching = e.code === this.code && e.shiftKey === this.shift && e.ctrlKey === this.ctrl && e.altKey === this.alt && e.metaKey === this.meta;

    if (matching) {
      e.preventDefault();
      e.stopPropagation();
    }
    return matching;
  }

  public toString() {
    const parts: string[] = [];
    if (this.ctrl) parts.push("Ctrl");
    if (this.alt) parts.push(IS_MAC_PLATFORM ? "Option" : "Alt");
    if (this.shift) parts.push("Shift");
    if (this.meta) parts.push(IS_MAC_PLATFORM ? "Cmd" : "Meta");

    parts.push(codeToLabel(this.code));
    return parts.join("+");
  }
}

export default KeyBinding;
