import { _decorator, Component, Label, Node, tween, Vec3 } from "cc";
import { Page } from "../../Page";
import { ButtonStates, PageStates } from "../../Enums";
import { GameSelectionButton } from "./GameSelectionButton";
import { GameManager } from "../../../Manager/GameManager";
import { DataManager, Quizzes } from "../../../Manager/DataManager";
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
    const quizzes: Quizzes = DataManager.instance.userState.quizzes;
    this.selectedGameIndex = -1;
    this.onClickGame(null, -1);
    this.totalScoreLabel.string = quizzes.total_score_quizzes.toString();

    this.gameSelectionButtons.forEach(
      (gameSelectionButton: GameSelectionButton, index: number) => {
        let score = 0;
        if (index === 0) {
          score = quizzes.highest_score_quizzes;
        }
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
