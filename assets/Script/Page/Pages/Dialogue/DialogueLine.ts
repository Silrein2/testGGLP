import { _decorator, Component, Node, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DialogueLine")
export class DialogueLine {
  public speaker: string = "";
  public portrait: SpriteFrame = null;
  public text: string = "";
  public effects: Node[] = [];
  public skipTypewriterEffect: boolean;

  constructor(
    speaker: string = "",
    text: string = "",
    portrait: SpriteFrame = null,
    effects: Node[] = [],
    skipTypewriterEffect = false,
  ) {
    this.speaker = speaker;
    this.text = text;
    this.portrait = portrait;
    this.effects = effects;
    this.skipTypewriterEffect = skipTypewriterEffect;
  }
}
