import { _decorator, Component, Node, Vec3 } from "cc";
import { PageTransition } from "../../PageTransition";
import { delay } from "../../../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("GameSelectionPageTransition")
export class GameSelectionPageTransition extends PageTransition {
  @property({ type: [Node] })
  private gameButtons: Node[] = [];

  @property({ type: [Node] })
  private topNodes: Node[] = [];

  @property({ type: [Node] })
  private bottomNodes: Node[] = [];

  private gameInitialPos: Vec3[] = [];
  private topInitialPos: Vec3[] = [];
  private bottomInitialPos: Vec3[] = [];

  private gameFromPos: Vec3[] = [];
  private topFromPos: Vec3[] = [];
  private bottomFromPos: Vec3[] = [];

  onLoad() {
    this.enterTransitionEnabled = true;
    this.exitTransitionEnabled = true;

    this.recordPos(
      this.gameButtons,
      this.gameInitialPos,
      this.gameFromPos,
      "y",
      1100,
    );
    this.recordPos(
      this.topNodes,
      this.topInitialPos,
      this.topFromPos,
      "x",
      1260,
    );
    this.recordPos(
      this.bottomNodes,
      this.bottomInitialPos,
      this.bottomFromPos,
      "y",
      -820,
    );
  }

  public onEnter() {
    this.setNodesPosition(this.gameButtons, this.gameFromPos);
    this.setNodesPosition(this.topNodes, this.topFromPos);
    this.setNodesPosition(this.bottomNodes, this.bottomFromPos);
    this.scheduleOnce(async () => {
      await this.tweenList(
        this.gameButtons,
        this.gameInitialPos,
        250,
        "backOut",
      );
      await delay(100);
      await this.tweenList(this.topNodes, this.topInitialPos, 100, "backOut");
      await this.tweenList(
        this.bottomNodes,
        this.bottomInitialPos,
        100,
        "backOut",
      );
      this.onEnterComplete();
    }, this.stateEnterTransitionDuration * 0.5);
  }

  public async onExit() {
    await this.tweenList(this.gameButtons, this.gameFromPos, 250, "backIn");
    await delay(100);
    await this.tweenList(this.topNodes, this.topFromPos, 200, "backIn");
    await this.tweenList(this.bottomNodes, this.bottomFromPos, 200, "backIn");
    await delay(800);
    this.onExitComplete();
  }
}
