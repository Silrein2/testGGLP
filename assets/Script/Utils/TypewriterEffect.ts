import { _decorator, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("TypewriterEffect")
export class TypewriterEffect extends Component {
  private _isTyping: boolean = false;
  private textSpeed: number = 0.05;
  private fullText: string = "";
  private label: Label | null = null;
  private currentTypingJob: Function | null = null;

  public get isTyping(): boolean {
    return this._isTyping;
  }

  public startEffect(
    fullText: string,
    label: Label,
    onComplete: Function = () => {},
  ) {
    this.fullText = fullText;
    this.label = label;
    this._isTyping = true;
    this.label.string = "";
    let charIndex = 0;

    if (this.currentTypingJob !== null) {
      this.unschedule(this.currentTypingJob);
    }

    this.currentTypingJob = () => {
      if (charIndex < fullText.length) {
        this.label.string += fullText[charIndex];
        charIndex++;
      } else {
        this.completeEffect();
        onComplete();
      }
    };

    this.schedule(this.currentTypingJob, this.textSpeed, fullText.length);
  }

  public completeEffect() {
    if (this.currentTypingJob !== null) {
      this.unschedule(this.currentTypingJob);
      this.currentTypingJob = null;
    }
    this.label.string = this.fullText;
    this._isTyping = false;
  }
}
