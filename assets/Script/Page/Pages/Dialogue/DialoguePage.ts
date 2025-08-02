import {
  _decorator,
  Button,
  Component,
  Label,
  Node,
  Sprite,
  tween,
  Tween,
  Vec3,
} from "cc";
import { Page } from "../../Page";
import { DialogueLine } from "./DialogueLine";
const { ccclass, property } = _decorator;

@ccclass("DialoguePage")
export class DialoguePage extends Page {
  @property({ type: Label })
  private dialogueLabel: Label | null = null;

  @property({ type: Sprite })
  private speakerSprite: Sprite | null = null;

  @property({ type: Label })
  private speakerLabel: Label | null = null;

  @property({ type: Button })
  private advanceButton: Button | null = null;

  private currentLineIndex: number = 0;
  private isTyping: boolean = false;
  private currentTypingJob: Function | null = null;
  private textSpeed: number = 0.05;
  private speakerTween: Tween<Node> | null = null;

  protected dialogueScript: DialogueLine[] = [];

  onLoad() {
    this.advanceButton.node.on(
      Button.EventType.CLICK,
      this.onAdvanceButtonClick,
      this,
    );

    const scale = 0.2;
    this.speakerTween = tween(this.speakerSprite.node)
      .by(0.1, { scale: new Vec3(-scale, scale, 0) }, { easing: "backOut" })
      .by(0.3, { scale: new Vec3(scale, -scale, 0) }, { easing: "elasticOut" })
      .union();
  }

  public onEnter() {
    super.onEnter();
    this.dialogueLabel.string = "";
    this.speakerLabel.string = "Bee Safe";
  }

  protected startDialogue() {
    this.currentLineIndex = 0;
    this.displayCurrentLine();
  }

  private onAdvanceButtonClick() {
    if (this.isTyping) {
      this.completeTypewriterEffect();
    } else {
      this.currentLineIndex++;
      if (this.currentLineIndex < this.dialogueScript.length) {
        const line = this.dialogueScript[this.currentLineIndex - 1];
        for (const effect of line.effects) {
          effect.active = false;
        }
        this.displayCurrentLine();
      } else {
        this.endDialogue();
      }
    }
  }

  private displayCurrentLine() {
    const line = this.dialogueScript[this.currentLineIndex];
    if (!line) {
      this.endDialogue();
      return;
    }

    this.speakerLabel.string = line.speaker || "???";

    if (line.portrait) {
      this.speakerSprite.spriteFrame = line.portrait;
    }

    for (const effect of line.effects) {
      effect.active = true;
    }

    this.speakerTween.start();

    if (!line.skipTypewriterEffect) {
      this.startTypewriterEffect(line.text);
    } else {
      this.dialogueLabel.string = line.text;
    }
  }

  private startTypewriterEffect(fullText: string) {
    this.isTyping = true;
    this.dialogueLabel.string = "";
    let charIndex = 0;

    if (this.currentTypingJob !== null) {
      this.unschedule(this.currentTypingJob);
    }

    this.currentTypingJob = () => {
      if (charIndex < fullText.length) {
        this.dialogueLabel.string += fullText[charIndex];
        charIndex++;
      } else {
        this.completeTypewriterEffect();
      }
    };

    this.schedule(this.currentTypingJob, this.textSpeed, fullText.length);
  }

  private completeTypewriterEffect() {
    if (this.currentTypingJob !== null) {
      this.unschedule(this.currentTypingJob);
      this.currentTypingJob = null;
    }
    this.dialogueLabel.string = this.dialogueScript[this.currentLineIndex].text;
    this.isTyping = false;
  }

  protected endDialogue() {}
}
