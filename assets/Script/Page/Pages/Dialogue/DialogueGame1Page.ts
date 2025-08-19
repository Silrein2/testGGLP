import { _decorator, Component, Node, SpriteFrame } from "cc";
import { DialoguePage } from "./DialoguePage";
import { PageStates } from "../../Enums";
import { GameManager } from "../../../Manager/GameManager";
const { ccclass, property } = _decorator;

@ccclass("DialogueGame1Page")
export class DialogueGame1Page extends DialoguePage {
  @property({ type: SpriteFrame })
  beeSmileSprite: SpriteFrame | null = null;

  start() {
    this.dialogueScript = [
      {
        speaker: "Bee Safe",
        portrait: this.beeSmileSprite,
        text: 'People often ask me "Bee Safe" questions. How many can you answer?',
        effects: [],
        skipTypewriterEffect: false,
      },
    ];
  }

  protected setPageState() {
    this.pageState = PageStates.DialogueGame1;
  }

  public onEnter() {
    super.onEnter();
  }
  public onPostEnterTransition() {
    super.onPostEnterTransition();
    this.startDialogue();
  }
  protected endDialogue() {
    super.endDialogue();
    this.transitionPage(PageStates.Game1);
  }

  public onClickSkip() {
    this.endDialogue();
  }
}
