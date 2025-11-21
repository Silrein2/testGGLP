import {
  _decorator,
  assetManager,
  Component,
  ImageAsset,
  instantiate,
  Label,
  Node,
  Size,
  Sprite,
  SpriteFrame,
  UITransform,
} from "cc";
import { Game2Slot } from "./Game2Slot";
import { PhishingEmail, PhishingIndicator } from "../../../Manager/DataManager";
import { Game2Page } from "./Game2Page";
import { GameManager } from "../../../Manager/GameManager";
const { ccclass, property } = _decorator;

@ccclass("Game2Question")
export class Game2Question extends Component {
  @property({ type: Label })
  public errorLabel: Label | null = null;

  private sprite: Sprite | null = null;
  private uiTransform: UITransform | null = null;
  private data: PhishingEmail | null = null;
  private game2Page: Game2Page | null = null;
  public options: string[] = [];
  public slots: Game2Slot[] = [];

  onLoad() {
    this.slots = this.node.getComponentsInChildren(Game2Slot);
  }

  public init(data: PhishingEmail, game2Page: Game2Page) {
    this.sprite = this.node.getComponent(Sprite);
    this.uiTransform = this.node.getComponent(UITransform);
    this.data = data;
    this.game2Page = game2Page;
    this.sprite.sizeMode = Sprite.SizeMode.RAW;
    this.loadRemoteImage(data.image);
  }

  private loadRemoteImage(url: string) {
    let baseUrl = GameManager.instance.baseUrl;
    baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const imageUrl = baseUrl + url;
    assetManager.loadRemote(imageUrl, ImageAsset, (err, image: ImageAsset) => {
      if (err) {
        this.errorLabel.node.active = true;
        this.errorLabel.string =
          "Download Failed: The system was unable to retrieve the requested email content.";
        return;
      }

      const spriteFrame = SpriteFrame.createWithImage(image);
      this.errorLabel.node.active = false;
      this.sprite.spriteFrame = spriteFrame;
      this.setQuestion();
      this.game2Page.onGame2QuestionLoaded();
    });
  }

  private setQuestion() {
    const initialWidth = this.uiTransform.width;
    const initialHeight = this.uiTransform.height;
    const aspectRatio = initialHeight / initialWidth;
    const newWidth = 1200;
    const newHeight = newWidth * aspectRatio;

    this.uiTransform.contentSize = new Size(newWidth, newHeight);

    const emailIndicator: PhishingIndicator = {
      id: -1,
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 1,
      label: "",
    };

    const indicators = [emailIndicator, ...this.data.indicators];
    for (let i = 0; i < indicators.length; i++) {
      const slotNode = instantiate(this.game2Page.slotPrefab) as Node;
      this.node.addChild(slotNode);
      const game2Slot = slotNode.getComponent(Game2Slot);
      game2Slot.init(indicators[i], this.uiTransform);
      this.slots.push(game2Slot);
    }
  }
}
