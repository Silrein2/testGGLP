import { _decorator, Component, Node, UIOpacity } from "cc";
import { GameQuizTransition } from "../../GameQuizTransition";
import { Game2Bee } from "./Game2Bee";
const { ccclass, property } = _decorator;

@ccclass("Game2QuizTransition")
export class Game2QuizTransition extends GameQuizTransition {
  @property({ type: Node })
  private question: Node | null = null;

  @property({ type: Game2Bee })
  private game2Bee: Game2Bee | null = null;

  private options: Node[] = [];

  public playTransition(
    show: boolean,
    options: Node[],
    text: string,
    skipBee: boolean,
    onComplete: Function,
  ) {
    this.options = options;
    this.onComplete = onComplete;
    //this.showQuestion(this.question, show);
    if (show) {
      for (const option of options) {
        option.getComponent(UIOpacity).opacity = 0;
      }
      if (skipBee) {
        this.showOptions(this.options, show, false);
        return;
      }
      this.game2Bee.enter(text, true, () => {
        this.showOptions(this.options, show, false);
      });
    } else {
      this.game2Bee.exit(() => {
        this.showOptions(this.options, show, false);
      });
    }
  }
}
