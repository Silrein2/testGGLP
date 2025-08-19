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

  onLoad() {
    this.game3Intro = this.node.getComponent(Game3Intro);
    this.game3QuizTransition = this.node.getComponent(Game3QuizTransition);
    this.game3PageTransition = this.node.getComponent(Game3PageTransition);
  }

  protected setPageState() {
    this.pageState = PageStates.Game3;
  }

  public onEnter() {
    this.introScreen.active = true;
    this.gameScreen.active = false;
    this.sectionLabel.string = "Welcome!";
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
      UIManager.instance.showScoreStartUI("DEEPFAKE GAME", () => {
        this.setQuestion();
        GameManager.instance.timer.startTimer();
      });
    }
  }

  public onExit() {
    super.onExit();
    UIManager.instance.showGameUI(false);
  }

  public onClickTransfer(transfer: boolean) {}

  public startGame() {
    this.isIntro = false;
    this.introScreen.active = false;
    this.gameScreen.active = true;
  }

  public onClickIntroNext() {
    this.game3PageTransition.onEnter();
  }

  private setQuestion() {
    this.sectionLabel.string = "Behavioral Inconsistency";

    const data = [
      { text: "Habits", correct: true },
      { text: "Tone of Voice", correct: false },
      { text: "Expressions", correct: true },
      { text: "Names", correct: false },
    ];
    this.options.forEach((option: Game3Option, index: number) => {
      option.init(data[index] ?? null, this.slotCollider, this);
    });
    this.showGame(true);
    this.setBlockInput(true);
    this.game3QuizTransition.playTransition(true, () => {
      this.setBlockInput(false);
    });
  }

  public onDropOption(correct: boolean) {
    UIManager.instance.playFeedbackUI(correct, () => {});
  }

  private onClickNext() {
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
