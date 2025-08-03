import { _decorator, Component, Label, Node } from "cc";
import { ButtonStates } from "../../Enums";
const { ccclass, property } = _decorator;

@ccclass("GameSelectionButton")
export class GameSelectionButton extends Component {
  @property({ type: Label })
  scoreLabel: Label | null = null;

  @property({ type: Node })
  highlight: Node | null = null;

  public init(score: number) {
    this.scoreLabel.string = score.toString();
  }

  public setState(state: ButtonStates) {
    switch (state) {
      case ButtonStates.Normal:
        this.highlight.active = false;
        break;
      case ButtonStates.Selected:
        this.highlight.active = true;
        break;
    }
  }
}
