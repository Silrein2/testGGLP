import { _decorator, Button, Component, EditBox, Label, Node } from "cc";
import { Page } from "../Page";
import { PageStates } from "../Enums";
import { GameManager } from "../../Manager/GameManager";
import { UIManager } from "../../Manager/UIManager";
import { DataManager } from "../../Manager/DataManager";
import { isNullOrEmpty } from "../../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("LoginPage")
export class LoginPage extends Page {
  @property({ type: EditBox })
  emailInput: EditBox;

  @property({ type: Label })
  businessUnitLabel: Label;

  @property({ type: Button })
  loginButton: Button;

  private businessUnitId: number | null = null;
  onLoad() {
    this.loginButton.node.on(Button.EventType.CLICK, this.onClickLogin, this);
  }

  start() {
    this.getBusinessUnits();
  }

  private async getBusinessUnits() {
    const data = await GameManager.instance.userService.getBusinessUnits();
    DataManager.instance.setBusinessUnits(data);
  }

  protected setPageState() {
    this.pageState = PageStates.Login;
  }

  public onEnter() {
    super.onEnter();
  }

  private async onClickLogin() {
    if (isNullOrEmpty(this.emailInput.string) || this.businessUnitId == null) {
      return;
    }
    try {
      UIManager.instance.showLoading(true);
      const data = await GameManager.instance.authService.login(
        this.emailInput.string,
        this.businessUnitId,
      );
      GameManager.instance.setAuthToken(data.auth_token);
      this.pageManager.transitionState(PageStates.DialogueIntro);
    } catch (error) {
      console.error(error);
    }
    UIManager.instance.showLoading(false);
  }

  private onClickBusinessUnit() {
    const data = DataManager.instance.businessUnits.map((x) => {
      return { text: x.name, value: x.id };
    });
    UIManager.instance.showSelectUI(
      "Select Your Business Unit",
      data,
      this.businessUnitId,
      this.onSelectBusinessUnit.bind(this),
    );
  }

  private onSelectBusinessUnit(value: number) {
    this.businessUnitId = value;
    this.businessUnitLabel.string = DataManager.instance.businessUnits.find(
      (x) => x.id == value,
    ).name;
  }
}
