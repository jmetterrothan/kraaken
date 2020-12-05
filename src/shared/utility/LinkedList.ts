export class Node<T> {
  public data: T;
  public next: Node<T>;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }

  public toString(): string {
    return `${this.data}`;
  }
}

class LinkedList<T> {
  public head: Node<T>;

  constructor(node: Node<T>) {
    this.head = node;
  }

  /**
   * Add a new node at the start
   */
  unshift(data: T): void {
    const node = new Node(data);
  
    node.next = this.head;
    this.head = node;
  }

  /**
   * Remove the first node
   */
  shift(): void {
    const node = this.head;
    this.head = node.next;
  }

  /**
   * Add a new node at the end
   */
  push(data: T): void {
    const node = new Node(data);

    if (this.head === null) {
      this.head = node;
      return;
    }

    let lastNode: Node<T> = this.head;
    while (lastNode.next !== null) {
      lastNode = lastNode.next;
    }

    lastNode.next = node;
  }

  /**
   * Remove the last node
   */
  pop(): void {
    if (this.head === null) {
      return;
    }

    let currentNode: Node<T> = this.head;
    while (currentNode !== null) {
      const next = currentNode.next;

      if (next !== null && next.next === null) {
        currentNode.next = null;
        return;
      }

      currentNode = currentNode.next;
    }
  }

  /**
   * Delete the first node that is evaluated true by the predicate
   */
  delete(predicate: (node: Node<T>) => boolean): void {
    if (this.head === null) {
      return;
    }

    if (predicate(this.head) === true) {
      this.head = this.head.next;
      return;
    }

    let prevNode = this.head;
    let currentNode = this.head.next;

    while(currentNode !== null) {
      if (predicate(currentNode)) {
        if (prevNode !== null) {
          prevNode.next = currentNode.next;
          return;
        }
      }

      prevNode = currentNode;
      currentNode = currentNode.next;
    }
  }

  insertAfter(prevNode: Node<T>, data: T): void {
    if (prevNode === null) {
      throw new Error(`The given previous node is null`);
    }

    const node = new Node(data);
    const tmpNode = prevNode.next;
    prevNode.next = node;
    node.next = tmpNode;
  }

  find(predicate: (node: Node<T>) => boolean, currentNode: Node<T> = this.head): Node<T> | null {
    while (currentNode !== null) {
      if (predicate(currentNode) === true) {
        return currentNode;
      }
      currentNode = currentNode.next;
    }
  }

  each(callback: (node: Node<T>) => void, currentNode: Node<T> = this.head): void {
    while (currentNode !== null) {
      callback(currentNode);
      currentNode = currentNode.next;
    }
  }

  reset(): void {
    this.head = null;
  }

  public toString(currentNode: Node<T> = this.head): string {
    let out = '';
   
    this.each((node) => {
      out += node.toString();

      if (node.next !== null) {
        out += ' -> ';
      }
    }, currentNode);
    
    return out;
  }
}

export default LinkedList;
