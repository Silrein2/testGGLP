import {
  _decorator,
  Button,
  CCBoolean,
  Component,
  EditBox,
  Label,
  Node,
} from "cc";
import { Page } from "../Page";
import { PageStates } from "../Enums";
import { GameManager } from "../../Manager/GameManager";
import { UIManager } from "../../Manager/UIManager";
import { DataManager } from "../../Manager/DataManager";
import { isNullOrEmpty } from "../../Utils/Utils";
import { ValidationError } from "../../Api/ApiClient";
const { ccclass, property } = _decorator;

@ccclass("LoginPage")
export class LoginPage extends Page {
  @property({ type: EditBox })
  private emailInput: EditBox | null = null;

  @property({ type: Label })
  private businessUnitLabel: Label | null = null;

  @property
  private quickLogin: boolean = false;

  private businessUnitId: number | null = null;

  start() {
    this.getBusinessUnits();
    this.getAuthToken();
  }

  private getBusinessUnits() {
    GameManager.instance.userService.getBusinessUnits();
  }

  protected setPageState() {
    this.pageState = PageStates.Login;
  }

  public onEnter() {
    super.onEnter();
  }

  private async getAuthToken() {
    if (!this.quickLogin) return;
    UIManager.instance.showLoading(true);
    GameManager.instance.setAuthToken(
      "8637a47575328dd08eecd138284889edce3dc504",
    );
    await GameManager.instance.userService.fetchUserState();
    this.transitionPage(PageStates.DialogueIntro);
    UIManager.instance.showLoading(false);
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
      await GameManager.instance.userService.fetchUserState();
      this.transitionPage(PageStates.DialogueIntro);
    } catch (error) {
      console.error(error);
      let errorMessage = error;
      if (error instanceof ValidationError) {
        errorMessage = error.printError();
      }
      UIManager.instance.showMessageUI("Oops!", errorMessage, "OK");
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
