import { _decorator, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game1Type2Slot")
export class Game1Type2Slot extends Component {
  @property({ type: Node })
  slot: Node;

  private label: Label;

  public data: any;

  onLoad() {
    this.label = this.node.getComponentInChildren(Label);
  }

  public init(data: any) {
    this.data = data;
    if (this.label) this.label.string = data.text;
  }
}
