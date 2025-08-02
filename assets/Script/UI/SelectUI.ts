import {
  _decorator,
  Button,
  Component,
  instantiate,
  Label,
  Node,
  Prefab,
  tween,
  UIOpacity,
  Vec3,
} from "cc";
import { SelectUIButton } from "./SelectUIButton";
import { ButtonStates } from "../Page/Enums";
import { PopupUI } from "./PopupUI";
const { ccclass, property } = _decorator;

@ccclass("SelectUI")
export class SelectUI extends PopupUI {
  @property({ type: Label })
  private headerLabel: Label | null = null;

  @property({ type: Prefab })
  private selectOptionPrefab: Prefab | null = null;

  @property({ type: Node })
  private optionsContainer: Node | null = null;

  private selectUIButtons: SelectUIButton[] = [];

  public show(
    header: string,
    options: any[],
    defaultValue: any,
    callback: Function,
  ) {
    this.headerLabel.string = header;

    this.optionsContainer.removeAllChildren();
    this.selectUIButtons = [];
    for (const option of options) {
      const optionNode = instantiate(this.selectOptionPrefab) as Node;
      this.optionsContainer.addChild(optionNode);

      const optionButton = optionNode.getComponent(Button);
      const selectUIButton = optionNode.getComponent(SelectUIButton);
      selectUIButton.init(option);
      this.selectUIButtons.push(selectUIButton);

      if (optionButton) {
        optionButton.node.on(
          Button.EventType.CLICK,
          () => {
            callback(option.value);
            this.onClickClose();
          },
          this,
        );
      }
    }
    this.onOptionSelected(defaultValue);
    this.onShow();
  }

  private onOptionSelected(value: any) {
    for (const selectUIButton of this.selectUIButtons) {
      if (value === selectUIButton.data.value) {
        selectUIButton.setState(ButtonStates.Selected);
      } else {
        selectUIButton.setState(ButtonStates.Normal);
      }
    }
  }

  private onClickClose() {
    this.onClose();
  }
}
