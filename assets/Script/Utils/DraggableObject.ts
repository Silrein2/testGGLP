import { _decorator, Component, Node, EventTouch, Vec3, tween } from "cc";
const { ccclass, property } = _decorator;

export const DRAG_START_EVENT = "drag-start";
export const DRAG_END_EVENT = "drag-end";

@ccclass("DraggableObject")
export class DraggableObject extends Component {
  private isDragging: boolean = false;
  private touchOffset: Vec3 = new Vec3();
  private originalScale: Vec3 = new Vec3();
  private initialScale: Vec3 = new Vec3();
  public initialPosition: Vec3 = new Vec3();
  public disabled: boolean = false;

  onLoad() {
    this.setInitialPosition();
    this.originalScale.set(this.node.scale);
    this.initialScale.set(this.node.scale);
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onTouchStart(event: EventTouch) {
    if (this.disabled) return;
    this.isDragging = true;
    this.node.emit(DRAG_START_EVENT, this.node, this.node.worldPosition);
    const touchLocation = event.getUILocation();
    const nodePosition = this.node.position;

    this.touchOffset.x = nodePosition.x - touchLocation.x;
    this.touchOffset.y = nodePosition.y - touchLocation.y;

    this.node.setSiblingIndex(this.node.parent.children.length - 1);

    const newScale = this.initialScale.clone().add(new Vec3(0.2, 0.2, 0));
    tween(this.node)
      .to(0.2, { scale: newScale }, { easing: "backOut" })
      .start();
  }

  onTouchMove(event: EventTouch) {
    if (this.isDragging) {
      const touchLocation = event.getUILocation();
      this.node.setPosition(
        touchLocation.x + this.touchOffset.x,
        touchLocation.y + this.touchOffset.y,
      );
    }
  }

  onTouchEnd(event: EventTouch) {
    this.isDragging = false;
    this.node.emit(DRAG_END_EVENT, this.node, this.node.worldPosition);
    tween(this.node)
      .to(0.3, { scale: this.initialScale }, { easing: "backOut" })
      .start();
  }

  public setInitialPosition() {
    this.initialPosition.set(this.node.position);
  }

  public resetPosition() {
    this.node.setPosition(this.initialPosition);
  }

  public moveResetPosition(onComplete: Func = () => {}) {
    tween(this.node)
      .to(0.4, { position: this.initialPosition }, { easing: "backOut" })
      .call(() => {
        onComplete();
      })
      .start();
  }

  public setParent(parentNode: Node) {
    this.node.setParent(parentNode, true);
    Vec3.divide(this.initialScale, this.originalScale, parentNode.scale);
  }

  public setDisable(disable: boolean) {
    this.disabled = disable;
  }
}
