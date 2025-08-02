import { _decorator, Component, Node } from "cc";
import { State } from "./State";
import { PageStates } from "./Enums";
import { PageManager } from "./PageManager";
import { PageTransition } from "./PageTransition";
const { ccclass, property } = _decorator;

@ccclass("Page")
export class Page extends State {
  private pageTransition: PageTransition | null = null;
  private targetPage: PageStates = PageStates.None;
  protected pageManager: PageManager | null = null;
  public pageState: PageStates = PageStates.None;

  public init(pageManager: PageManager) {
    this.pageManager = pageManager;
    this.pageTransition = this.node.getComponent(PageTransition);
    if (this.pageTransition) {
      this.pageTransition.init(
        this,
        this.pageManager.stateEnterTransitionDuration,
      );
    }
    this.node.active = false;
    this.setPageState();
  }

  protected setPageState() {}

  public onEnter() {
    super.onEnter();
    if (this.pageTransition && this.pageTransition.enterTransitionEnabled) {
      this.pageManager.enableBlockInput(true);
      this.pageTransition.onEnter();
    } else {
      this.onPostEnterTransition();
    }
  }

  public onExit() {
    super.onExit();
  }

  public onPostEnterTransition() {
    this.pageManager.enableBlockInput(false);
  }

  public onPostExitTransition() {
    this.pageManager.enableBlockInput(false);
    this.pageManager.transitionState(this.targetPage);
  }

  public transitionPage(page: PageStates) {
    this.targetPage = page;
    if (this.pageTransition && this.pageTransition.exitTransitionEnabled) {
      this.pageManager.enableBlockInput(true);
      this.pageTransition.onExit();
    } else {
      this.onPostExitTransition();
    }
  }
}
