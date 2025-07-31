import { _decorator, Component, Node } from "cc";
import { SelectUI } from "../UI/SelectUI";
const { ccclass, property } = _decorator;

@ccclass("UIManager")
export class UIManager extends Component {
  private static _instance: UIManager | null = null;

  @property({ type: SelectUI })
  private selectUI: SelectUI;

  @property({ type: Node })
  private loading: Node;

  public static get instance(): UIManager {
    if (this._instance) {
      return this._instance;
    }
    return null;
  }

  onLoad() {
    if (UIManager._instance && UIManager._instance !== this) {
      this.destroy();
      return;
    }
    UIManager._instance = this;
  }

  public showSelectUI(header: string, options: any[], defaultValue, callback) {
    this.selectUI.show(header, options, defaultValue, callback);
  }

  public showLoading(show: boolean) {
    this.loading.active = show;
  }
}
