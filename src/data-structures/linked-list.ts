export class LinkedList<T> {
  public prev: LinkedList<T> | null = null;
  public next: LinkedList<T> | null = null;
  constructor(public value: T) {}
}
