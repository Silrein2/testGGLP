import { _decorator, Component, game, Label, Node } from "cc";
import { DataManager, Quizzes, UserState } from "../Manager/DataManager";
import { timeString } from "../Utils/Utils";
import { PopupUI } from "./PopupUI";
import { PageStates } from "../Page/Enums";
import { LocalizationManager } from "../Manager/LocalizationManager";
const { ccclass, property } = _decorator;

@ccclass("ScoreStartUI")
export class ScoreStartUI extends PopupUI {
  @property({ type: Label })
  private gameLabel: Label | null = null;

  @property({ type: Label })
  private highScoreLabel: Label | null = null;

  @property({ type: Label })
  private timeLabel: Label | null = null;

  @property({ type: Node })
  private tutorialButton: Node | null = null;

  private onComplete: Function | null = null;
  private onTutorial: Function | null = null;

  public show(
    gamePageState: PageStates,
    onComplete: Function,
    onTutorial: Function = () => {},
  ) {
    const userState: UserState = DataManager.instance.userState;

    let gameName = "";
    let currentScore = 0;
    let bestTime = 0;
    switch (gamePageState) {
      case PageStates.Game1:
        gameName =
          LocalizationManager.instance.getLocalizedString("game_1.name");
        currentScore = userState.quizzes.highest_score_quizzes;
        bestTime = userState.quizzes.total_seconds_at_highest_score_quizzes;
        this.tutorialButton.active = false;
        break;
      case PageStates.Game2:
        gameName =
          LocalizationManager.instance.getLocalizedString("game_2.name");
        currentScore = userState.phishing.highest_score_phishing;
        bestTime = userState.phishing.total_seconds_at_highest_score_phishing;
        this.tutorialButton.active = true;
        break;
      case PageStates.Game3:
        gameName =
          LocalizationManager.instance.getLocalizedString("game_3.name");
        currentScore = userState.fake_boss.total_score_fake_boss;
        bestTime = userState.fake_boss.best_total_seconds_fake_boss;
        this.tutorialButton.active = false;
        break;
    }

    this.gameLabel.string = gameName.toUpperCase();
    this.highScoreLabel.string = currentScore.toString();
    this.timeLabel.string = timeString(bestTime);
    this.onComplete = onComplete;
    this.onTutorial = onTutorial;
    this.onShow();
  }

  private onClickClose() {
    this.onClose(this.onComplete);
  }

  private onClickTutorial() {
    this.onClose(this.onTutorial);
  }
}
