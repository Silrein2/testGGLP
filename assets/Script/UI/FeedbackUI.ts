import {
  _decorator,
  Component,
  Label,
  Node,
  Sprite,
  tween,
  Vec3,
  Animation,
  SpriteFrame,
  Tween,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("FeedbackUI")
export class FeedbackUI extends Component {
  @property({ type: Sprite })
  private characterSprite: Sprite | null = null;

  @property({ type: Node })
  private speech: Node | null = null;

  @property({ type: Label })
  private speechLabel: Label | null = null;

  @property({ type: Animation })
  private animation: Animation | null = null;

  @property({ type: SpriteFrame })
  private correctSpriteFrame: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  private wrongSpriteFrame: SpriteFrame | null = null;

  private characterTween: Tween<Node> | null = null;
  private currentTypingJob: Function | null = null;

  public play(correct: boolean, onComplete: Function) {
    this.node.active = true;
    if (this.characterTween != null) {
      this.characterTween.stop();
    }
    const outPos = new Vec3(1170, 328, 0);
    const inPos = new Vec3(747, 328, 0);
    this.speech.active = false;
    this.characterSprite.node.setPosition(outPos);
    if (correct) {
      this.characterSprite.spriteFrame = this.correctSpriteFrame;
      this.animation.play();
    } else {
      this.animation.stop();
      this.characterSprite.spriteFrame = this.wrongSpriteFrame;
    }
    this.characterTween = tween(this.characterSprite.node)
      .to(0.5, { position: inPos }, { easing: "backOut" })
      .call(() => {
        if (!correct) {
          this.speech.active = true;
          this.startTypewriterEffect("Think twice!");
        }
      })
      .delay(1)
      .call(() => {
        this.speech.active = false;
      })
      .to(0.5, { position: outPos }, { easing: "backIn" })
      .call(() => {
        this.node.active = false;
        onComplete(correct);
      })
      .start();
  }

  private startTypewriterEffect(fullText: string) {
    this.speechLabel.string = "";
    let charIndex = 0;

    if (this.currentTypingJob !== null) {
      this.unschedule(this.currentTypingJob);
    }
    this.currentTypingJob = () => {
      if (charIndex < fullText.length) {
        this.speechLabel.string += fullText[charIndex];
        charIndex++;
      } else {
        this.completeTypewriterEffect();
      }
    };
    this.schedule(this.currentTypingJob, 0.025, fullText.length);
  }

  private completeTypewriterEffect() {
    if (this.currentTypingJob !== null) {
      this.unschedule(this.currentTypingJob);
      this.currentTypingJob = null;
    }
  }
}
