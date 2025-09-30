import { _decorator, Component, Node } from "cc";
import { Game2Slot } from "./Game2Slot";
const { ccclass, property } = _decorator;

@ccclass("Game2Question")
export class Game2Question extends Component {
  public options: string[] = [];
  public slots: Game2Slot[] = [];

  onLoad() {
    this.slots = this.node.getComponentsInChildren(Game2Slot);
  }
}
