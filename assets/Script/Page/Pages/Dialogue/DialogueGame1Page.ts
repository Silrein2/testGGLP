import { _decorator, Component, Node, SpriteFrame } from "cc";
import { DialoguePage } from "./DialoguePage";
import { PageStates } from "../../Enums";
import { GameManager } from "../../../Manager/GameManager";
const { ccclass, property } = _decorator;

@ccclass("DialogueGame1Page")
export class DialogueGame1Page extends DialoguePage {
  @property({ type: SpriteFrame })
  beeSmileSprite: SpriteFrame | null = null;

  private loadedQuestion: boolean = false;

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
    this.loadedQuestion = false;
    GameManager.instance.quizService.getQuestion();
    this.loadedQuestion = true;
  }
  public onPostEnterTransition() {
    super.onPostEnterTransition();
    this.startDialogue();
  }
  protected endDialogue() {
    if (!this.loadedQuestion) return;
    super.endDialogue();
    this.transitionPage(PageStates.Game1);
  }

  public onClickSkip() {
    this.endDialogue();
  }
}
