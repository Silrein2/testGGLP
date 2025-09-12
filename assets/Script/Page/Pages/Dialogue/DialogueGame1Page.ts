import { _decorator, Component, Node, SpriteFrame } from "cc";
import { DialoguePage } from "./DialoguePage";
import { PageStates } from "../../Enums";
import { GameManager } from "../../../Manager/GameManager";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
const { ccclass, property } = _decorator;

@ccclass("DialogueGame1Page")
export class DialogueGame1Page extends DialoguePage {
  @property({ type: SpriteFrame })
  beeSmileSprite: SpriteFrame | null = null;

  protected setPageState() {
    this.pageState = PageStates.DialogueGame1;
  }

  public onEnter() {
    super.onEnter();
    this.dialogueScript = [];
    let key = "";
    switch (this.pageManager.targetGamePageState) {
      case PageStates.Game1:
        key = "dialogue.game_1.intro";
        break;
      case PageStates.Game2:
        key = "dialogue.game_2.intro";
        break;
      case PageStates.Game3:
        key = "dialogue.game_3.intro";
        break;
    }

    const localizedDialogue =
      LocalizationManager.instance.getLocalizedStringArray(key);

    localizedDialogue.forEach((dialogue) => {
      const script = {
        speaker:
          LocalizationManager.instance.getLocalizedString("general.bee_safe"),
        portrait: this.beeSmileSprite,
        text: dialogue,
        effects: [],
        skipTypewriterEffect: false,
      };

      this.dialogueScript.push(script);
    });
  }
  public onPostEnterTransition() {
    super.onPostEnterTransition();
    this.startDialogue();
  }
  protected endDialogue() {
    super.endDialogue();
    this.transitionPage(this.pageManager.targetGamePageState);
  }

  public onClickSkip() {
    this.endDialogue();
  }
}
