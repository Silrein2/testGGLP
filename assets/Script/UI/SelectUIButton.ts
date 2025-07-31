import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from "cc";
import { ButtonStates } from "../Page/Enums";
const { ccclass, property } = _decorator;

@ccclass("SelectUIButton")
export class SelectUIButton extends Component {
  @property({ type: SpriteFrame })
  private buttonBlueSpriteFrame: SpriteFrame;

  @property({ type: SpriteFrame })
  private buttonYellowSpriteFrame: SpriteFrame;

  private sprite: Sprite;
  private label: Label;
  public data: any;

  onLoad() {
    this.sprite = this.node.getComponent(Sprite);
  }

  public init(data: any) {
    this.data = data;
    this.label = this.node.getComponentInChildren(Label);
    this.label.string = data.text;
  }

  public setState(state: ButtonStates) {
    switch (state) {
      case ButtonStates.Normal:
        this.sprite.spriteFrame = this.buttonBlueSpriteFrame;
        break;
      case ButtonStates.Selected:
        this.sprite.spriteFrame = this.buttonYellowSpriteFrame;
        break;
    }
  }
}
