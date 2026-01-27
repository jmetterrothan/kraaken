abstract class Stack<T> {
  protected list: T[];
  protected size: number;

  constructor(initialList: T[] = []) {
    this.list = initialList;
    this.size = 0;
  }

  /**
   * @param {T} item
   */
  public abstract push(item: T): void;

  /**
   * @return {T}
   */
  public abstract pop(): T | null;

  /**
   * @return {T}
   */
  public abstract first(): Readonly<T> | null;

  /**
   * @return {boolean}
   */
  public get isEmpty(): boolean {
    return this.size === 0;
  }

  public get length(): number {
    return this.size;
  }
}

export default Stack;
