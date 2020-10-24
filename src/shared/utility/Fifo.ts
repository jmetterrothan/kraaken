import Stack from "@shared/utility/Stack";

class Fifo<T> extends Stack<T> {
  public push(item: T): void {
    this.size++;
    this.list.push(item);
  }

  public pop(): T {
    const temp: T = this.list.pop();
    if (temp) {
      this.size--;
    }
    return temp;
  }

  public first(): Readonly<T> | undefined {
    if (this.size >= 1) {
      return this.list[this.size - 1];
    }
    return undefined;
  }
}

export default Fifo;
