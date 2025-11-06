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
import {
  DataManager,
  FakeBossQuestion,
  UserState,
} from "../../../Manager/DataManager";
import { waitForCondition } from "../../../Utils/Utils";

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

  @property({ type: Label })
  private fakeBossLabel: Label | null = null;

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

  private question: FakeBossQuestion | null = null;
  private currentQuestionIndex: number = 0;
  private questions: FakeBossQuestion[] = [];
  private loadedQuestion: boolean = false;
  private currentScore: number = 0;

  onLoad() {
    this.game3Intro = this.node.getComponent(Game3Intro);
    this.game3QuizTransition = this.node.getComponent(Game3QuizTransition);
    this.game3PageTransition = this.node.getComponent(Game3PageTransition);

    /*this.questions = [
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
    ];*/
  }

  protected setPageState() {
    this.pageState = PageStates.Game3;
  }

  public onEnter() {
    this.pageManager.targetGamePageState = this.pageState;
    this.introScreen.active = true;
    this.gameScreen.active = false;
    this.sectionLabel.string =
      LocalizationManager.instance.getLocalizedString("general.welcome");
    this.fakeBossLabel.string =
      LocalizationManager.instance.getLocalizedStringArray(
        "dialogue.game_3.fake_bee_boss",
      )[0];
    this.currentQuestionIndex = 0;
    this.currentScore = 0;
    UIManager.instance.showGameUI(true);
    GameManager.instance.timer.resetTimer();
    this.isIntro = true;
    this.setUI();
    this.showGame(false);
    this.game3Review.init(this);
    this.getQuestion();
    super.onEnter();
  }

  public onPostEnterTransition() {
    super.onPostEnterTransition();
    if (this.isIntro) {
      this.game3Intro.init(this, this.pageManager.stateEnterTransitionDuration);
    } else {
      UIManager.instance.showScoreStartUI(this.pageState, async () => {
        if (!this.loadedQuestion) {
          UIManager.instance.showLoading(true);
          await waitForCondition(this.loadedQuestion);
        }
        UIManager.instance.showLoading(false);
        this.setQuestion();
        this.showGame(true);
        GameManager.instance.timer.startTimer();
      });
    }
  }

  public onExit() {
    super.onExit();
    UIManager.instance.showGameUI(false);
  }

  private async getQuestion() {
    this.loadedQuestion = false;
    await GameManager.instance.quizService.getFakeBossQuestion();
    this.loadedQuestion = true;
  }

  public onClickTransfer(transfer: boolean) {
    if (transfer) {
      this.currentScore += 100;
    }
    this.setUI();
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

  private setUI() {
    const userState: UserState = DataManager.instance.userState;
    //UIManager.instance.gameUI.updateScore(this.currentScore);
    UIManager.instance.gameUI.updateTotalScore(this.currentScore);
  }

  private async endQuiz() {
    GameManager.instance.timer.stopTimer();
    await GameManager.instance.quizService.submitFakeBossScore(
      this.currentScore,
      GameManager.instance.timer.getElapsedTime(),
    );
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
        this.transitionPage(PageStates.Result);
      },
    );
  }

  private setQuestion() {
    this.questions = DataManager.instance.fakeBossQuestions;
    this.question = this.questions[this.currentQuestionIndex];
    this.currentScore = Math.max(0, this.currentScore);
    this.setUI();
    if (this.question == null) {
      this.endQuiz();
      return;
    }
    this.sectionLabel.string = this.question.title;
    this.options.forEach((option: Game3Option, index: number) => {
      option.init(
        this.question.answer_options[index] ?? null,
        this.slotCollider,
        this,
      );
    });
    this.setBlockInput(true);
    this.game3QuizTransition.playTransition(true, () => {
      this.setBlockInput(false);
    });
  }

  public onDropOption(correct: boolean, feedbackText: string) {
    UIManager.instance.playFeedbackUI(correct, feedbackText, () => {});

    const correctScore = 100;
    const wrongScore = -50;
    this.currentScore += correct ? correctScore : wrongScore;
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
