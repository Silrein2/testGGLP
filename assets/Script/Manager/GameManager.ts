import { _decorator, Component, Node } from "cc";
import { ApiClient } from "../Api/ApiClient";
import { AuthService } from "../Api/AuthService";
import { UserService } from "../Api/UserService";
import { DataManager } from "./DataManager";
import { UIManager } from "./UIManager";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  private static _instance: GameManager | null = null;

  private apiClient: ApiClient | null = null;
  public authService: AuthService | null = null;
  public userService: UserService | null = null;

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
    this.getLangauges();
  }

  initializeApi() {
    const BASE_API_URL = "https://beesafe.gamekaexternalprojects.com/";
    this.apiClient = new ApiClient(BASE_API_URL);
    this.authService = new AuthService(this.apiClient);
    this.userService = new UserService(this.apiClient);
  }

  public setAuthToken(token: string) {
    this.apiClient.setAuthToken(token);
  }

  private async getLangauges() {
    const data = await GameManager.instance.userService.getLanguages();
    DataManager.instance.setLanguages(data);
  }

  public showLanguageSetting() {
    const data = DataManager.instance.languages.map((x) => {
      return { text: x.name, value: x.code };
    });
    UIManager.instance.showSelectUI(
      "Select Your Language",
      data,
      null,
      this.onSelectLanguage.bind(this),
    );
  }

  private onSelectLanguage(code: string) {
    //console.log(code);
  }
}
