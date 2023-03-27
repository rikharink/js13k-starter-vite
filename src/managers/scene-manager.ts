import { Scene } from '../scene';

export class SceneManager {
  private sceneStack: Scene[] = [];

  public get currentScene(): Scene {
    if (this.sceneStack.length == 0) {
      throw Error("sceneStack shouldn't be empty");
    }
    const scene = this.sceneStack[this.sceneStack.length - 1];
    return scene;
  }

  public pushScene(scene: Scene): void {
    this.sceneStack.push(scene);
  }

  public popScene(): Scene | undefined {
    if (this.sceneStack.length <= 1) return;
    return this.sceneStack.pop();
  }
}
