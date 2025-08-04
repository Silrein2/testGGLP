import { _decorator, Component, Node } from "cc";
import { GameManager } from "../../../Manager/GameManager";
import { Page } from "../../Page";
import { PageStates } from "../../Enums";
import { DataManager, Quizzes } from "../../../Manager/DataManager";
import { ResultScore } from "./ResultScore";
const { ccclass, property } = _decorator;

@ccclass("ResultPage")
export class ResultPage extends Page {
  @property({ type: ResultScore })
  private scoreResultScore: ResultScore | null = null;

  @property({ type: ResultScore })
  private timeResultScore: ResultScore | null = null;

  @property({ type: ResultScore })
  private bestTimeResultScore: ResultScore | null = null;

  protected setPageState() {
    this.pageState = PageStates.Result;
  }

  public onEnter() {
    super.onEnter();
    const quizzes: Quizzes = DataManager.instance.userState.quizzes;
    this.scoreResultScore.init(quizzes.current_score_quizzes, false);
    this.timeResultScore.init(
      GameManager.instance.timer.getElapsedTime(),
      true,
    );
    this.bestTimeResultScore.init(
      quizzes.total_seconds_at_highest_score_quizzes,
      true,
    );
  }

  private onClickClose() {
    this.transitionPage(PageStates.GameSelection);
  }
}
