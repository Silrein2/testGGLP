import {
  _decorator,
  Collider2D,
  Component,
  instantiate,
  Layout,
  Node,
  Prefab,
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
const { ccclass, property } = _decorator;

@ccclass("Game2Page")
export class Game2Page extends Page {
  @property({ type: Layout })
  public optionLayout: Layout | null = null;

  @property({ type: Prefab })
  private optionPrefab: Prefab | null = null;

  @property({ type: Collider2D })
  private slotCollider: Collider2D | null = null;

  @property({ type: Game2Tutorial })
  private tutorial: Game2Tutorial | null = null;

  @property({ type: Game2Bee })
  private game2Bee: Game2Bee | null = null;

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

  onLoad() {
    this.game2QuizTransition = this.node.getComponent(Game2QuizTransition);
    this.tutorial.node.active = false;
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
    if (this.currentQuestionIndex >= 3) {
      this.endQuiz();
      return;
    }
    this.showGame(true);
    for (const option of this.options) {
      option.node.destroy();
    }
    this.options = [];
    this.optionLayout.enabled = true;
    for (let i = 0; i < 10; i++) {
      const optionNode = instantiate(this.optionPrefab) as Node;
      this.optionLayout.node.addChild(optionNode);
      const game2Option = optionNode.getComponent(Game2Option);
      game2Option.init(
        "Suspicious Attachment " + (i + 1).toString(),
        this.slotCollider,
        this,
      );
      this.options.push(game2Option);
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
