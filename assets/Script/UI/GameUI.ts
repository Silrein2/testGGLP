import { _decorator, Component, Label, Node } from "cc";
import { timeString } from "../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("GameUI")
export class GameUI extends Component {
  @property({ type: Label })
  private timerLabel: Label | null = null;

  @property({ type: Label })
  private scoreLabel: Label | null = null;

  @property({ type: Label })
  private totalScoreLabel: Label | null = null;

  public updateTimerLabel(elapsedTime: number) {
    this.timerLabel.string = timeString(elapsedTime);
  }

  public updateScore(score: number) {
    this.scoreLabel.string = score.toString();
  }

  public updateTotalScore(score: number) {
    this.totalScoreLabel.string = score.toString();
  }
}
