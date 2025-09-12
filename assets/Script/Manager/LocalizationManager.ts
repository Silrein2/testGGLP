import { _decorator, Component, JsonAsset, Node, resources } from "cc";
const { ccclass, property } = _decorator;

@ccclass("LocalizationManager")
export class LocalizationManager extends Component {
  private static _instance: LocalizationManager | null = null;

  private languageData: { [key: string]: string | string[] } = {};

  public static get instance(): LocalizationManager {
    if (this._instance) {
      return this._instance;
    }
    return null;
  }

  onLoad() {
    if (
      LocalizationManager._instance &&
      LocalizationManager._instance !== this
    ) {
      this.destroy();
      return;
    }
    LocalizationManager._instance = this;
    this.loadLanguage();
  }

  public async loadLanguage() {
    const localPath = `i18n/en`;

    resources.load(localPath, JsonAsset, (err, jsonAsset) => {
      if (err) {
        return;
      }
      this.languageData = jsonAsset.json;
    });
  }

  public getLocalizedString(
    key: string,
    replacements?: { [key: string]: string | number },
  ): string {
    const localizedValue = this.languageData[key];
    let localizedString =
      typeof localizedValue === "string" ? localizedValue : key;

    if (replacements) {
      for (const placeholder in replacements) {
        const regex = new RegExp(`\\{${placeholder}\\}`, "g");
        localizedString = localizedString.replace(
          regex,
          String(replacements[placeholder]),
        );
      }
    }

    return localizedString;
  }

  public getLocalizedStringArray(
    key: string,
    replacements?: { [key: string]: string | number },
  ): string[] {
    const localizedValue = this.languageData[key];

    if (Array.isArray(localizedValue)) {
      return localizedValue.map((line) => {
        let processedLine = line;
        if (replacements) {
          for (const placeholder in replacements) {
            const regex = new RegExp(`\\{${placeholder}\\}`, "g");
            processedLine = processedLine.replace(
              regex,
              String(replacements[placeholder]),
            );
          }
        }
        return processedLine;
      });
    }

    if (typeof localizedValue === "string") {
      return [this.getLocalizedString(key, replacements)];
    }

    return [];
  }
}
