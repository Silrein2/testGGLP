import { _decorator, BoxCollider2D, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game2Slot")
export class Game2Slot extends Component {
  @property
  public data: number = 0;

  public collider: BoxCollider2D;

  onLoad() {
    this.collider = this.node.getComponent(BoxCollider2D);
  }
}
