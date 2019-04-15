import Stack from '@shared/utility/Stack';

class Fifo<T> extends Stack<T> {
  public push(item: T) {
    this.size++;
    this.list.push(item);
  }

  public pop(): T {
    this.size--;
    return this.list.pop();
  }
}

export default Fifo;
