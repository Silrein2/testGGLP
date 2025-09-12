import { _decorator, CCString, Component, Label, Node } from "cc";
import { LocalizationManager } from "../Manager/LocalizationManager";
const { ccclass, property } = _decorator;

@ccclass("LocalizedLabel")
export class LocalizedLabel extends Component {
  @property
  private key: string = "";

  private labelComponent: Label = null;

  onLoad() {
    this.labelComponent = this.getComponent(Label);
    this.updateLabel();
  }

  onEnable() {
    this.updateLabel();
  }

  public updateLabel() {
    if (!this.labelComponent || !this.key) {
      return;
    }

    const localizedString = LocalizationManager.instance.getLocalizedString(
      this.key,
    );
    this.labelComponent.string = localizedString;
  }
}
