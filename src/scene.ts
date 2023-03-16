import { State } from './state';

export interface Scene {
  pointer: [x: number, y: number];
  clearColor: string;
  getState(): State;
}

export class BaseScene implements Scene {
  public pointer: [x: number, y: number];
  public clearColor: string;

  public constructor(clearColor: string) {
    this.clearColor = clearColor;
    this.pointer = [0, 0];
  }

  public getState(): State {
    return new State(this);
  }
}
