import { _decorator, Component, Node, EventTouch, Vec3 } from "cc";
const { ccclass, property } = _decorator;

export const DRAG_END_EVENT = "drag-end";

@ccclass("DraggableObject")
export class DraggableObject extends Component {
  private isDragging: boolean = false;
  private touchOffset: Vec3 = new Vec3();
  private initialPosition: Vec3 = new Vec3();

  onLoad() {
    this.initialPosition.set(this.node.position);
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
    this.isDragging = true;
    const touchLocation = event.getUILocation();
    const nodePosition = this.node.position;

    this.touchOffset.x = nodePosition.x - touchLocation.x;
    this.touchOffset.y = nodePosition.y - touchLocation.y;

    this.node.setSiblingIndex(this.node.parent.children.length - 1);
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
  }

  public resetPosition() {
    this.node.setPosition(this.initialPosition);
  }
}
