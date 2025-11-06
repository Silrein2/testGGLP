import {
  _decorator,
  Button,
  Color,
  Component,
  Label,
  math,
  Node,
  Sprite,
  tween,
  UIOpacity,
  Vec3,
} from "cc";
import { TypewriterEffect } from "../../../Utils/TypewriterEffect";
import { Game3Page } from "./Game3Page";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
const { ccclass, property } = _decorator;

@ccclass("Game3Review")
export class Game3Review extends Component {
  @property({ type: Label })
  private scriptLabel: Label | null = null;

  @property({ type: Node })
  private prevButton: Node | null = null;

  @property({ type: Node })
  private nextButton: Node | null = null;

  @property({ type: Button })
  private gameNextButton: Button | null = null;

  private typewriterEffect: TypewriterEffect | null = null;
  private game3Page: Game3Page | null = null;

  private currentScript: string[] = [];
  private currentScriptIndex: number = 0;

  private gameNextUIOpacity: UIOpacity | null = null;

  onLoad() {
    this.typewriterEffect = new TypewriterEffect();
    this.gameNextUIOpacity = this.gameNextButton.node.getComponent(UIOpacity);
    this.currentScript = LocalizationManager.instance.getLocalizedStringArray(
      "dialogue.game_3.real_bee_boss",
    );
  }

  public init(game3Page: Game3Page) {
    this.game3Page = game3Page;
  }

  public show() {
    const show = !this.node.active;
    this.game3Page.setBlockInput(true);
    if (show) {
      this.node.active = true;
      this.scriptLabel.string = "";
      this.prevButton.active = false;
      this.nextButton.active = this.prevButton.active = false;
      this.setGameNextButtonInteractable(false);
      this.node.setScale(Vec3.ZERO);
      tween(this.node)
        .to(0.4, { scale: Vec3.ONE }, { easing: "cubicOut" })
        .call(() => {
          this.startScript();
          this.game3Page.setBlockInput(false);
        })
        .start();
    } else {
      tween(this.node)
        .to(0.4, { scale: Vec3.ZERO }, { easing: "cubicIn" })
        .call(() => {
          this.typewriterEffect.completeEffect();
          this.node.active = false;
          this.game3Page.setBlockInput(false);
          this.setGameNextButtonInteractable(true);
        })
        .start();
    }
  }

  private startScript() {
    this.currentScriptIndex = 0;
    this.displayCurrentScript();
  }

  private onClickAdvance(event: Event, next: string) {
    if (this.typewriterEffect.isTyping) {
      this.typewriterEffect.completeEffect();
    } else {
      this.currentScriptIndex += Number(next);
      this.currentScriptIndex = math.clamp(
        this.currentScriptIndex,
        0,
        this.currentScript.length - 1,
      );
      this.displayCurrentScript();
    }
  }

  private displayCurrentScript() {
    this.typewriterEffect.startEffect(
      this.currentScript[this.currentScriptIndex],
      this.scriptLabel,
    );

    this.prevButton.active = this.currentScriptIndex > 0;
    this.nextButton.active =
      this.currentScriptIndex < this.currentScript.length - 1;
  }

  private setGameNextButtonInteractable(interactable: boolean) {
    const opacity = interactable ? 255 : 0;
    const easing = interactable ? "cubicOut" : "cubicIn";
    /*this.gameNextButton.node.getComponent(Sprite).color = interactable
      ? new Color("#FFFFFF")
      : new Color("#7C7C7C");*/
    if (!this.gameNextUIOpacity)
      this.gameNextUIOpacity = this.gameNextButton.node.getComponent(UIOpacity);
    this.gameNextButton.interactable = interactable;
    tween(this.gameNextUIOpacity)
      .to(0.2, { opacity: opacity }, { easing: easing })
      .start();
  }
}
