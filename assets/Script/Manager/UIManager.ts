import { _decorator, Component, Node } from "cc";
import { SelectUI } from "../UI/SelectUI";
import { FeedbackUI } from "../UI/FeedbackUI";
import { GameUI } from "../UI/GameUI";
import { ScoreStartUI } from "../UI/ScoreStartUI";
const { ccclass, property } = _decorator;

@ccclass("UIManager")
export class UIManager extends Component {
  private static _instance: UIManager | null = null;

  @property({ type: GameUI })
  public gameUI: GameUI | null = null;

  @property({ type: SelectUI })
  private selectUI: SelectUI | null = null;

  @property({ type: Node })
  private loading: Node | null = null;

  @property({ type: FeedbackUI })
  private feedbackUI: FeedbackUI | null = null;

  @property({ type: ScoreStartUI })
  private scoreStartUI: ScoreStartUI | null = null;

  public static get instance(): UIManager {
    if (this._instance) {
      return this._instance;
    }
    return null;
  }

  onLoad() {
    if (UIManager._instance && UIManager._instance !== this) {
      this.destroy();
      return;
    }
    UIManager._instance = this;
  }

  public showGameUI(show: boolean) {
    this.gameUI.node.active = show;
  }

  public showSelectUI(...args: Parameters<SelectUI["show"]>) {
    this.selectUI.show(...args);
  }

  public showLoading(show: boolean) {
    this.loading.active = show;
  }

  public playFeedbackUI(...args: Parameters<FeedbackUI["play"]>) {
    this.feedbackUI.play(...args);
  }

  public showScoreStartUI(...args: Parameters<ScoreStartUI["show"]>) {
    this.scoreStartUI.show(...args);
  }
}
