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
  UIOpacity,
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
  private characterUIOpacity: UIOpacity | null = null;
  private characterInitialPos = new Vec3(747, 328, 0);
  private characterFromPos = new Vec3(1170, 328, 0);

  onLoad() {
    this.characterUIOpacity = this.characterSprite.node.getComponent(UIOpacity);
  }

  public play(correct: boolean, onComplete: Function) {
    this.node.active = true;
    if (this.characterTween != null) {
      tween(this.characterUIOpacity)
        .to(0.1, { opacity: 0 }, { easing: "cubicIn" })
        .call(() => {
          this.playFeedback(correct, onComplete);
        })
        .start();
    } else {
      this.playFeedback(correct, onComplete);
    }
  }

  private playFeedback(correct: boolean, onComplete: Function) {
    if (this.characterTween != null) {
      this.characterTween.stop();
    }
    this.characterUIOpacity.opacity = 255;
    this.speech.active = false;
    this.characterSprite.node.setPosition(this.characterFromPos);
    if (correct) {
      this.characterSprite.spriteFrame = this.correctSpriteFrame;
      this.animation.play();
    } else {
      this.animation.stop();
      this.characterSprite.spriteFrame = this.wrongSpriteFrame;
    }

    const stayDelay = 0.8;
    this.characterTween = tween(this.characterSprite.node)
      .to(0.5, { position: this.characterInitialPos }, { easing: "backOut" })
      .call(() => {
        if (!correct) {
          this.speech.active = true;
          this.startTypewriterEffect("Think twice!");
        }
      })
      .delay(stayDelay)
      .call(() => {
        this.speech.active = false;
      })
      .to(0.5, { position: this.characterFromPos }, { easing: "backIn" })
      .call(() => {
        this.node.active = false;
        this.characterTween = null;
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
