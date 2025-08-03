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
        text: "Hello, I'm Bee Safe and being safe is always my priority. Welcome to my hive! I'm currently building my kingdom, but I need your help...",
        effects: [],
        skipTypewriterEffect: false,
      },
      {
        speaker: "Bee Safe",
        portrait: this.beeShockedSprite,
        text: "Hello, I'm Bee Safe and being safe is always my priority. Welcome to my hive! I'm currently building my kingdom, but I need your help...",
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
  }

  protected setPageState() {
    this.pageState = PageStates.DialogueIntro;
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
