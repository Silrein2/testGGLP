import {
  _decorator,
  Component,
  Node,
  RichText,
  tween,
  UIOpacity,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game3Message")
export class Game3Message extends Component {
  @property({ type: Node })
  private bg: Node | null = null;

  @property({ type: Node })
  private panel: Node | null = null;

  @property({ type: Node })
  private next: Node | null = null;

  @property({ type: RichText })
  private messageLabel: RichText | null = null;

  private uiOpacity: UIOpacity | null = null;
  private nextCallback: Function | null = null;

  onLoad() {
    this.uiOpacity = this.node.getComponent(UIOpacity);
  }

  public show(
    show: boolean,
    text: string = "",
    showCallback: Function = () => {},
    nextCallback: Function = () => {},
  ) {
    this.nextCallback = nextCallback;
    const duration = 0.8;
    const initialOpacity = show ? 0 : 255;
    const initialScale = show ? Vec3.ZERO : Vec3.ONE;
    const opacity = show ? 255 : 0;
    const scale = show ? Vec3.ONE : Vec3.ZERO;
    const opacityEasing = show ? "cubicOut" : "cubicIn";
    const scaleEasing = show ? "backOut" : "backIn";
    if (!this.uiOpacity) this.uiOpacity = this.node.getComponent(UIOpacity);
    this.uiOpacity.opacity = initialOpacity;
    this.panel.setScale(initialScale);
    this.node.active = true;
    if (text !== "") this.messageLabel.string = text;

    tween(this.node)
      .parallel(
        tween(this.uiOpacity).to(
          duration,
          { opacity: opacity },
          { easing: opacityEasing },
        ),
        tween(this.panel).to(
          duration,
          { scale: scale },
          { easing: scaleEasing },
        ),
      )
      .call(() => {
        if (show) showCallback();
        else this.node.active = false;
      })
      .start();
  }

  private onClickNext() {
    this.nextCallback();
    this.show(false);
  }
}
