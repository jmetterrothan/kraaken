import Stack from '@shared/utility/Stack';

class Lifo<T> extends Stack<T> {
  public push(item: T) {
    this.size++;
    this.list.push(item);
  }

  public pop(): T {
    const temp: T = this.list.shift();
    if (temp) {
      this.size--;
    }
    return temp;
  }
}

export default Lifo;
