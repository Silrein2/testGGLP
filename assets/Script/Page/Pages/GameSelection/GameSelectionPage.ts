import { _decorator, Component, Node, tween, Vec3 } from "cc";
import { Page } from "../../Page";
import { ButtonStates, PageStates } from "../../Enums";
import { GameSelectionButton } from "./GameSelectionButton";
import { GameManager } from "../../../Manager/GameManager";
import { delay } from "../../../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("GameSelectionPage")
export class GameSelectionPage extends Page {
  @property({ type: [GameSelectionButton] })
  private gameSelectionButtons: GameSelectionButton[] = [];

  private selectedGameIndex: number | null = -1;

  protected setPageState() {
    this.pageState = PageStates.GameSelection;
  }
  public onEnter() {
    super.onEnter();
    this.selectedGameIndex = -1;
    this.onClickGame(null, -1);
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
    switch (this.selectedGameIndex) {
      case 0:
        await GameManager.instance.quizService.getQuestion();
        this.transitionPage(PageStates.DialogueGame1);
        break;
      case 1:
        //this.pageManager.transitionState(PageStates.Game2);
        break;
    }
  }
}
