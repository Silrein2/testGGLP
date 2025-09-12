import { _decorator, Component, Node } from "cc";
import { ApiClient } from "../Api/ApiClient";
import { AuthService } from "../Api/AuthService";
import { UserService } from "../Api/UserService";
import { QuizService } from "../Api/QuizService";
import { DataManager } from "./DataManager";
import { UIManager } from "./UIManager";
import { Timer } from "../Utils/Timer";
import { PageManager } from "../Page/PageManager";
import { LocalizationManager } from "./LocalizationManager";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  private static _instance: GameManager | null = null;

  @property({ type: PageManager })
  private pageManager: PageManager | null = null;

  @property({ type: Timer })
  public timer: Timer | null = null;

  @property
  public offlineLogin: boolean = false;

  private apiClient: ApiClient | null = null;
  public authService: AuthService | null = null;
  public userService: UserService | null = null;
  public quizService: QuizService | null = null;

  private languageCode: string = "en";

  public static get instance(): GameManager {
    if (this._instance) {
      return this._instance;
    }
    return null;
  }

  onLoad() {
    if (GameManager._instance && GameManager._instance !== this) {
      this.destroy();
      return;
    }
    GameManager._instance = this;
    this.initializeApi();
  }

  start() {
    if (!this.offlineLogin) this.getLangauges();
  }

  initializeApi() {
    const defaultHeaders = {
      "Accept-Language": this.languageCode,
    };
    const BASE_API_URL = "https://beesafe.gamekaexternalprojects.com/";
    this.apiClient = new ApiClient(BASE_API_URL, defaultHeaders);
    this.authService = new AuthService(this.apiClient);
    this.userService = new UserService(this.apiClient);
    this.quizService = new QuizService(this.apiClient);
  }

  public setAuthToken(token: string) {
    this.apiClient.setAuthToken(token);
  }

  private getLangauges() {
    GameManager.instance.userService.getLanguages();
  }

  public showLanguageSetting() {
    const data = DataManager.instance.languages.map((x) => {
      return { text: x.name, value: x.code };
    });
    UIManager.instance.showSelectUI(
      LocalizationManager.instance.getLocalizedString(
        "general.select_your_language",
      ),
      data,
      this.languageCode,
      this.onSelectLanguage.bind(this),
    );
  }

  private onSelectLanguage(code: string) {
    this.languageCode = code;
    this.apiClient.setLanguage(code);
    //this.pageManager.resetPage();
  }

  private onClickPause() {
    this.timer.stopTimer();
    UIManager.instance.showMessageUI(
      LocalizationManager.instance.getLocalizedString("general.pause"),
      LocalizationManager.instance.getLocalizedString("general.pause_body"),
      LocalizationManager.instance.getLocalizedString("general.resume"),
      () => {
        this.timer.startTimer();
      },
    );
  }

  private onClickHome() {
    this.pageManager.transitionToHomePage();
  }
}
