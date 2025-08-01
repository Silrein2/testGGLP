import { Node, tween, Vec3 } from "cc";

export class DraggableSnappingUtils {
  public static snapToNearestSlot(
    draggedNode: Node,
    draggedWorldPosition: Vec3,
    slots: Node[],
    snapRadius: number,
  ): Node | null {
    let closestSlot: Node | null = null;
    let minDistanceSq: number = snapRadius * snapRadius;

    slots.forEach((slotNode) => {
      const slotWorldPosition = slotNode.worldPosition;

      const distanceSq = Vec3.distance(draggedWorldPosition, slotWorldPosition);

      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq;
        closestSlot = slotNode;
      }
    });

    if (closestSlot) {
      //draggedNode.setWorldPosition(closestSlot.worldPosition);
      tween(draggedNode)
        .to(
          0.4,
          { worldPosition: closestSlot.worldPosition },
          { easing: "backOut" },
        )
        .start();
      return closestSlot;
    }
    return null;
  }
}
