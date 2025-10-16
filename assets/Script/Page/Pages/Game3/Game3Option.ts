import {
  _decorator,
  Collider2D,
  Component,
  Label,
  Node,
  Sprite,
  Vec2,
} from "cc";
const { ccclass, property } = _decorator;
import {
  DRAG_END_EVENT,
  DraggableObject,
} from "../../../Utils/DraggableObject";
import { Game3Page } from "./Game3Page";
import { ButtonStates } from "../../Enums";
import { FakeBossAnswerOption } from "../../../Manager/DataManager";

@ccclass("Game3Option")
export class Game3Option extends Component {
  private sprite: Sprite | null = null;
  private label: Label | null = null;
  private game3Page: Game3Page | null = null;
  private collider: Collider2D | null = null;
  private slotCollider: Collider2D | null = null;

  public draggableObject: DraggableObject | null = null;
  public data: FakeBossAnswerOption | null = null;

  onLoad() {
    this.sprite = this.node.getComponent(Sprite);
    this.collider = this.node.getComponent(Collider2D);
    this.draggableObject = this.node.getComponent(DraggableObject);
    this.draggableObject.node.on(DRAG_END_EVENT, this.onDragEnd, this);
    this.label = this.node.getComponentInChildren(Label);
  }

  public init(
    data: FakeBossAnswerOption,
    slotCollider: Collider2D,
    game3Page: Game3Page,
  ) {
    this.node.active = data !== null;
    if (data === null) return;
    this.game3Page = game3Page;
    this.data = data;
    this.slotCollider = slotCollider;
    this.label.string = data.text;
    this.setState(ButtonStates.Normal);
    this.setDisable(false);
    this.resetPosition();
  }

  private onDragEnd() {
    if (this.draggableObject.disabled) return;
    const pos = new Vec2(this.node.worldPositionX, this.node.worldPositionY);
    if (this.slotCollider.worldAABB.contains(pos)) {
      const correct = this.data.is_correct;
      this.setState(correct ? ButtonStates.Correct : ButtonStates.Wrong);
      if (!correct) {
        this.moveResetPosition();
      } else {
        this.setDisable(true);
      }
      this.game3Page.onDropOption(
        this.data.is_correct,
        this.data.bee_safe_text,
      );
    } else {
      this.moveResetPosition();
    }
  }

  public resetPosition() {
    this.draggableObject.resetPosition();
  }

  public moveResetPosition() {
    this.draggableObject.moveResetPosition(() => {
      this.setState(ButtonStates.Normal);
    });
  }

  public setDisable(disable: boolean) {
    this.draggableObject.setDisable(disable);
  }

  public setState(state: ButtonStates) {
    switch (state) {
      case ButtonStates.Normal:
        this.sprite.spriteFrame = this.game3Page.optionNormalSpriteFrame;
        break;
      case ButtonStates.Correct:
        this.sprite.spriteFrame = this.game3Page.optionCorrectSpriteFrame;
        break;
      case ButtonStates.Wrong:
        this.sprite.spriteFrame = this.game3Page.optionWrongSpriteFrame;
        break;
    }
  }
}
