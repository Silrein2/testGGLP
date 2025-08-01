import { _decorator, Component, Node, tween, Vec3 } from "cc";
const { ccclass, property } = _decorator;

export const TRANSITION_HIDDEN = "transition-hidden";

@ccclass("Transition")
export class Transition extends Component {
  @property({ type: Node })
  top: Node | null = null;

  @property({ type: Node })
  bottom: Node | null = null;

  @property({ type: Node })
  character: Node | null = null;

  @property({ type: Node })
  blockInput: Node | null = null;

  play() {
    this.setActive(true);
    const closeTopPos = new Vec3(0, 385.5, 0);
    const closeBottomPos = new Vec3(0, -318, 0);
    const openTopPos = new Vec3(0, 1096, 0);
    const openBottomPos = new Vec3(0, -1164, 0);
    const characterTopPos = new Vec3(0, 193, 0);
    const characterBottomPos = new Vec3(0, -193, 0);
    const characterStartPos = new Vec3(0, -1044, 0);
    const characterEndPos = new Vec3(0, 1044, 0);

    this.top.setPosition(openTopPos);
    this.bottom.setPosition(openBottomPos);
    this.character.setPosition(characterStartPos);

    tween(this.node)
      .parallel(
        tween(this.top).to(
          1,
          { position: closeTopPos },
          { easing: "cubicOut" },
        ),
        tween(this.bottom).to(
          1,
          { position: closeBottomPos },
          { easing: "cubicOut" },
        ),
        tween(this.character).to(
          1,
          { position: characterTopPos },
          { easing: "cubicOut" },
        ),
      )
      .call(() => {
        this.node.emit(TRANSITION_HIDDEN);
      })
      .then(
        tween(this.character).to(
          0.5,
          { position: characterBottomPos },
          { easing: "linear" },
        ),
      )
      .parallel(
        tween(this.top).to(1, { position: openTopPos }, { easing: "cubicOut" }),
        tween(this.bottom).to(
          1,
          { position: openBottomPos },
          { easing: "cubicOut" },
        ),
        tween(this.character).to(
          1,
          { position: characterEndPos },
          { easing: "cubicOut" },
        ),
      )
      .call(() => {
        this.setActive(false);
      })
      .start();
  }

  setActive(show: boolean) {
    this.blockInput.active = show;
    this.top.active = show;
    this.bottom.active = show;
    this.character.active = show;
  }
}
