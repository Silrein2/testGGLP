import { _decorator, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game1Type2Slot")
export class Game1Type2Slot extends Component {
  @property({ type: Node })
  slot: Node;

  private label: Label;

  public data: string;

  onLoad() {
    this.label = this.node.getComponentInChildren(Label);
  }

  public init(data: string) {
    this.node.active = data !== null;
    this.data = data;
    if (this.label) this.label.string = data;
  }
}
