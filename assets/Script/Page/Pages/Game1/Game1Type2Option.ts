import { _decorator, Component, Label, Node, Vec3 } from "cc";
import {
  DraggableObject,
  DRAG_END_EVENT,
} from "../../../Utils/DraggableObject";
import { DraggableSnappingUtils } from "../../../Utils/DraggableSnappingUtils";
import { Game1Page } from "./Game1Page";
import { getComponentInParent } from "../../../Utils/Utils";
import { Game1Type2Slot } from "./Game1Type2Slot";
const { ccclass, property } = _decorator;

@ccclass("Game1Type2Option")
export class Game1Type2Option extends Component {
  private label: Label;
  private game1Page: Game1Page;
  private slots: Node[];

  public draggableObject: DraggableObject;
  public data: any;

  onLoad() {
    this.draggableObject = this.node.getComponent(DraggableObject);
    this.label = this.node.getComponentInChildren(Label);
    this.game1Page = getComponentInParent(this.node, Game1Page);
    this.draggableObject.node.on(DRAG_END_EVENT, this.onDragEnd, this);
  }

  public init(data: any, slots: Game1Type2Slot[]) {
    this.data = data;
    this.label.string = data.text;
    this.slots = slots.map((x) => x.slot);
  }

  private onDragEnd(draggedNode: Node, draggedWorldPosition: Vec3) {
    const snappedSlot = DraggableSnappingUtils.snapToNearestSlot(
      draggedNode,
      draggedWorldPosition,
      this.slots,
      10,
    );

    if (snappedSlot) {
      const type2Slot: Game1Type2Slot = getComponentInParent(
        snappedSlot,
        Game1Type2Slot,
      );
      this.game1Page.onDropType2Option(this.data, type2Slot.data, this);
    } else {
      this.resetPosition();
      this.game1Page.onDropType2Option(this.data, null, this);
    }
  }

  public resetPosition() {
    this.draggableObject?.resetPosition();
  }
}
