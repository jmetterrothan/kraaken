import Stack from '@shared/utility/Stack';

class Lifo<T> extends Stack<T> {
  public push(item: T) {
    this.size++;
    this.list.push(item);
  }

  public pop(): T {
    this.size--;
    return this.list.shift();
  }
}

export default Lifo;
