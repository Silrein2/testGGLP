import {
  _decorator,
  Component,
  Node,
  tween,
  TweenEasing,
  UIOpacity,
  Vec3,
} from "cc";
import { delay } from "../../../Utils/Utils";
import { QuestionTypes } from "../../Enums";
const { ccclass, property } = _decorator;

@ccclass("Game1QuizTransition")
export class Game1QuizTransition extends Component {
  @property({ type: Node })
  private title: Node | null = null;

  @property({ type: Node })
  private question: Node | null = null;

  @property({ type: [Node] })
  private type1Options: Node[] = [];

  @property({ type: [Node] })
  private type2Options: Node[] = [];

  @property({ type: [Node] })
  private type3Options: Node[] = [];

  private showOpacity: number = 255;
  private hideOpacity: number = 0;
  private showScale: Vec3 = Vec3.ONE;
  private hideScale: Vec3 = new Vec3(0.1, 0.1, 0.1);
  private showOpacityEasing: TweenEasing = "cubicOut";
  private hideOpacityEasing: TweenEasing = "cubicIn";
  private showScaleEasing: TweenEasing = "backOut";
  private hideScaleEasing: TweenEasing = "backIn";
  private optionsDelay: number = 0.4;
  private onComplete: Function | null = null;

  onLoad() {}

  public playTransition(
    questionType: QuestionTypes,
    show: boolean,
    onComplete: Function,
  ) {
    this.onComplete = onComplete;
    if (show) {
      this.tweenTitle();
    }
    switch (questionType) {
      case QuestionTypes.MCQ:
        this.showType1(show);
        break;
      case QuestionTypes.MATCH:
        this.showType2(show);
        break;
      case QuestionTypes.YES_NO:
        this.showType3(show);
        break;
    }
  }

  public showType1(show: boolean) {
    this.showQuestion(this.question, show);
    this.showOptions(this.type1Options, show, true);
  }

  public showType2(show: boolean) {
    this.showQuestion(this.question, show);
    this.showOptions(this.type2Options, show);
  }

  public showType3(show: boolean) {
    this.showQuestion(this.question, show);
    this.showOptions(this.type3Options, show);
  }

  private showQuestion(node: Node, show: boolean) {
    const opacity = show ? this.showOpacity : this.hideOpacity;
    const opacityEasing = show
      ? this.showOpacityEasing
      : this.hideOpacityEasing;

    const opacityComponent = node.getComponent(UIOpacity);
    const fromOpacity = !show ? this.showOpacity : this.hideOpacity;
    opacityComponent.opacity = fromOpacity;
    tween(node)
      .parallel(
        tween(opacityComponent).to(
          0.8,
          { opacity: opacity },
          { easing: opacityEasing },
        ),
      )
      .start();
  }

  private showOptions(nodes: Node[], show: boolean, shuffle: boolean = false) {
    const scale = show ? this.showScale : this.hideScale;
    const opacity = show ? this.showOpacity : this.hideOpacity;
    const scaleEasing = show ? this.showScaleEasing : this.hideScaleEasing;
    const opacityEasing = show
      ? this.showOpacityEasing
      : this.hideOpacityEasing;
    const fromScale = !show ? this.showScale : this.hideScale;
    const fromOpacity = !show ? this.showOpacity : this.hideOpacity;

    const _nodes = shuffle ? this.shuffleArray(nodes) : nodes;

    _nodes.forEach((node, index) => {
      node.setScale(fromScale);
      const opacityComponent = node.getComponent(UIOpacity);
      opacityComponent.opacity = fromOpacity;
      const delay = this.optionsDelay + 0.1 * index;

      const optionTween = tween(node)
        .delay(delay)
        .parallel(
          tween().to(0.3, { scale: scale }, { easing: scaleEasing }),
          tween(opacityComponent).to(
            0.3,
            { opacity: opacity },
            { easing: opacityEasing },
          ),
        );

      if (index === _nodes.length - 1) {
        optionTween.call(() => this.onComplete());
      }
      optionTween.start();
    });
  }

  private tweenTitle() {
    tween(this.title)
      .by(0.1, { scale: new Vec3(0.2, 0.2, 0) }, { easing: "backOut" })
      .by(0.3, { scale: new Vec3(-0.2, -0.2, 0) }, { easing: "elasticOut" })
      .union()
      .start();
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}
