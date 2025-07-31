import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

export interface AuthToken {
  auth_token: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface BusinessUnit {
  id: number;
  name: string;
  description: string;
}

@ccclass("DataManager")
export class DataManager extends Component {
  private static _instance: DataManager | null = null;

  public languages: Language[];
  public businessUnits: BusinessUnit[];

  public static get instance(): DataManager {
    if (this._instance) {
      return this._instance;
    }
    return null;
  }

  onLoad() {
    if (DataManager._instance && DataManager._instance !== this) {
      this.destroy();
      return;
    }
    DataManager._instance = this;
  }

  public setLanguages(languages: Language[]) {
    this.languages = languages;
  }

  public setBusinessUnits(businessUnits: BusinessUnit[]) {
    this.businessUnits = businessUnits;
  }
}
