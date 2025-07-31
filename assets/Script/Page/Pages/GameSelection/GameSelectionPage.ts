import { _decorator, Component, Node } from "cc";
import { Page } from "../../Page";
import { ButtonStates, PageStates } from "../../Enums";
import { GameSelectionButton } from "./GameSelectionButton";
const { ccclass, property } = _decorator;

@ccclass("GameSelectionPage")
export class GameSelectionPage extends Page {
  @property({ type: [GameSelectionButton] })
  gameSelectionButtons: GameSelectionButton[] = [];

  private selectedGameIndex: number = null;

  protected setPageState() {
    this.pageState = PageStates.GameSelection;
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

  public onClickPlay() {
    switch (this.selectedGameIndex) {
      case 0:
        this.pageManager.transitionState(PageStates.DialogueGame1);
        break;
      case 1:
        //this.pageManager.transitionState(PageStates.Game2);
        break;
    }
  }
}
