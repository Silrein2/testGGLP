import {
  _decorator,
  Collider2D,
  Component,
  Label,
  Node,
  SpriteFrame,
} from "cc";
import { Page } from "../../Page";
import { PageStates } from "../../Enums";
import { Game3Intro } from "./Game3Intro";
import { UIManager } from "../../../Manager/UIManager";
import { Game3Option } from "./Game3Option";
import { Game3QuizTransition } from "./Game3QuizTransition";
import { Game3Review } from "./Game3Review";
import { Game3PageTransition } from "./Game3PageTransition";
import { GameManager } from "../../../Manager/GameManager";
import { Game3Message } from "./Game3Message";
import { LocalizationManager } from "../../../Manager/LocalizationManager";

const { ccclass, property } = _decorator;

@ccclass("Game3Page")
export class Game3Page extends Page {
  @property({ type: Node })
  private introScreen: Node | null = null;

  @property({ type: Node })
  private gameScreen: Node | null = null;

  @property({ type: Label })
  private sectionLabel: Label | null = null;

  @property({ type: [Game3Option] })
  private options: Game3Option[] = [];

  @property({ type: Collider2D })
  private slotCollider: Collider2D | null = null;

  @property({ type: Game3Review })
  private game3Review: Game3Review | null = null;

  @property({ type: Game3Message })
  public game3Message: Game3Message | null = null;

  @property({ type: SpriteFrame })
  public optionNormalSpriteFrame: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  public optionCorrectSpriteFrame: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  public optionWrongSpriteFrame: SpriteFrame | null = null;

  private game3Intro: Game3Intro | null = null;
  private game3QuizTransition: Game3QuizTransition | null;
  private game3PageTransition: Game3PageTransition | null;
  private isIntro: boolean = false;

  private currentQuestionIndex: number = 0;
  private questions: any[] = [];

  onLoad() {
    this.game3Intro = this.node.getComponent(Game3Intro);
    this.game3QuizTransition = this.node.getComponent(Game3QuizTransition);
    this.game3PageTransition = this.node.getComponent(Game3PageTransition);

    this.questions = [
      {
        title: "Behavioral Inconsistency",
        options: [
          { text: "Habits", correct: true },
          { text: "Tone of voice", correct: false },
          { text: "Expression", correct: true },
          { text: "Name", correct: false },
        ],
      },
      {
        title: "Visual Inconsistency",
        options: [
          { text: "Resolution difference", correct: true },
          { text: "Hairstyle", correct: true },
          { text: "Background", correct: false },
          { text: "Colors", correct: false },
        ],
      },
      {
        title: "Unusual Request",
        options: [
          { text: "Asking for money", correct: true },
          { text: "Urgent payment", correct: true },
        ],
      },
      {
        title: "Emotional Manipulation",
        options: [
          { text: "Urgency", correct: true },
          { text: "Secrecy", correct: true },
          { text: "Embarrassment", correct: false },
        ],
      },
    ];
  }

  protected setPageState() {
    this.pageState = PageStates.Game3;
  }

  public onEnter() {
    this.introScreen.active = true;
    this.gameScreen.active = false;
    this.sectionLabel.string =
      LocalizationManager.instance.getLocalizedString("general.welcome");
    this.currentQuestionIndex = 0;
    UIManager.instance.showGameUI(true);
    GameManager.instance.timer.resetTimer();
    this.isIntro = true;
    this.showGame(false);
    this.game3Review.init(this);
    super.onEnter();
  }

  public onPostEnterTransition() {
    super.onPostEnterTransition();
    if (this.isIntro) {
      this.game3Intro.init(this, this.pageManager.stateEnterTransitionDuration);
    } else {
      UIManager.instance.showScoreStartUI(
        LocalizationManager.instance
          .getLocalizedString("game_3.name")
          .toUpperCase(),
        () => {
          this.setQuestion();
          this.showGame(true);
          GameManager.instance.timer.startTimer();
        },
      );
    }
  }

  public onExit() {
    super.onExit();
    UIManager.instance.showGameUI(false);
  }

  public onClickTransfer(transfer: boolean) {
    const text = transfer
      ? LocalizationManager.instance.getLocalizedString(
          "game_3.dont_transfer_message",
        )
      : LocalizationManager.instance.getLocalizedString(
          "game_3.transfer_message",
        );
    this.game3Message.show(
      true,
      text,
      () => this.startGame(),
      () => {
        this.game3PageTransition.onEnter();
      },
    );
  }

  public startGame() {
    this.isIntro = false;
    this.introScreen.active = false;
    this.gameScreen.active = true;
  }

  private endQuiz() {
    this.game3Message.show(
      true,
      "<size=60>" +
        LocalizationManager.instance.getLocalizedString(
          "game_3.summary_title",
        ) +
        "</size>\n\n" +
        LocalizationManager.instance.getLocalizedString("game_3.summary_body"),
      () => {},
      () => {
        GameManager.instance.timer.stopTimer();
        this.transitionPage(PageStates.Result);
      },
    );
  }

  private setQuestion() {
    const question = this.questions[this.currentQuestionIndex];
    if (question == null) {
      this.endQuiz();
      return;
    }
    this.sectionLabel.string = question.title;
    this.options.forEach((option: Game3Option, index: number) => {
      option.init(question.options[index] ?? null, this.slotCollider, this);
    });
    this.setBlockInput(true);
    this.game3QuizTransition.playTransition(true, () => {
      this.setBlockInput(false);
    });
  }

  public onDropOption(correct: boolean) {
    UIManager.instance.playFeedbackUI(correct, () => {});
  }

  private onClickNext() {
    this.currentQuestionIndex++;
    this.setBlockInput(true);
    this.game3QuizTransition.playTransition(false, () => {
      this.setBlockInput(false);
      this.setQuestion();
    });
  }

  private showGame(show: boolean) {
    //this.sectionLabel.node.active = show;
    this.options.forEach((option: Game3Option) => {
      option.node.active = show;
    });
  }

  private onClickReview() {
    this.game3Review.show();
  }
}
