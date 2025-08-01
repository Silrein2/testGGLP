import { _decorator, Component, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game1Assets")
export class Game1Assets extends Component {
  @property({ type: SpriteFrame })
  public type1AnswerNormalSprite: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  public type1AnswerCorrectSprite: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  public type1AnswerWrongSprite: SpriteFrame | null = null;
}
