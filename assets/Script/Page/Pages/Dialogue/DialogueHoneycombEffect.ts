import { _decorator, Component, Node, tween, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DialogueHoneycombEffect")
export class DialogueHoneycombEffect extends Component {
  @property({ type: Node })
  highlight: Node | null = null;

  @property({ type: Node })
  honeycomb: Node | null = null;

  start() {
    tween(this.highlight)
      .by(5, { angle: 360 }, { easing: "linear" })
      .repeatForever()
      .start();

    tween(this.honeycomb)
      .to(1, { scale: new Vec3(1.05, 1.05, 1.05) }, { easing: "sineInOut" })
      .to(1, { scale: Vec3.ONE }, { easing: "sineInOut" })
      .union()
      .repeatForever()
      .start();
  }
}
