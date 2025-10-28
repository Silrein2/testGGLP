import { _decorator, Component, Node } from "cc";
import { GameManager } from "../../../Manager/GameManager";
import { Page } from "../../Page";
import { PageStates } from "../../Enums";
import { DataManager, Quizzes, UserState } from "../../../Manager/DataManager";
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
    const userState: UserState = DataManager.instance.userState;
    let currentScore = 0;
    let bestTime = 0;
    switch (this.pageManager.targetGamePageState) {
      case PageStates.Game1:
        currentScore = userState.quizzes.total_score_quizzes;
        bestTime = userState.quizzes.total_seconds_at_highest_score_quizzes;
        break;
      case PageStates.Game2:
        currentScore = userState.phishing.total_score_phishing;
        bestTime = userState.phishing.total_seconds_at_highest_score_phishing;
        break;
      case PageStates.Game3:
        currentScore = userState.fake_boss.total_score_fake_boss;
        bestTime = userState.fake_boss.best_total_seconds_fake_boss;
        break;
    }

    this.scoreResultScore.init(currentScore, false);
    this.timeResultScore.init(
      GameManager.instance.timer.getElapsedTime(),
      true,
    );
    this.bestTimeResultScore.init(bestTime, true);
  }

  private onClickClose() {
    this.transitionPage(PageStates.GameSelection);
  }
}
