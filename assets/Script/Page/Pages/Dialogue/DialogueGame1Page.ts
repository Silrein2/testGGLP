import {
  _decorator,
  Component,
  Node,
  SpriteFrame,
  tween,
  UIOpacity,
  VideoPlayer,
} from "cc";
import { DialoguePage } from "./DialoguePage";
import { PageStates } from "../../Enums";
import { GameManager } from "../../../Manager/GameManager";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
const { ccclass, property } = _decorator;

@ccclass("DialogueGame1Page")
export class DialogueGame1Page extends DialoguePage {
  @property({ type: SpriteFrame })
  private beeSmileSprite: SpriteFrame | null = null;

  @property({ type: Node })
  private clipBg: Node | null = null;

  @property({ type: VideoPlayer })
  private videoPlayer: VideoPlayer | null = null;

  protected setPageState() {
    this.pageState = PageStates.DialogueGame1;
  }

  public onEnter() {
    super.onEnter();
    this.videoPlayer.stayOnBottom = true;
    this.clipBg.active = false;
    this.videoPlayer.node.active = false;
    this.dialogueScript = [];
    let key = "";
    switch (this.pageManager.targetGamePageState) {
      case PageStates.Game1:
        key = "dialogue.game_1.intro";
        break;
      case PageStates.Game2:
        key = "dialogue.game_2.intro";
        break;
      case PageStates.Game3:
        key = "dialogue.game_3.intro";
        break;
    }

    const localizedDialogue =
      LocalizationManager.instance.getLocalizedStringArray(key);

    localizedDialogue.forEach((dialogue) => {
      const script = {
        speaker:
          LocalizationManager.instance.getLocalizedString("general.bee_safe"),
        portrait: this.beeSmileSprite,
        text: dialogue,
        effects: [],
        skipTypewriterEffect: false,
      };

      this.dialogueScript.push(script);
    });
  }

  public onPostEnterTransition() {
    super.onPostEnterTransition();
    this.startDialogue();
    this.clipTransition(true);
  }

  protected endDialogue() {
    super.endDialogue();
    this.clipTransition(false);
    this.transitionPage(this.pageManager.targetGamePageState);
  }

  public onClickSkip() {
    this.endDialogue();
  }

  private clipTransition(show: boolean) {
    if (this.pageManager.targetGamePageState !== PageStates.Game2) return;
    const uiOpacity = this.clipBg.getComponent(UIOpacity);
    if (show) {
      uiOpacity.opacity = 0;
      this.clipBg.active = true;
      tween(uiOpacity)
        .to(0.4, { opacity: 255 }, { easing: "cubicOut" })
        .call(() => {
          this.videoPlayer.node.active = true;
          this.videoPlayer.play();
          this.scheduleOnce(() => {
            this.videoPlayer.stayOnBottom = false;
          }, 0.1);
        })
        .start();
    } else {
      this.videoPlayer.node.active = false;
      uiOpacity.opacity = 255;
      tween(uiOpacity)
        .to(0.4, { opacity: 0 }, { easing: "cubicIn" })
        .call(() => {
          this.clipBg.active = false;
        })
        .start();
    }
  }
}
