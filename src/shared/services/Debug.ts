import { DebugFlag } from "@src/enums/DebugFlag";
import { BehaviorSubject } from "rxjs";

export const debugStore = (() => {
  const subject = new BehaviorSubject<number>(DebugFlag.NONE);

  const subscribe = (listener: () => void) => {
    const subscription = subject.subscribe(listener);
    return () => subscription.unsubscribe();
  };

  const getSnapshot = () => {
    return subject.value;
  };

  const enabled = (flag: DebugFlag): boolean => {
    return (subject.value & flag) !== 0;
  };

  const set = (flag: DebugFlag, on: boolean) => {
    const state = getSnapshot();

    if (on) {
      // | (OR) take all where bit is 1 from both
      subject.next(state | flag);
    } else {
      // & (AND) take all common 1
      // ~ (NOT) inverse
      subject.next(state & ~flag);
    }
  };

  const toggle = (flag: DebugFlag): void => {
    const state = getSnapshot();
    // ^ (XOR)
    subject.next(state ^ flag);
  };

  return {
    subscribe,
    getSnapshot,
    enabled,
    set,
    toggle,
  };
})();
