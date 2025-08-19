import { _decorator, Component, Node } from "cc";
import { GameQuizTransition } from "../../GameQuizTransition";
const { ccclass, property } = _decorator;

@ccclass("Game3QuizTransition")
export class Game3QuizTransition extends GameQuizTransition {
  @property({ type: Node })
  private question: Node | null = null;

  @property({ type: [Node] })
  private options: Node[] = [];

  public playTransition(show: boolean, onComplete: Function) {
    this.onComplete = onComplete;
    this.showQuestion(this.question, show);
    this.showOptions(this.options, show, false);
  }
}
