import { Scene } from '../scenes/scene';

export class SceneManager {
  private sceneStack: Scene[] = [];

  public get currentScene(): Scene {
    if (import.meta.env.DEV && this.sceneStack.length == 0) {
      throw Error("sceneStack shouldn't be empty");
    }
    const scene = this.sceneStack[this.sceneStack.length - 1];
    return scene;
  }

  public replaceScene(scene: Scene): void {
    if (this.sceneStack.length > 0) {
      this.sceneStack.pop();
    }
    this.pushScene(scene);
  }

  public pushScene(scene: Scene): void {
    scene.onPush();
    this.sceneStack.push(scene);
  }

  public popScene(): Scene | undefined {
    if (this.sceneStack.length == 0) return;
    this.currentScene.onPop();
    return this.sceneStack.pop();
  }
}
