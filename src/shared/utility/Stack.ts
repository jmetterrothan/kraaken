abstract class Stack<T> {
  protected list: T[];
  protected size: number;

  constructor() {
    this.list = [];
    this.size = 0;
  }

  /**
   * @param {T} item
   */
  public abstract push(item: T): void;

  /**
   * @return {T}
   */
  public abstract pop(): T;

  /**
   * @return {T}
   */
  public abstract first(): Readonly<T> | undefined;

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
