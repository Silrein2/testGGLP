import { _decorator, Component, Label, Node } from "cc";
import { GameManager } from "../../../Manager/GameManager";
import { Page } from "../../Page";
import { PageStates } from "../../Enums";
import { DataManager, Quizzes } from "../../../Manager/DataManager";
import { timeString } from "../../../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("ResultPage")
export class ResultPage extends Page {
  @property({ type: Label })
  private scoreLabel: Label | null = null;

  @property({ type: Label })
  private timeLabel: Label | null = null;

  @property({ type: Label })
  private bestTimeLabel: Label | null = null;

  protected setPageState() {
    this.pageState = PageStates.Result;
  }

  public onEnter() {
    super.onEnter();
    const quizzes: Quizzes = DataManager.instance.userState.quizzes;
    this.scoreLabel.string = quizzes.current_score_quizzes.toString();
    this.timeLabel.string = timeString(
      GameManager.instance.timer.getElapsedTime(),
    );
    this.bestTimeLabel.string = timeString(
      quizzes.total_seconds_at_highest_score_quizzes,
    );
  }

  private onClickClose() {
    this.pageManager.transitionState(PageStates.GameSelection);
  }
}
