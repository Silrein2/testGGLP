import { _decorator, Component, Label, Node } from "cc";
import { timeString } from "../../../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("ResultScore")
export class ResultScore extends Component {
  @property({ type: Label })
  public scoreLabel: Label | null = null;

  public score: number = 0;
  private counter: number = 0;
  private isTime: boolean = false;

  init(score: number, isTime: boolean) {
    this.score = score;
    this.counter = 0;
    this.isTime = isTime;
  }

  public setCounter(score: number) {
    this.counter = score;
    this.updateLabel();
  }

  private updateLabel() {
    const scoreText = this.isTime
      ? timeString(this.counter)
      : this.counter.toString();

    this.scoreLabel.string = scoreText;
  }
}
