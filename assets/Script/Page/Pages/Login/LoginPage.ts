import {
  _decorator,
  Button,
  Color,
  Component,
  EditBox,
  instantiate,
  Label,
  Node,
  Prefab,
  ScrollView,
  Sprite,
  tween,
  UIOpacity,
} from "cc";
import { Page } from "../../Page";
import { PageStates } from "../../Enums";
import { GameManager } from "../../../Manager/GameManager";
import { UIManager } from "../../../Manager/UIManager";
import { DataManager } from "../../../Manager/DataManager";
import { isNullOrEmpty } from "../../../Utils/Utils";
import { ValidationError } from "../../../Api/ApiClient";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
import { SelectUIButton } from "../../../UI/SelectUIButton";
const { ccclass, property } = _decorator;

@ccclass("LoginPage")
export class LoginPage extends Page {
  @property({ type: EditBox })
  private emailInput: EditBox | null = null;

  @property({ type: Label })
  private businessUnitLabel: Label | null = null;

  @property({ type: ScrollView })
  private locationScrollView: ScrollView | null = null;

  @property({ type: Sprite })
  private handleSprite: Sprite | null = null;

  @property({ type: Node })
  private locationContainer: Node | null = null;

  @property({ type: Prefab })
  private locationOptionPrefab: Prefab | null = null;

  @property
  private quickLogin: boolean = false;

  private businessUnitId: number | null = null;
  private offlineLogin: boolean = false;
  private selectUIButtons: SelectUIButton[] = [];
  private locationUiOpacity: UIOpacity | null = null;
  private lockLocation: boolean = false;

  onLoad() {
    this.locationUiOpacity = this.locationScrollView.getComponent(UIOpacity);
  }

  start() {
    // this.offlineLogin = GameManager.instance.offlineLogin;
    this.offlineLogin = true;
    if (!this.offlineLogin) this.getBusinessUnits();
    this.getAuthToken();

    console.log(this.offlineLogin);
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
    if (this.offlineLogin) {
      DataManager.instance.setDummyUserState();
      this.transitionPage(PageStates.DialogueIntro);
      return;
    }
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
      UIManager.instance.showMessageUI(
        "Oops!",
        errorMessage,
        LocalizationManager.instance.getLocalizedString("general.okay"),
      );
    }
    UIManager.instance.showLoading(false);
  }

  private populateLocation() {
    const options = DataManager.instance.businessUnits.map((x) => {
      return { text: x.name, value: x.id };
    });

    for (const option of this.selectUIButtons) {
      option.node.destroy();
    }
    this.selectUIButtons = [];

    for (const option of options) {
      const optionNode = instantiate(this.locationOptionPrefab) as Node;
      this.locationContainer.addChild(optionNode);

      const optionButton = optionNode.getComponent(Button);
      const selectUIButton = optionNode.getComponent(SelectUIButton);
      selectUIButton.init(option);
      this.selectUIButtons.push(selectUIButton);

      if (optionButton) {
        optionButton.node.on(
          Button.EventType.CLICK,
          () => {
            this.onSelectBusinessUnit(option.value);
          },
          this,
        );
      }
    }

    this.scrollBarOpacity();
  }

  private onClickBusinessUnit() {
    if (this.lockLocation) return;
    this.lockLocation = true;
    const show = !this.locationScrollView.node.active;
    const from = show ? 0 : 255;
    const to = show ? 255 : 0;
    const easing = show ? "sineOut" : "sineIn";
    const duration = show ? 0.2 : 0.15;

    this.locationUiOpacity.opacity = from;

    if (show) {
      this.populateLocation();
      this.locationScrollView.scrollToTop(0.01);
      this.locationScrollView.node.active = true;
    }
    tween(this.locationUiOpacity)
      .to(duration, { opacity: to }, { easing: easing })
      .call(() => {
        if (!show) this.locationScrollView.node.active = false;
        this.lockLocation = false;
      })
      .start();
  }

  private onSelectBusinessUnit(value: number) {
    this.businessUnitId = value;
    this.businessUnitLabel.string = DataManager.instance.businessUnits.find(
      (x) => x.id == value,
    ).name;
    this.onClickBusinessUnit();
  }

  private scrollBarOpacity() {
    this.scheduleOnce(() => {
      const spriteComp = this.handleSprite;
      const currentColor = spriteComp.color;
      spriteComp.color = new Color(
        currentColor.r,
        currentColor.g,
        currentColor.b,
        255,
      );
    }, 0.1);
  }
}
