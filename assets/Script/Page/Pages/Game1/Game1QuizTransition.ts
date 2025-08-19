import { _decorator, Component, Node } from "cc";
import { QuestionTypes } from "../../Enums";
import { GameQuizTransition } from "../../GameQuizTransition";
const { ccclass, property } = _decorator;

@ccclass("Game1QuizTransition")
export class Game1QuizTransition extends GameQuizTransition {
  @property({ type: Node })
  private title: Node | null = null;

  @property({ type: Node })
  private question: Node | null = null;

  @property({ type: [Node] })
  private type1Options: Node[] = [];

  @property({ type: [Node] })
  private type2Options: Node[] = [];

  @property({ type: [Node] })
  private type3Options: Node[] = [];

  onLoad() {}

  public playTransition(
    questionType: QuestionTypes,
    show: boolean,
    onComplete: Function,
  ) {
    this.onComplete = onComplete;
    if (show) {
      this.tweenTitle(this.title);
    }
    switch (questionType) {
      case QuestionTypes.MCQ:
        this.showType1(show);
        break;
      case QuestionTypes.MATCH:
        this.showType2(show);
        break;
      case QuestionTypes.YES_NO:
        this.showType3(show);
        break;
    }
  }

  public showType1(show: boolean) {
    this.showQuestion(this.question, show);
    this.showOptions(this.type1Options, show, true);
  }

  public showType2(show: boolean) {
    this.showQuestion(this.question, show);
    this.showOptions(this.type2Options, show);
  }

  public showType3(show: boolean) {
    this.showQuestion(this.question, show);
    this.showOptions(this.type3Options, show);
  }
}
