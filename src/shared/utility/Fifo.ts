import Stack from '@shared/utility/Stack';

class Fifo<T> extends Stack<T> {
  public push(item: T) {
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
}

export default Fifo;
