import {
  _decorator,
  Button,
  Component,
  Node,
  tween,
  UIOpacity,
  Vec3,
} from "cc";
import { Game2Bee } from "./Game2Bee";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
const { ccclass, property } = _decorator;

@ccclass("Game2Tutorial")
export class Game2Tutorial extends Component {
  @property({ type: Node })
  private optionSpotlight: Node | null = null;

  @property({ type: Node })
  private buttonSpotlight: Node | null = null;

  @property({ type: Node })
  private nextSpotlight: Node | null = null;

  @property({ type: Game2Bee })
  private game2Bee: Game2Bee | null = null;

  @property({ type: Button })
  private okayButton: Button | null = null;

  private sequence: number = 0;
  private onComplete: Function | null = null;
  onLoad() {}

  public show(onComplete: Func) {
    this.onComplete = onComplete;
    this.sequence = 0;
    this.node.active = true;
    this.okayButton.interactable = false;
    const uiOpacity = this.optionSpotlight.getComponent(UIOpacity);
    this.showSequenceSpotlight();
    uiOpacity.opacity = 0;
    const beePos = new Vec3(107, 22, 0);
    tween(uiOpacity)
      .to(0.4, { opacity: 255 }, { easing: "sineOut" })
      .call(() => {
        this.game2Bee.enterFade(
          LocalizationManager.instance.getLocalizedString(
            "game_2.tutorial_drag",
          ),
          false,
          beePos,
          () => {
            this.okayButton.interactable = true;
          },
        );
      })
      .start();
  }

  private showSequenceSpotlight() {
    this.optionSpotlight.active = this.sequence === 0;
    this.buttonSpotlight.active = this.sequence === 1;
    this.nextSpotlight.active = this.sequence === 2;
  }

  public onClickOkay() {
    if (!this.game2Bee.isComplete()) return;
    const uiOpacity = this.nextSpotlight.getComponent(UIOpacity);
    this.okayButton.interactable = false;
    if (this.sequence == 0) {
      this.sequence = 1;
      this.game2Bee.exitFade(() => {
        const beePos = new Vec3(224, -390, 0);
        this.showSequenceSpotlight();
        this.game2Bee.enterFade(
          LocalizationManager.instance.getLocalizedString(
            "game_2.tutorial_safe",
          ),
          false,
          beePos,
          () => {
            this.okayButton.interactable = true;
          },
        );
      });
    } else if (this.sequence == 1) {
      this.sequence = 2;
      this.game2Bee.exitFade(() => {
        const beePos = new Vec3(543, -220, 0);
        this.showSequenceSpotlight();
        uiOpacity.opacity = 255;
        this.game2Bee.enterFade(
          LocalizationManager.instance.getLocalizedString(
            "game_2.tutorial_next",
          ),
          false,
          beePos,
          () => {
            this.okayButton.interactable = true;
          },
        );
      });
    } else if (this.sequence == 2) {
      this.game2Bee.exitFade(() => {
        tween(uiOpacity)
          .to(0.4, { opacity: 0 }, { easing: "sineIn" })
          .call(() => {
            this.node.active = false;
            this.onComplete();
          })
          .start();
      });
    }
  }

  private onClick() {
    this.game2Bee.isComplete();
  }
}
