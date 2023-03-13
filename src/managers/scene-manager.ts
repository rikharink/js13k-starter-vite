export interface Scene {
  clearColor: string;
}

export class SceneManager {
  private _sceneStack: Scene[] = [];

  public get currentScene(): Scene | undefined {
    if (this._sceneStack.length == 0) return;
    const scene = this._sceneStack[this._sceneStack.length - 1];
    return scene;
  }

  public pushScene(scene: Scene) {
    this._sceneStack.push(scene);
  }

  public popScene(): Scene | undefined {
    return this._sceneStack.pop();
  }
}
