import { _decorator, Component, Node, tween, TweenEasing, Vec3 } from "cc";
import { Page } from "./Page";
import { delay } from "../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("PageTransition")
export class PageTransition extends Component {
  protected page: Page | null = null;
  protected stateEnterTransitionDuration: number = 0;

  public enterTransitionEnabled: boolean = false;
  public exitTransitionEnabled: boolean = false;

  public init(page: Page, stateEnterTransitionDuration: number) {
    this.page = page;
    this.stateEnterTransitionDuration = stateEnterTransitionDuration;
  }

  public onEnter() {}

  public onExit() {}

  protected onEnterComplete() {
    this.page.onPostEnterTransition();
  }

  protected onExitComplete() {
    this.page.onPostExitTransition();
  }

  protected recordPos(
    list: Node[],
    initialList: Vec3[],
    fromList: Vec3[],
    axis: string,
    value: number,
  ) {
    for (const node of list) {
      const pos = node.position;
      initialList.push(pos.clone());
      const outPos = pos.clone();
      outPos[axis] = value;
      fromList.push(outPos);
      node.setPosition(outPos);
    }
  }

  protected setNodesPosition(list: Node[], pos: Vec3[]) {
    for (let i = 0; i < list.length; i++) {
      list[i].setPosition(pos[i]);
    }
  }

  protected async tweenList(
    list: Node[],
    posList: Vec3[],
    tweenDelay: number,
    easing: TweenEasing,
  ) {
    for (let i = 0; i < list.length; i++) {
      const node: Node = list[i];
      tween(node).to(0.8, { position: posList[i] }, { easing: easing }).start();
      await delay(tweenDelay);
    }
  }
}
