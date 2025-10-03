import {
  _decorator,
  Component,
  instantiate,
  Layout,
  Node,
  Prefab,
  ScrollView,
  SpriteFrame,
} from "cc";
import { PageStates } from "../../Enums";
import { Page } from "../../Page";
import { GameManager } from "../../../Manager/GameManager";
import { UIManager } from "../../../Manager/UIManager";
import { Game2Option } from "./Game2Option";
import { Game2QuizTransition } from "./Game2QuizTransition";
import { Game2Tutorial } from "./Game2Tutorial";
import { Game2Bee } from "./Game2Bee";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
import { Game2Question } from "./Game2Question";
import { shuffleArray } from "../../../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("Game2Page")
export class Game2Page extends Page {
  @property({ type: Layout })
  public optionLayout: Layout | null = null;

  @property({ type: Prefab })
  private optionPrefab: Prefab | null = null;

  @property({ type: Game2Tutorial })
  private tutorial: Game2Tutorial | null = null;

  @property({ type: Game2Bee })
  private game2Bee: Game2Bee | null = null;

  @property({ type: [Game2Question] })
  public game2Questions: Game2Question[] = [];

  @property({ type: [ScrollView] })
  public scrollViews: ScrollView[] = [];

  @property({ type: SpriteFrame })
  public optionNormalSpriteFrame: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  public optionCorrectSpriteFrame: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  public optionWrongSpriteFrame: SpriteFrame | null = null;

  private options: Game2Option[] = [];
  private game2QuizTransition: Game2QuizTransition | null = null;
  private firstQuestion: boolean = false;

  private currentQuestionIndex: number = 0;

  private questions: any[] = [];

  onLoad() {
    this.game2QuizTransition = this.node.getComponent(Game2QuizTransition);
    this.tutorial.node.active = false;

    this.questions = [
      {
        question: this.game2Questions[0],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Curiosity-piquing Subject" },
          { id: 4, text: "Suspicious Email Address" },
          { id: 5, text: "External Email Warning" },
          { id: 6, text: "Triggered strong emotion" },
          { id: 7, text: "Generic Greeting" },
          { id: 8, text: "Unusual Request" },
          { id: 9, text: "Sense of Urgency" },
          { id: 10, text: "Unexpected Email" },
          { id: 11, text: "Suspicious Link" },
        ],
      },
      {
        question: this.game2Questions[1],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Curiosity-piquing Subject" },
          { id: 4, text: "Suspicious Email Address" },
          { id: 5, text: "External Email Warning" },
          { id: 6, text: "Pretend to be Amway" },
          { id: 7, text: "Generic Greeting" },
          { id: 8, text: "Unusual Request" },
          { id: 9, text: "Sense of Urgency" },
          { id: 10, text: "Unexpected Email" },
          { id: 11, text: "Suspicious Link" },
        ],
      },
      {
        question: this.game2Questions[2],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Curiosity-piquing Subject" },
          { id: 4, text: "Suspicious Email Address" },
          { id: 5, text: "External Email Warning" },
          { id: 6, text: "Pretend to be Amway" },
          { id: 7, text: "Generic Greeting" },
          { id: 8, text: "Unusual Request" },
          { id: 9, text: "Sense of Urgency" },
          { id: 10, text: "Unexpected Email" },
          { id: 11, text: "Suspicious Link" },
          { id: 12, text: "Trigger Fear Emotion" },
        ],
      },
      {
        question: this.game2Questions[3],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Suspicious Email Address" },
          { id: 4, text: "External Email Warning" },
          { id: 5, text: "Pretend to be Amway" },
          { id: 6, text: "Generic Greeting" },
          { id: 7, text: "Unusual Request" },
          { id: 8, text: "Sense of Urgency" },
          { id: 9, text: "Unexpected Email" },
          { id: 10, text: "Suspicious Link" },
          { id: 11, text: "Trigger Nervous Emotion" },
        ],
      },
      {
        question: this.game2Questions[4],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Suspicious Email Address" },
          { id: 4, text: "External Email Warning" },
          { id: 5, text: "Asking for sensitive information" },
          { id: 6, text: "Generic Greeting" },
          { id: 7, text: "Unusual Request" },
          { id: 8, text: "Sense of Urgency" },
          { id: 9, text: "Unexpected Email" },
          { id: 10, text: "Suspicious Link" },
          { id: 11, text: "Trigger strong emotion" },
        ],
      },
    ];
  }

  protected setPageState() {
    this.pageState = PageStates.Game2;
  }

  public onEnter() {
    super.onEnter();
    this.showGame(false);
    this.firstQuestion = true;
    this.currentQuestionIndex = 0;
    GameManager.instance.timer.resetTimer();
    UIManager.instance.showGameUI(true);
  }

  public onPostEnterTransition() {
    super.onPostEnterTransition();
    UIManager.instance.showScoreStartUI(
      LocalizationManager.instance
        .getLocalizedString("game_2.name")
        .toUpperCase(),
      async () => {
        this.game2Bee.setText("Q1", true);
        this.setQuestion();
        GameManager.instance.timer.startTimer();
      },
    );
  }

  public onExit() {
    super.onExit();
    UIManager.instance.showGameUI(false);
  }

  private endQuiz() {
    GameManager.instance.timer.stopTimer();
    this.transitionPage(PageStates.Result);
  }

  private setQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.endQuiz();
      return;
    }
    const question = this.questions[this.currentQuestionIndex];
    this.showGame(true);
    for (const option of this.options) {
      option.node.destroy();
    }
    this.options = [];
    this.optionLayout.enabled = true;

    for (let i = 0; i < this.questions.length; i++) {
      this.questions[i].question.node.active = i === this.currentQuestionIndex;
    }

    const shuffledOptions = shuffleArray(question.options);
    for (let i = 0; i < shuffledOptions.length; i++) {
      const optionNode = instantiate(this.optionPrefab) as Node;
      this.optionLayout.node.addChild(optionNode);
      const game2Option = optionNode.getComponent(Game2Option);
      game2Option.init(shuffledOptions[i], question.question.slots, this);
      this.options.push(game2Option);
    }

    for (const scrollView of this.scrollViews) {
      scrollView.scrollToTop(0.01);
    }

    this.scheduleOnce(() => {
      this.optionLayout.enabled = false;
      for (const game2Option of this.options) {
        game2Option.setInitialPosition();
      }
    }, 0.1);

    this.setBlockInput(true);
    this.game2QuizTransition.playTransition(
      true,
      this.optionNodes(),
      "Q" + (this.currentQuestionIndex + 1).toString(),
      this.firstQuestion,
      () => {
        this.setBlockInput(false);
        this.showTutorial();
      },
    );
  }

  public onDropOption(correct: boolean) {
    UIManager.instance.playFeedbackUI(correct, () => {});
  }

  private onClickSafe() {
    this.currentQuestionIndex++;
    this.setBlockInput(true);
    this.game2QuizTransition.playTransition(
      false,
      this.optionNodes(),
      "",
      false,
      () => {
        this.setBlockInput(false);
        this.setQuestion();
      },
    );
  }

  private showGame(show: boolean) {
    this.optionLayout.node.active = show;
  }

  private showTutorial() {
    if (this.firstQuestion) {
      this.firstQuestion = false;
      this.tutorial.show();
    }
  }

  public optionNodes(): Node[] {
    const nodes: Node[] = [];
    for (const option of this.options) {
      nodes.push(option.node);
    }
    return nodes;
  }
}
