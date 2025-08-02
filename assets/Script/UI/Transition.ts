import {
  _decorator,
  Component,
  Node,
  Sprite,
  SpriteFrame,
  Tween,
  tween,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Transition")
export class Transition extends Component {
  @property({ type: Node })
  private top: Node | null = null;

  @property({ type: Node })
  private bottom: Node | null = null;

  @property({ type: Node })
  private character: Node | null = null;

  @property({ type: Node })
  private blockInput: Node | null = null;

  @property({ type: Sprite })
  private characterSprite: Sprite | null = null;

  @property({ type: SpriteFrame })
  private characterSpriteFrame: SpriteFrame | null = null;

  @property({ type: [SpriteFrame] })
  private characterSpriteFrames: SpriteFrame[] = [];

  private _moveDuration: number = 1;
  private _pauseDuration: number = 0.5;

  private transitionTween: Tween<Node> | null = null;
  private characterTween: Tween<Sprite> | null = null;

  private closeTopPos = new Vec3(0, 385.5, 0);
  private closeBottomPos = new Vec3(0, -318, 0);
  private openTopPos = new Vec3(0, 1096, 0);
  private openBottomPos = new Vec3(0, -1164, 0);
  private characterTopPos = new Vec3(0, 193, 0);
  private characterBottomPos = new Vec3(0, -193, 0);
  private characterStartPos = new Vec3(0, -1044, 0);
  private characterEndPos = new Vec3(0, 1044, 0);

  public get moveDuration(): number {
    return this._moveDuration;
  }

  public get pauseDuration(): number {
    return this._pauseDuration;
  }

  onLoad() {
    this.transitionTween = tween(this.node)
      .parallel(
        tween(this.top).to(
          this.moveDuration,
          { position: this.closeTopPos },
          { easing: "cubicOut" },
        ),
        tween(this.bottom).to(
          this.moveDuration,
          { position: this.closeBottomPos },
          { easing: "cubicOut" },
        ),
        tween(this.character).to(
          this.moveDuration,
          { position: this.characterTopPos },
          { easing: "cubicOut" },
        ),
      )
      .then(
        tween(this.character).to(
          this.pauseDuration,
          { position: this.characterBottomPos },
          { easing: "linear" },
        ),
      )
      .parallel(
        tween(this.top).to(
          1,
          { position: this.openTopPos },
          { easing: "cubicOut" },
        ),
        tween(this.bottom).to(
          this.moveDuration,
          { position: this.openBottomPos },
          { easing: "cubicOut" },
        ),
        tween(this.character).to(
          this.moveDuration,
          { position: this.characterEndPos },
          { easing: "cubicOut" },
        ),
      )
      .call(() => {
        this.stopSpriteSwap();
        this.setActive(false);
      });
  }

  public play() {
    this.setActive(true);

    this.top.setPosition(this.openTopPos);
    this.bottom.setPosition(this.openBottomPos);
    this.character.setPosition(this.characterStartPos);

    this.startSpriteFrameTween();
    this.transitionTween.start();
  }

  private startSpriteFrameTween() {
    const randomIndex = Math.floor(
      Math.random() * this.characterSpriteFrames.length,
    );

    const swapSequence = tween()
      .set({ spriteFrame: this.characterSpriteFrame })
      .delay(0.3)
      .set({ spriteFrame: this.characterSpriteFrames[randomIndex] })
      .delay(0.3);
    this.characterTween = tween(this.characterSprite)
      .repeatForever(swapSequence)
      .start();
  }

  private stopSpriteSwap() {
    if (this.characterTween) {
      this.characterTween.stop();
      this.characterTween = null;
    }
  }

  private setActive(show: boolean) {
    this.blockInput.active = show;
    this.top.active = show;
    this.bottom.active = show;
    this.character.active = show;
  }
}
