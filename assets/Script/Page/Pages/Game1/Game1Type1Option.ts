import { _decorator, Button, Component, Game, Label, Node, Sprite } from "cc";
import { Game1Page } from "./Game1Page";
import { getComponentInParent } from "../../../Utils/Utils";
import { ButtonStates } from "../../Enums";
import { Game1Assets } from "./Game1Assets";
import { MCQOption } from "../../../Manager/DataManager";
const { ccclass, property } = _decorator;

@ccclass("Game1Type1Option")
export class Game1Type1Option extends Component {
  private sprite: Sprite | null = null;
  private button: Button | null = null;
  private label: Label | null = null;
  private game1Page: Game1Page | null = null;
  private game1Assets: Game1Assets | null = null;

  public data: MCQOption | null = null;

  onLoad() {
    this.sprite = this.node.getComponent(Sprite);
    this.button = this.node.getComponentInChildren(Button);
    this.label = this.node.getComponentInChildren(Label);
    this.game1Assets = getComponentInParent(this.node, Game1Assets);

    this.button.node.on(Button.EventType.CLICK, this.onClickButton, this);
  }

  public init(data: MCQOption, game1Page: Game1Page) {
    this.node.active = data !== null;
    this.game1Page = game1Page;
    this.data = data;
    this.label.string = data.text;
    this.setState(ButtonStates.Normal);
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
