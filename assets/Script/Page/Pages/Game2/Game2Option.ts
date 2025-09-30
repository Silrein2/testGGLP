import {
  _decorator,
  Component,
  Label,
  Node,
  Sprite,
  Tween,
  tween,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
import { Game2Page } from "./Game2Page";
import {
  DRAG_END_EVENT,
  DRAG_START_EVENT,
  DraggableObject,
} from "../../../Utils/DraggableObject";
import { ButtonStates } from "../../Enums";
import { Game2Slot } from "./Game2Slot";
const { ccclass, property } = _decorator;

@ccclass("Game2Option")
export class Game2Option extends Component {
  private sprite: Sprite | null = null;
  private label: Label | null = null;
  private game2Page: Game2Page | null = null;
  private container: Node | null = null;
  private slots: Game2Slot[] = [];
  private resetTween: Tween<Node> | null = null;

  public draggableObject: DraggableObject | null = null;
  public data: any | null = null;

  onLoad() {
    this.sprite = this.node.getComponent(Sprite);
    this.label = this.node.getComponentInChildren(Label);
    this.draggableObject = this.node.getComponent(DraggableObject);
    this.draggableObject.node.on(DRAG_START_EVENT, this.onDragStart, this);
    this.draggableObject.node.on(DRAG_END_EVENT, this.onDragEnd, this);
  }

  onDestroy() {
    this.draggableObject.node.off(DRAG_START_EVENT, this.onDragStart, this);
    this.draggableObject.node.off(DRAG_END_EVENT, this.onDragEnd, this);
  }

  public init(data: any, slots: Game2Slot[], game2Page: Game2Page) {
    this.game2Page = game2Page;
    this.container = game2Page.optionLayout.node;
    this.data = data;
    this.label.string = data.text;
    this.slots = slots;
  }

  public setInitialPosition() {
    this.draggableObject.setInitialPosition();
  }

  private onDragStart() {
    if (this.resetTween) {
      this.resetTween.stop();
    }
    this.node.setParent(this.game2Page.node, true);
  }

  private onDragEnd() {
    if (this.draggableObject.disabled) return;
    const pos = new Vec2(this.node.worldPositionX, this.node.worldPositionY);
    let collided = false;
    let correct = false;
    this.slots.forEach((slot) => {
      if (!slot.node.activeInHierarchy) return;
      slot.collider.apply();
      if (slot.collider.worldAABB.contains(pos)) {
        collided = true;
        this.setParent(slot.node.parent);
        if (slot.data == (this.data.id as number)) {
          correct = true;
        }
      }
    });
    if (collided) {
      this.setState(correct ? ButtonStates.Correct : ButtonStates.Wrong);
      this.setDisable(true);
      this.game2Page.onDropOption(correct);
    } else {
      this.moveResetPosition();
    }
  }

  public setParent(parentNode: Node) {
    this.draggableObject.setParent(parentNode);
  }

  public setDisable(disable: boolean) {
    this.draggableObject.setDisable(disable);
  }

  private moveResetPosition() {
    this.resetTween = tween(this.node)
      .to(0.4, { position: this.getInitialPosition() }, { easing: "backOut" })
      .call(() => {
        this.node.setParent(this.container, true);
        this.draggableObject.resetPosition();
      })
      .start();
  }

  public getInitialPosition(): Vec3 {
    const containerLocalPos = this.draggableObject.initialPosition;
    const containerUITransform = this.container.getComponent(UITransform);
    const worldPos =
      containerUITransform.convertToWorldSpaceAR(containerLocalPos);
    const parentUITransform = this.node.parent.getComponent(UITransform);
    const parentLocalPos = parentUITransform.convertToNodeSpaceAR(worldPos);
    return parentLocalPos;
  }

  public setState(state: ButtonStates) {
    switch (state) {
      case ButtonStates.Normal:
        this.sprite.spriteFrame = this.game2Page.optionNormalSpriteFrame;
        break;
      case ButtonStates.Correct:
        this.sprite.spriteFrame = this.game2Page.optionCorrectSpriteFrame;
        break;
      case ButtonStates.Wrong:
        this.sprite.spriteFrame = this.game2Page.optionWrongSpriteFrame;
        break;
    }
  }
}
