// Code adapted from https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript#:~:text=Priority%20Queues%20have%20a%20priority,the%20element%20with%20highest%20priority.

const top = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue<T> {
  private heap: T[];
  private comparator: (a: T, b: T) => boolean;

  constructor(comparator = (a: T, b: T) => a > b) {
    this.heap = [];
    this.comparator = comparator;
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.size() == 0;
  }

  public peek(): T {
    return this.heap[top];
  }

  public push(...values: T[]): number {
    values.forEach(value => {
      this.heap.push(value);
      this.siftUp();
    });

    return this.size();
  }

  public pop(): T {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;

    if (bottom > top) {
      this.swap(top, bottom);
    }

    this.heap.pop();
    this.siftDown();

    return poppedValue;
  }

  public contains(predicate: (value: T) => boolean): boolean {
    return this.heap.findIndex(predicate) !== -1;
  }

  public replace(value: T): T {
    const replacedValue = this.peek();

    this.heap[top] = value;
    this.siftDown();

    return replacedValue;
  }

  private greater(i: number, j: number): boolean {
    return this.comparator(this.heap[i], this.heap[j]);
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private siftUp(): void {
    let node = this.size() - 1;

    while (node > top && this.greater(node, parent(node))) {
      this.swap(node, parent(node));
      node = parent(node);
    }
  }

  private siftDown(): void {
    let node = top;

    while (
      (left(node) < this.size() && this.greater(left(node), node)) ||
      (right(node) < this.size() && this.greater(right(node), node))
    ) {
      const maxChild = (right(node) < this.size() && this.greater(right(node), left(node))) ? right(node) : left(node);

      this.swap(node, maxChild);
      node = maxChild;
    }
  }
}

export default PriorityQueue;
