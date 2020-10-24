import Stack from "@shared/utility/Stack";

class Lifo<T> extends Stack<T> {
  public push(item: T): void {
    this.size++;
    this.list.push(item);
  }

  public pop(): T | undefined {
    const temp: T = this.list.shift();
    if (temp) {
      this.size--;
    }
    return temp;
  }

  public first(): Readonly<T> | undefined {
    if (this.size >= 1) {
      return this.list[0];
    }
    return undefined;
  }
}

export default Lifo;
