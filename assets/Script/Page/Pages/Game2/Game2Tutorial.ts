import { _decorator, Button, Component, Node, tween, UIOpacity } from "cc";
import { Game2Bee } from "./Game2Bee";
const { ccclass, property } = _decorator;

@ccclass("Game2Tutorial")
export class Game2Tutorial extends Component {
  @property({ type: UIOpacity })
  private bgUIOpacity: UIOpacity | null = null;

  @property({ type: Game2Bee })
  private game2Bee: Game2Bee | null = null;

  private closeButton: Button | null = null;

  onLoad() {}

  public show() {
    this.node.active = true;
    if (!this.closeButton) this.closeButton = this.node.getComponent(Button);
    this.closeButton.interactable = false;
    this.bgUIOpacity.opacity = 0;
    tween(this.bgUIOpacity)
      .to(0.4, { opacity: 160 }, { easing: "sineOut" })
      .call(() => {
        this.game2Bee.enter(
          "If there is no issue with email, click safe button.",
          false,
          () => {
            this.closeButton.interactable = true;
          },
        );
      })
      .start();
  }

  public onClickClose() {
    if (!this.game2Bee.isComplete()) {
      return;
    }
    this.closeButton.interactable = false;
    this.game2Bee.exit(() => {
      tween(this.bgUIOpacity)
        .to(0.4, { opacity: 0 }, { easing: "sineIn" })
        .call(() => {
          this.node.active = false;
        })
        .start();
    });
  }
}
