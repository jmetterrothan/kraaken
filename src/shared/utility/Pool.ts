import Fifo from "@src/shared/utility/Fifo";

class Pool<T> {
  private objects: Fifo<T> = new Fifo();

  borrow() {
    return this.objects.pop();
  }

  release(object: T) {
    this.objects.push(object);
  }
}

export default Pool;
