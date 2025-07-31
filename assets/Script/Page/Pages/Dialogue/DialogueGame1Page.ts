import { _decorator, Component, Node, SpriteFrame } from "cc";
import { DialoguePage } from "./DialoguePage";
import { PageStates } from "../../Enums";
const { ccclass, property } = _decorator;

@ccclass("DialogueGame1Page")
export class DialogueGame1Page extends DialoguePage {
  @property({ type: SpriteFrame })
  beeSmileSprite: SpriteFrame;

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

    this.scheduleOnce(() => {
      this.startDialogue();
    }, 1);
  }

  protected setPageState() {
    this.pageState = PageStates.DialogueGame1;
  }

  protected endDialogue() {
    this.pageManager.transitionState(PageStates.Game1);
  }

  public onClickSkip() {
    this.pageManager.transitionState(PageStates.Game1);
  }
}
