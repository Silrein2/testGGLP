import { _decorator, Button, Component, Game, Label, Node, Sprite } from "cc";
import { Game1Page } from "./Game1Page";
import { getComponentInParent } from "../../../Utils/Utils";
import { ButtonStates } from "../../Enums";
import { Game1Assets } from "./Game1Assets";
const { ccclass, property } = _decorator;

@ccclass("Game1Type1Option")
export class Game1Type1Option extends Component {
  private sprite: Sprite;
  private button: Button;
  private label: Label;
  private game1Page: Game1Page;
  private game1Assets: Game1Assets;

  public data: any;

  onLoad() {
    this.sprite = this.node.getComponent(Sprite);
    this.button = this.node.getComponentInChildren(Button);
    this.label = this.node.getComponentInChildren(Label);
    this.game1Page = getComponentInParent(this.node, Game1Page);
    this.game1Assets = getComponentInParent(this.node, Game1Assets);

    this.button.node.on(Button.EventType.CLICK, this.onClickButton, this);
  }

  public init(data: any) {
    this.data = data;
    this.label.string = data.text;
  }

  public setState(state: ButtonStates) {
    switch (state) {
      case ButtonStates.Normal:
        this.sprite.spriteFrame = this.game1Assets.type1AnswerNormalSprite;
        break;
      case ButtonStates.Correct:
        this.sprite.spriteFrame = this.game1Assets.type1AnswerCorrectSprite;
        break;
      case ButtonStates.Wrong:
        this.sprite.spriteFrame = this.game1Assets.type1AnswerWrongSprite;
        break;
    }
  }

  public onClickButton() {
    this.game1Page.onClickType1Button(this.data);
  }
}
