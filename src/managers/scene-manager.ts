export interface Scene {
  clearColor: string;
}

export class SceneManager {
  private sceneStack: Scene[] = [];

  public get currentScene(): Scene | undefined {
    if (this.sceneStack.length == 0) return;
    const scene = this.sceneStack[this.sceneStack.length - 1];
    return scene;
  }

  public pushScene(scene: Scene): void {
    this.sceneStack.push(scene);
  }

  public popScene(): Scene | undefined {
    return this.sceneStack.pop();
  }
}
