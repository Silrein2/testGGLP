import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PopupUI")
export class PopupUI extends Component {
  @property({ type: UIOpacity })
  private bgUIOpacity: UIOpacity | null = null;
  @property({ type: Node })
  private panel: Node | null = null;
  private initialBgOpacity: number = 205;

  onLoad() {
    //this.initialBgOpacity = this.bgUIOpacity.opacity;
  }

  protected onShow() {
    this.setActive(true);
    this.panel.setScale(Vec3.ZERO);
    this.bgUIOpacity.opacity = 0;
    tween(this.panel)
      .to(0.3, { scale: Vec3.ONE }, { easing: "backOut" })
      .start();
    tween(this.bgUIOpacity)
      .to(0.3, { opacity: this.initialBgOpacity }, { easing: "quadOut" })
      .start();
  }

  protected onClose(callback: Function = () => {}) {
    tween(this.panel)
      .to(0.2, { scale: Vec3.ZERO }, { easing: "backIn" })
      .call(() => {
        this.setActive(false);
        callback();
      })
      .start();

    tween(this.bgUIOpacity)
      .to(0.2, { opacity: 0 }, { easing: "quadIn" })
      .start();
  }

  private setActive(active: boolean) {
    this.bgUIOpacity.node.active = active;
    this.node.active = active;
  }
}
