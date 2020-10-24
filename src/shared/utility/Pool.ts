import Fifo from "@src/shared/utility/Fifo";

class Pool<T> {
  private objects: Fifo<T> = new Fifo();

  borrow(): T {
    return this.objects.pop();
  }

  release(object: T): void {
    this.objects.push(object);
  }
}

export default Pool;
