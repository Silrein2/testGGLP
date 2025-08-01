import { _decorator, Component, Node, SpriteFrame } from "cc";
import { DialoguePage } from "./DialoguePage";
import { PageStates } from "../../Enums";
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

  start() {
    this.dialogueScript = [
      {
        speaker: "Bee Safe",
        portrait: this.beeSmileSprite,
        text: "Hello, I'm BeeSafe and being safe is always my priority. Welcome to my hive! I'm currently building my kingdom, but I need your help...",
        effects: [],
        skipTypewriterEffect: false,
      },
      {
        speaker: "Bee Safe",
        portrait: this.beeShockedSprite,
        text: "Hello, I'm BeeSafe and being safe is always my priority. Welcome to my hive! I'm currently building my kingdom, but I need your help...",
        effects: [this.beeBad1, this.beeBad2, this.beeBad3],
        skipTypewriterEffect: true,
      },
      {
        speaker: "Bee Safe",
        portrait: this.beeSmileSprite,
        text: "Can you be my detective and help identify the pretenders? As a reward. I will give you some honey (points) from my BeeSafe Kingdom! But be careful to not get stung...",
        effects: [this.honeycomb],
        skipTypewriterEffect: false,
      },
    ];

    this.scheduleOnce(() => {
      this.startDialogue();
    }, 1);
  }

  protected setPageState() {
    this.pageState = PageStates.DialogueIntro;
  }

  protected endDialogue() {
    this.pageManager.transitionState(PageStates.GameSelection);
  }

  public onClickSkip() {
    this.pageManager.transitionState(PageStates.GameSelection);
  }
}
