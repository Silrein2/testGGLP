import { _decorator, Component, Node, Vec3 } from "cc";
import { PageTransition } from "../../PageTransition";
import { delay } from "../../../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("Game1PageTransition")
export class Game1PageTransition extends PageTransition {
  @property({ type: [Node] })
  private topNodes: Node[] = [];

  @property({ type: [Node] })
  private rightNodes: Node[] = [];

  @property({ type: [Node] })
  private bottomNodes: Node[] = [];

  private topInitialPos: Vec3[] = [];
  private rightInitialPos: Vec3[] = [];
  private bottomInitialPos: Vec3[] = [];

  private topFromPos: Vec3[] = [];
  private rightFromPos: Vec3[] = [];
  private bottomFromPos: Vec3[] = [];

  onLoad() {
    this.enterTransitionEnabled = true;
    this.exitTransitionEnabled = true;

    this.recordPos(
      this.topNodes,
      this.topInitialPos,
      this.topFromPos,
      "y",
      800,
    );
    this.recordPos(
      this.rightNodes,
      this.rightInitialPos,
      this.rightFromPos,
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
    this.setNodesPosition(this.topNodes, this.topFromPos);
    this.setNodesPosition(this.rightNodes, this.rightFromPos);
    this.setNodesPosition(this.bottomNodes, this.bottomFromPos);
    this.scheduleOnce(async () => {
      await this.tweenList(this.topNodes, this.topInitialPos, 200, "backOut");
      await this.tweenList(
        this.rightNodes,
        this.rightInitialPos,
        200,
        "backOut",
      );
      await this.tweenList(
        this.bottomNodes,
        this.bottomInitialPos,
        200,
        "backOut",
      );
      await delay(800);
      this.onEnterComplete();
    }, this.stateEnterTransitionDuration * 0.8);
  }

  public async onExit() {
    await this.tweenList(this.topNodes, this.topFromPos, 200, "backIn");
    await this.tweenList(this.rightNodes, this.rightFromPos, 200, "backIn");
    await this.tweenList(this.bottomNodes, this.bottomFromPos, 200, "backIn");
    await delay(800);
    this.onExitComplete();
  }
}
