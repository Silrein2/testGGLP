import { _decorator, Component, Node, Vec3 } from "cc";
import { PageTransition } from "../../PageTransition";
import { delay } from "../../../Utils/Utils";
import { GameUITransition } from "../../../UI/GameUITransition";
import { UIManager } from "../../../Manager/UIManager";
import { Game2Bee } from "./Game2Bee";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
const { ccclass, property } = _decorator;

@ccclass("Game2PageTransition")
export class Game2PageTransition extends PageTransition {
  @property({ type: GameUITransition })
  private gameUITransition: GameUITransition | null = null;

  @property({ type: [Node] })
  private rightNodes: Node[] = [];

  @property({ type: [Node] })
  private bottomNodes: Node[] = [];

  @property({ type: Game2Bee })
  private game2Bee: Game2Bee | null = null;

  private rightInitialPos: Vec3[] = [];
  private rightFromPos: Vec3[] = [];

  private bottomInitialPos: Vec3[] = [];
  private bottomFromPos: Vec3[] = [];

  onLoad() {
    this.enterTransitionEnabled = true;
    this.exitTransitionEnabled = true;

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
    UIManager.instance.showGameUI(true);
    this.gameUITransition.init();
    this.scheduleOnce(async () => {
      await this.gameUITransition.playEnter(
        this.rightNodes,
        this.rightInitialPos,
        this.bottomNodes,
        this.bottomInitialPos,
      );
      await delay(600);
      this.game2Bee.enter(
        LocalizationManager.instance.getLocalizedString("general.welcome"),
        false,
        async () => {
          await delay(800);
          this.onEnterComplete();
        },
      );
    }, this.stateEnterTransitionDuration * 0.8);
  }

  public async onExit() {
    await this.gameUITransition.playExit(
      this.rightNodes,
      this.rightFromPos,
      this.bottomNodes,
      this.bottomFromPos,
    );
    await delay(800);
    this.onExitComplete();
  }
}
