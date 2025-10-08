import { _decorator, Component, Label, Node, tween, Vec3 } from "cc";
import { Page } from "../../Page";
import { ButtonStates, PageStates } from "../../Enums";
import { GameSelectionButton } from "./GameSelectionButton";
import { DataManager, Quizzes, UserState } from "../../../Manager/DataManager";
const { ccclass, property } = _decorator;

@ccclass("GameSelectionPage")
export class GameSelectionPage extends Page {
  @property({ type: [GameSelectionButton] })
  private gameSelectionButtons: GameSelectionButton[] = [];

  @property({ type: Label })
  private totalScoreLabel: Label | null = null;

  private selectedGameIndex: number | null = -1;

  protected setPageState() {
    this.pageState = PageStates.GameSelection;
  }
  public onEnter() {
    super.onEnter();
    const userState: UserState = DataManager.instance.userState;
    this.selectedGameIndex = -1;
    this.onClickGame(null, -1);
    this.totalScoreLabel.string = userState.total_score_all.toString();

    const gameTotalScores = [
      userState.quizzes.total_score_quizzes,
      userState.phishing.total_score_phishing,
      userState.fake_boss.total_score_fake_boss,
    ];
    this.gameSelectionButtons.forEach(
      (gameSelectionButton: GameSelectionButton, index: number) => {
        const score = gameTotalScores[index];
        gameSelectionButton.init(score);
      },
    );
  }

  public onClickGame(event: Event, gameIndex: number) {
    this.selectedGameIndex = Number(gameIndex);
    this.gameSelectionButtons.forEach(
      (gameSelectionButton: GameSelectionButton, index: number) => {
        if (index == gameIndex) {
          gameSelectionButton.setState(ButtonStates.Selected);
        } else {
          gameSelectionButton.setState(ButtonStates.Normal);
        }
      },
    );
  }

  private async onClickPlay() {
    if (this.selectedGameIndex < 0) return;
    switch (this.selectedGameIndex) {
      case 0:
        this.pageManager.targetGamePageState = PageStates.Game1;
        break;
      case 1:
        this.pageManager.targetGamePageState = PageStates.Game2;
        break;
      case 2:
        this.pageManager.targetGamePageState = PageStates.Game3;
        break;
    }
    this.transitionPage(PageStates.DialogueGame1);
  }
}
