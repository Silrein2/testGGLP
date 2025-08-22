import { _decorator, Component, Node, Vec3 } from "cc";
import { PageTransition } from "../Page/PageTransition";
import { delay } from "../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("GameUITransition")
export class GameUITransition extends PageTransition {
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

  public init() {
    this.setNodesPosition(this.topNodes, this.topFromPos);
    this.setNodesPosition(this.rightNodes, this.rightFromPos);
    this.setNodesPosition(this.bottomNodes, this.bottomFromPos);
  }

  public async playEnter(
    rightNodes: Node[] = [],
    rightInitialPos: Vec3[] = [],
    callback: Function = () => {},
  ) {
    await this.tweenList(this.topNodes, this.topInitialPos, 200, "backOut");
    await this.tweenList(
      [...this.rightNodes, ...rightNodes],
      [...this.rightInitialPos, ...rightInitialPos],
      200,
      "backOut",
    );
    await this.tweenList(
      this.bottomNodes,
      this.bottomInitialPos,
      200,
      "backOut",
    );
    callback();
  }

  public async playExit(
    rightNodes: Node[] = [],
    rightFromPos: Vec3[] = [],
    bottomNodes: Node[] = [],
    bottomFromPos: Vec3[] = [],
    callback: Function = () => {},
  ) {
    await this.tweenList(this.topNodes, this.topFromPos, 200, "backIn");
    await this.tweenList(
      [...this.rightNodes, ...rightNodes],
      [...this.rightFromPos, ...rightFromPos],
      200,
      "backIn",
    );
    await this.tweenList(
      [...bottomNodes, ...this.bottomNodes],
      [...bottomFromPos, ...this.bottomFromPos],
      200,
      "backIn",
    );
    callback();
  }

  public setBottomNodes() {}
}
