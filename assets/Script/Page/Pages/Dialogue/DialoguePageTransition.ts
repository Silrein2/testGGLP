import { _decorator, Component, Node, tween, Tween, UIOpacity, Vec3 } from "cc";
import { PageTransition } from "../../PageTransition";
const { ccclass, property } = _decorator;

@ccclass("DialoguePageTransition")
export class DialoguePageTransition extends PageTransition {
  @property({ type: Node })
  private dialogueBox: Node | null = null;

  @property({ type: Node })
  private character: Node | null = null;

  @property({ type: Node })
  private skip: Node | null = null;

  private characterUIOpacity: UIOpacity | null = null;
  private enterTween: Tween<Node> | null = null;
  private exitTween: Tween<Node> | null = null;

  private dialogueBoxInitialPos = new Vec3();
  private skipInitialPos = new Vec3();
  private characterInitialPos = new Vec3();
  private characterInitialScale = new Vec3();
  private characterInitialOpacity: number = 255;

  private dialogueBoxFromPos = new Vec3();
  private skipFromPos = new Vec3();
  private characterFromPos = new Vec3();
  private characterFromScale = new Vec3();
  private characterFromOpacity: number = 0;

  onLoad() {
    this.enterTransitionEnabled = true;
    this.exitTransitionEnabled = true;

    this.dialogueBoxInitialPos = this.dialogueBox.position.clone();
    this.skipInitialPos = this.skip.position.clone();
    this.characterInitialPos = this.character.position.clone();
    this.characterInitialScale = this.character.scale.clone();
    this.characterUIOpacity = this.character.getComponent(UIOpacity);

    this.dialogueBoxFromPos.set(
      this.dialogueBoxInitialPos.x,
      -1250,
      this.dialogueBoxInitialPos.z,
    );

    this.skipFromPos.set(this.skipInitialPos.x, 840, this.skipInitialPos.z);
    this.characterFromPos.set(
      -1260,
      this.characterInitialPos.y,
      this.characterInitialPos.z,
    );

    this.characterFromScale.set(
      -this.characterInitialScale.x,
      this.characterInitialScale.y,
      this.characterInitialScale.z,
    );

    this.enterTween = tween(this.node)
      .parallel(
        tween(this.dialogueBox).to(
          0.8,
          { position: this.dialogueBoxInitialPos },
          { easing: "cubicOut" },
        ),
        tween(this.skip).to(
          0.8,
          { position: this.skipInitialPos },
          { easing: "backOut" },
        ),
      )
      .parallel(
        tween(this.characterUIOpacity).to(
          1,
          { opacity: this.characterInitialOpacity },
          { easing: "cubicOut" },
        ),
        tween(this.character).to(
          1,
          { position: this.characterInitialPos },
          { easing: "backOut" },
        ),
      )
      .call(() => {
        this.onEnterComplete();
      });

    this.exitTween = tween(this.node)
      .then(tween(this.character).set({ scale: this.characterFromScale }))
      .delay(0.25)
      .parallel(
        tween(this.characterUIOpacity).to(
          1,
          { opacity: 0 },
          { easing: "cubicIn" },
        ),
        tween(this.character).to(
          1,
          { position: this.characterFromPos },
          { easing: "backIn" },
        ),
      )
      .parallel(
        tween(this.dialogueBox).to(
          0.8,
          { position: this.dialogueBoxFromPos },
          { easing: "cubicIn" },
        ),
        tween(this.skip).to(
          0.8,
          { position: this.skipFromPos },
          { easing: "backIn" },
        ),
      )
      .call(() => {
        this.onExitComplete();
      });
  }

  public onEnter() {
    this.dialogueBox.setPosition(this.dialogueBoxFromPos);
    this.skip.setPosition(this.skipFromPos);
    this.character.setPosition(this.characterFromPos);
    this.character.setScale(this.characterInitialScale);
    this.characterUIOpacity.opacity = 0;
    this.scheduleOnce(() => {
      this.enterTween.start();
    }, this.stateEnterTransitionDuration * 0.7);
  }

  public onExit() {
    this.exitTween.start();
  }
}
