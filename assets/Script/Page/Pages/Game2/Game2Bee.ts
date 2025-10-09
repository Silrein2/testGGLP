import { _decorator, Component, Label, Node, tween, UIOpacity, Vec3 } from "cc";
import { TypewriterEffect } from "../../../Utils/TypewriterEffect";
const { ccclass, property } = _decorator;

@ccclass("Game2Bee")
export class Game2Bee extends Component {
  @property({ type: Node })
  private speech: Node | null = null;

  @property({ type: Label })
  private speechLabel: Label | null = null;

  @property
  private fromPos: Vec3;

  private initialPos = new Vec3();
  private typewriterEffect: TypewriterEffect | null = null;
  private uiOpacity: UIOpacity | null = null;

  onLoad() {
    const pos = this.node.position.clone();
    this.initialPos.set(pos);
    this.typewriterEffect = new TypewriterEffect();
    this.uiOpacity = this.node.getComponent(UIOpacity);
    this.node.active = false;
  }

  public enter(text: string, pulse: boolean, onComplete: Func = () => {}) {
    this.node.active = true;
    this.speech.active = false;
    this.speechLabel.string = "";
    this.node.setPosition(this.fromPos);
    tween(this.node)
      .to(0.8, { position: this.initialPos }, { easing: "backOut" })
      .call(() => {
        this.speech.active = true;
        this.setText(text, pulse);
        onComplete();
      })
      .start();
  }

  public enterFade(
    text: string,
    pulse: boolean,
    pos: Vec3,
    onComplete: Func = () => {},
  ) {
    this.node.active = true;
    this.speech.active = false;
    this.speechLabel.string = "";
    this.uiOpacity.opacity = 0;
    this.node.setPosition(pos);
    tween(this.uiOpacity)
      .to(0.4, { opacity: 255 }, { easing: "cubicOut" })
      .call(() => {
        this.speech.active = true;
        this.setText(text, pulse);
        onComplete();
      })
      .start();
  }

  public exit(onComplete: Func = () => {}) {
    this.speech.active = false;
    this.node.setPosition(this.initialPos);
    tween(this.node)
      .to(0.8, { position: this.fromPos }, { easing: "backIn" })
      .call(() => {
        onComplete();
      })
      .start();
  }

  public exitFade(onComplete: Func = () => {}) {
    this.speech.active = false;
    tween(this.uiOpacity)
      .to(0.4, { opacity: 0 }, { easing: "cubicIn" })
      .call(() => {
        onComplete();
      })
      .start();
  }

  public setText(text: string, pulse: boolean) {
    this.typewriterEffect.startEffect(
      text,
      this.speechLabel,
      () => {
        if (!pulse) return;
        tween(this.speechLabel.node)
          .by(0.1, { scale: new Vec3(0.3, 0.3, 0) }, { easing: "backOut" })
          .by(0.3, { scale: new Vec3(-0.3, -0.3, 0) }, { easing: "elasticOut" })
          .union()
          .start();
      },
      0.025,
    );
  }

  public isComplete(): boolean {
    if (this.typewriterEffect.isTyping) {
      this.typewriterEffect.completeEffect();
      return false;
    }
    return true;
  }
}
