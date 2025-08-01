import { _decorator, Component, Label, Node } from "cc";
import { DataManager, Quizzes } from "../Manager/DataManager";
import { timeString } from "../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("ScoreStartUI")
export class ScoreStartUI extends Component {
  @property({ type: Label })
  private gameLabel: Label | null = null;

  @property({ type: Label })
  private highScoreLabel: Label | null = null;

  @property({ type: Label })
  private timeLabel: Label | null = null;

  private onClose: Function | null = null;

  public show(game: string, onClose: Function) {
    const quizzes: Quizzes = DataManager.instance.userState.quizzes;
    this.gameLabel.string = game;
    this.highScoreLabel.string = quizzes.highest_score_quizzes.toString();
    this.timeLabel.string = timeString(
      quizzes.total_seconds_at_highest_score_quizzes,
    );
    this.onClose = onClose;
    this.node.active = true;
  }

  private onClickClose() {
    this.onClose();
    this.node.active = false;
  }
}
