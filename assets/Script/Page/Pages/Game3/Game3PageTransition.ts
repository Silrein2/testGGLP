import { _decorator, Component, Node, tween, Vec3 } from "cc";
import { PageTransition } from "../../PageTransition";
import { GameUITransition } from "../../../UI/GameUITransition";
import { delay } from "../../../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("Game3PageTransition")
export class Game3PageTransition extends PageTransition {
  @property({ type: GameUITransition })
  private gameUITransition: GameUITransition | null = null;

  @property({ type: [Node] })
  private bottomNodes: Node[] = [];

  @property({ type: Node })
  private review: Node | null = null;

  private bottomInitialPos: Vec3[] = [];
  private bottomFromPos: Vec3[] = [];

  onLoad() {
    this.exitTransitionEnabled = true;

    this.recordPos(
      this.bottomNodes,
      this.bottomInitialPos,
      this.bottomFromPos,
      "y",
      -820,
    );
  }

  public async onEnter() {
    this.setNodesPosition(this.bottomNodes, this.bottomFromPos);
    this.review.setScale(Vec3.ZERO);

    this.scheduleOnce(async () => {
      tween(this.review)
        .to(0.4, { scale: Vec3.ONE }, { easing: "backOut" })
        .call(async () => {
          await this.tweenList(
            this.bottomNodes,
            this.bottomInitialPos,
            200,
            "backOut",
          );
          await delay(700);
          this.onEnterComplete();
        })
        .start();
    }, 1.5);
  }

  public async onExit() {
    await this.gameUITransition.playExit(
      [],
      [],
      this.bottomNodes,
      this.bottomFromPos,
    );
    await delay(800);
    this.onExitComplete();
  }
}
