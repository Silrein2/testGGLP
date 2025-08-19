import { _decorator, Component, Node, Vec3 } from "cc";
import { PageTransition } from "../../PageTransition";
import { delay } from "../../../Utils/Utils";
import { GameUITransition } from "../../../UI/GameUITransition";
import { UIManager } from "../../../Manager/UIManager";
const { ccclass, property } = _decorator;

@ccclass("Game1PageTransition")
export class Game1PageTransition extends PageTransition {
  @property({ type: GameUITransition })
  private gameUITransition: GameUITransition | null = null;

  onLoad() {
    this.enterTransitionEnabled = true;
    this.exitTransitionEnabled = true;
  }

  public onEnter() {
    UIManager.instance.showGameUI(true);
    this.gameUITransition.init();
    this.scheduleOnce(async () => {
      await this.gameUITransition.playEnter();
      await delay(700);
      this.onEnterComplete();
    }, this.stateEnterTransitionDuration * 0.8);
  }

  public async onExit() {
    await this.gameUITransition.playExit();
    await delay(800);
    this.onExitComplete();
  }
}
