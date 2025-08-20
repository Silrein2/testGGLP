import {
  _decorator,
  Component,
  Label,
  Node,
  Sprite,
  SpriteFrame,
  tween,
  UIOpacity,
  Vec3,
} from "cc";
import { TypewriterEffect } from "../../../Utils/TypewriterEffect";
import { delay } from "../../../Utils/Utils";
import { GameUITransition } from "../../../UI/GameUITransition";
import { Game3Page } from "./Game3Page";
const { ccclass, property } = _decorator;

@ccclass("Game3Intro")
export class Game3Intro extends Component {
  @property({ type: Label })
  private wordLabel: Label | null = null;

  @property({ type: Node })
  private notification: Node | null = null;

  @property({ type: Node })
  private callScreen: Node | null = null;

  @property({ type: SpriteFrame })
  private callRealSpriteFrame: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  private callFakeSpriteFrame: SpriteFrame | null = null;

  @property({ type: Node })
  private scriptBox: Node | null = null;

  @property({ type: Label })
  private scriptLabel: Label | null = null;

  @property({ type: [Node] })
  private transferButtons: Node[] = [];

  @property({ type: Node })
  private nextDayBg: Node | null = null;

  @property({ type: Label })
  private nextDayLabel: Label | null = null;

  @property({ type: GameUITransition })
  private gameUITransition: GameUITransition | null = null;

  @property({ type: UIOpacity })
  private cursorOpacity: UIOpacity | null = null;

  private typewriterEffect: TypewriterEffect | null = null;
  private notificationUIOpacity: UIOpacity | null = null;
  private nextDayBgUIOpacity: UIOpacity | null = null;
  private callScreenSprite: Sprite | null = null;
  private nextDay: boolean = false;
  private game3Page: Game3Page | null = null;

  private realScript: string[] = [];
  private fakeScript: string[] = [];
  private currentScript: string[] = [];
  private currentScriptIndex: number = 0;

  private cursorBlinkSpeed: number = 0.5;

  onLoad() {
    this.typewriterEffect = new TypewriterEffect();
    this.notificationUIOpacity = this.notification.getComponent(UIOpacity);
    this.nextDayBgUIOpacity = this.nextDayBg.getComponent(UIOpacity);
    this.callScreenSprite = this.callScreen.getComponent(Sprite);

    this.realScript = [
      "I am travelling soon and you need to send me an update on Project XYZ",
      "Please send it to me by today because I need it for my discussions",
      "If you have any questions, you know how to reach me at my mobile number.",
    ];

    this.fakeScript = [
      "I lost my phone, wallet and credit card. I am borrowing my friend's phone",
    ];
  }

  public init(game3Page: Game3Page, stateEnterTransitionDuration: number) {
    this.game3Page = game3Page;
    this.nextDay = false;
    this.nextDayBg.active = false;
    this.gameUITransition.init();
    this.resetEffect();
    this.unschedule(this.blinkCursor);
    this.schedule(this.blinkCursor, this.cursorBlinkSpeed);
    this.scheduleOnce(this.startEffect, stateEnterTransitionDuration);
  }

  private blinkCursor() {
    this.cursorOpacity.opacity = this.cursorOpacity.opacity === 0 ? 255 : 0;
  }

  private resetEffect() {
    this.callScreen.active = true;
    this.notification.setScale(Vec3.ZERO);
    this.callScreen.setScale(Vec3.ZERO);
    this.notificationUIOpacity.opacity = 0;
    this.scriptBox.setScale(Vec3.ONE);
    for (const node of this.transferButtons) {
      node.active = true;
      node.setScale(Vec3.ZERO);
    }
    this.scriptLabel.string = "";
    this.wordLabel.string = "";

    const callSpriteFrame = !this.nextDay
      ? this.callRealSpriteFrame
      : this.callFakeSpriteFrame;
    this.callScreenSprite.spriteFrame = callSpriteFrame;
    this.currentScript = !this.nextDay ? this.realScript : this.fakeScript;
  }

  private async startEffect() {
    this.resetEffect();
    this.game3Page.setBlockInput(true);
    const wordText = !this.nextDay
      ? "Defense against Deepfake meeting agenda…"
      : "Report on Deepfake Training…";
    await delay(1000);
    this.typewriterEffect.startEffect(wordText, this.wordLabel);
    await delay(3000);
    tween(this.node)
      .parallel(
        tween(this.notification).to(
          0.8,
          { scale: Vec3.ONE },
          { easing: "elasticOut" },
        ),
        tween(this.notificationUIOpacity).to(
          0.8,
          { opacity: 255 },
          { easing: "cubicOut" },
        ),
      )
      .call(() => {
        this.game3Page.setBlockInput(false);
      })
      .start();
  }

  private startScript() {
    this.currentScriptIndex = 0;
    this.displayCurrentScript();
  }

  private onClickAdvance() {
    if (this.typewriterEffect.isTyping) {
      this.typewriterEffect.completeEffect();
    } else {
      this.currentScriptIndex++;
      if (this.currentScriptIndex < this.currentScript.length) {
        this.displayCurrentScript();
      } else {
        this.endScript();
      }
    }
  }

  private displayCurrentScript() {
    this.typewriterEffect.startEffect(
      this.currentScript[this.currentScriptIndex],
      this.scriptLabel,
    );
  }

  private endScript() {
    if (this.nextDay) {
      this.startGameEffect();
      return;
    }
    this.nextDayBgUIOpacity.opacity = 0;
    this.nextDayBg.active = true;
    this.nextDayLabel.string = "";
    tween(this.nextDayBgUIOpacity)
      .to(1.2, { opacity: 255 }, { easing: "sineOut" })
      .call(() => {
        this.typewriterEffect.startEffect("The Next Day...", this.nextDayLabel);
      })
      .delay(2)
      .call(() => {
        this.nextDay = true;
        this.resetEffect();
      })
      .then(
        tween(this.nextDayBgUIOpacity)
          .to(1.2, { opacity: 0 }, { easing: "sineIn" })
          .call(() => {
            this.nextDayBg.active = false;
          }),
      )
      .call(() => {
        this.startEffect();
      })
      .start();
  }

  private async startGameEffect() {
    this.game3Page.setBlockInput(true);
    await this.gameUITransition.playEnter();
    tween(this.scriptBox)
      .to(0.4, { scale: Vec3.ZERO }, { easing: "cubicIn" })
      .parallel(
        tween(this.transferButtons[0]).to(
          0.4,
          { scale: Vec3.ONE },
          { easing: "backOut" },
        ),
        tween(this.transferButtons[1]).to(
          0.4,
          { scale: Vec3.ONE },
          { easing: "backOut" },
        ),
      )
      .call(() => {
        this.game3Page.setBlockInput(false);
      })
      .start();
  }

  private onClickTransfer(event: Event, transfer: string) {
    const isTransfer = transfer === "0";
    this.game3Page.onClickTransfer(isTransfer);
  }

  private async onClickNotification() {
    this.game3Page.setBlockInput(true);
    tween(this.node)
      .parallel(
        tween(this.notification).to(
          0.4,
          { scale: Vec3.ZERO },
          { easing: "backIn" },
        ),
        tween(this.notificationUIOpacity).to(
          0.4,
          { opacity: 0 },
          { easing: "cubicIn" },
        ),
      )
      .then(
        tween(this.callScreen).to(
          0.4,
          { scale: Vec3.ONE },
          { easing: "cubicOut" },
        ),
      )
      .call(() => {
        this.game3Page.setBlockInput(false);
        this.startScript();
      })
      .start();
  }
}
