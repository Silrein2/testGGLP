import { _decorator, Component, Node, SpriteFrame } from "cc";
import { DialoguePage } from "./DialoguePage";
import { PageStates } from "../../Enums";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
const { ccclass, property } = _decorator;

@ccclass("DialogueIntroPage")
export class DialogueIntroPage extends DialoguePage {
  @property({ type: SpriteFrame })
  beeSmileSprite: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  beeShockedSprite: SpriteFrame | null = null;

  @property({ type: Node })
  beeBad1: Node | null = null;

  @property({ type: Node })
  beeBad2: Node | null = null;

  @property({ type: Node })
  beeBad3: Node | null = null;

  @property({ type: Node })
  honeycomb: Node | null = null;

  protected setPageState() {
    this.pageState = PageStates.DialogueIntro;
  }

  public onEnter() {
    super.onEnter();
    this.dialogueScript = [
      {
        speaker:
          LocalizationManager.instance.getLocalizedString("general.bee_safe"),
        portrait: this.beeSmileSprite,
        text: LocalizationManager.instance.getLocalizedString(
          "intro.dialogue_line_1",
        ),
        effects: [],
        skipTypewriterEffect: false,
      },
      {
        speaker:
          LocalizationManager.instance.getLocalizedString("general.bee_safe"),
        portrait: this.beeShockedSprite,
        text: LocalizationManager.instance.getLocalizedString(
          "intro.dialogue_line_1",
        ),
        effects: [this.beeBad1, this.beeBad2, this.beeBad3],
        skipTypewriterEffect: true,
      },
      {
        speaker:
          LocalizationManager.instance.getLocalizedString("general.bee_safe"),
        portrait: this.beeSmileSprite,
        text: LocalizationManager.instance.getLocalizedString(
          "intro.dialogue_line_2",
        ),
        effects: [this.honeycomb],
        skipTypewriterEffect: false,
      },
    ];
  }

  public onExit() {
    super.onExit();
    this.beeBad1.active = false;
    this.beeBad2.active = false;
    this.beeBad3.active = false;
    this.honeycomb.active = false;
  }

  public onPostEnterTransition() {
    super.onPostEnterTransition();
    this.startDialogue();
  }

  protected endDialogue() {
    super.endDialogue();
    this.transitionPage(PageStates.GameSelection);
  }

  private onClickSkip() {
    this.endDialogue();
  }
}
