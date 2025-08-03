import { _decorator, Component, Label, Node } from "cc";
import { PopupUI } from "./PopupUI";
const { ccclass, property } = _decorator;

@ccclass("MessageUI")
export class MessageUI extends PopupUI {
  @property({ type: Label })
  private headerLabel: Label | null = null;

  @property({ type: Label })
  private messageLabel: Label | null = null;

  @property({ type: Label })
  private buttonLabel: Label | null = null;

  private callback: Function | null = null;

  public show(
    header: string,
    message: string,
    buttonText: string,
    callback: Function = () => {},
  ) {
    this.headerLabel.string = header;
    this.messageLabel.string = message;
    this.buttonLabel.string = buttonText;
    this.callback = callback;
    this.onShow();
  }

  private onClickClose() {
    this.onClose(this.callback);
  }
}
