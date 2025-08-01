import { _decorator, Component, Label, Node } from "cc";
import { UIManager } from "../Manager/UIManager";
const { ccclass, property } = _decorator;

@ccclass("Timer")
export class Timer extends Component {
  private elapsedTime: number = 0;
  private isRunning: boolean = false;

  update(dt: number) {
    if (this.isRunning) {
      this.elapsedTime += dt;
      UIManager.instance.gameUI.updateTimerLabel(this.elapsedTime);
    }
  }

  public startTimer() {
    this.isRunning = true;
  }

  public stopTimer() {
    this.isRunning = false;
  }

  public resetTimer() {
    this.isRunning = false;
    this.elapsedTime = 0;
    UIManager.instance.gameUI.updateTimerLabel(this.elapsedTime);
  }

  public getElapsedTime(): number {
    return Math.floor(this.elapsedTime);
  }
}
