import {
  _decorator,
  BoxCollider2D,
  Color,
  Component,
  Graphics,
  Node,
  Size,
  UITransform,
  Vec2,
} from "cc";
import { PhishingIndicator } from "../../../Manager/DataManager";
const { ccclass, property } = _decorator;

@ccclass("Game2Slot")
export class Game2Slot extends Component {
  @property
  public data: string = "";

  public collider: BoxCollider2D | null = null;
  private uiTransform: UITransform | null = null;
  private graphics: Graphics | null = null;

  onLoad() {
    this.collider = this.node.getComponent(BoxCollider2D);
  }

  public init(data: PhishingIndicator, parentUITransform: UITransform) {
    this.collider = this.node.getComponent(BoxCollider2D);
    this.uiTransform = this.node.getComponent(UITransform);
    this.data = data.label;
    const { x1, x2, y1, y2 } = data;
    const width = parentUITransform.width;
    const height = parentUITransform.height;
    this.uiTransform.contentSize = new Size(width, height);
    const boxWidth = (x2 - x1) * width;
    const boxHeight = (y2 - y1) * height;
    const centerXRatio = (x1 + x2) / 2;
    const centerYRatio = (y1 + y2) / 2;
    const offsetX = (centerXRatio - 0.5) * width;
    const offsetY = -centerYRatio * height;
    this.collider.size = new Size(boxWidth, boxHeight);
    this.collider.offset = new Vec2(offsetX, offsetY);

    //this.drawDebugBox(boxWidth, boxHeight, offsetX, offsetY);
  }

  private drawDebugBox(
    width: number,
    height: number,
    offsetX: number,
    offsetY: number,
  ): void {
    this.graphics = this.node.getComponent(Graphics);
    if (!this.graphics) {
      this.graphics = this.node.addComponent(Graphics);
    }

    this.graphics.clear();

    const x = offsetX - width / 2;
    const y = offsetY - height / 2;

    this.graphics.strokeColor = Color.RED;
    this.graphics.lineWidth = 4;

    this.graphics.fillColor = new Color(0, 0, 0, 0);

    this.graphics.rect(x, y, width, height);
    this.graphics.fill();
    this.graphics.stroke();
  }
}
