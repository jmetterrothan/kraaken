import { Observable } from 'rxjs';
import { forkJoin, Subject, Subscription } from 'rxjs';

import Fifo from "@src/shared/utility/Fifo";

interface EventStackItem { undo: CustomEvent<any>; redo: CustomEvent<any> }

/**
 * Fifo list you can subscribe to changes
 */
class EventStack<T> extends Fifo<T> {
  private subject: Subject<any>;

  constructor() {
    super();

    this.subject = new Subject();
  }

  public push(item: T): void {
    super.push(item);
    this.subject.next(item);
  }

  public pop(): T {
    const item = super.pop();
    this.subject.next(item);
    return item;
  }

  public subscribe(callback): Subscription {
    return this.subject.subscribe({
      next: callback
    });
  }
}

class EventStackService {
  public undoStack: EventStack<EventStackItem>;
  public redoStack: EventStack<EventStackItem>;

  constructor() {
    this.undoStack = new EventStack();
    this.redoStack = new EventStack();
  }

  public reset() {
    if (!this.undoStack.isEmpty) {
      this.undoStack = new EventStack();
    }
    if (!this.redoStack.isEmpty) {
      this.redoStack = new EventStack();
    }
  }

  public subscribe(callback: () => void): Subscription {
    const stackChange = forkJoin([
      this.undoStack.subscribe(callback),
      this.redoStack.subscribe(callback)
    ]);

    return stackChange.subscribe();
  }
}

const eventStackSvc = new EventStackService();
export default eventStackSvc;
