import { _decorator, Component, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game1Assets")
export class Game1Assets extends Component {
  @property({ type: SpriteFrame })
  public type1AnswerNormalSprite: SpriteFrame;

  @property({ type: SpriteFrame })
  public type1AnswerCorrectSprite: SpriteFrame;

  @property({ type: SpriteFrame })
  public type1AnswerWrongSprite: SpriteFrame;
}
