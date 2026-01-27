import Stack from "@src/shared/utility/Stack";

class Lifo<T> extends Stack<T> {
  public push(item: T): void {
    this.size++;
    this.list.push(item);
  }

  public pop(): T | null {
    const temp = this.list.shift() ?? null;
    if (temp) {
      this.size--;
    }
    return temp;
  }

  public first(): Readonly<T> | null {
    if (this.size >= 1) {
      return this.list[0];
    }
    return null;
  }
}

export default Lifo;
