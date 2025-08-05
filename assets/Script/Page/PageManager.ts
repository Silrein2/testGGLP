import { _decorator, Component, Node } from "cc";
import { StateMachine } from "./StateMachine";
import { Page } from "./Page";
import { PageStates } from "./Enums";
import { Transition } from "../UI/Transition";
import { delay } from "../Utils/Utils";
const { ccclass, property } = _decorator;

@ccclass("PageManager")
export class PageManager extends Component {
  @property({ type: [Page] })
  private pages: Page[] = [];

  @property({ type: Transition })
  private transition: Transition | null = null;

  @property({ type: Node })
  private blockInput: Node | null = null;

  private stateMachine: StateMachine;

  public _stateEnterTransitionDuration: number = 0;
  public currentPageState: PageStates | null = null;

  public get stateEnterTransitionDuration(): number {
    return this._stateEnterTransitionDuration;
  }

  start() {
    this._stateEnterTransitionDuration =
      this.transition.moveDuration + this.transition.pauseDuration;
    for (const page of this.pages) {
      page.init(this);
      page.node.active = false;
    }
    this.currentPageState = PageStates.Login;
    this.stateMachine = this.node.getComponent(StateMachine);
    this.stateMachine.init(this.getPageByPageState(this.currentPageState));
  }

  public async transitionState(newPageState: PageStates) {
    this.transition.play();
    await delay(this.transition.moveDuration * 1000);
    this.stateMachine.transitionState(this.getPageByPageState(newPageState));
    this.currentPageState = newPageState;
  }

  private getPageByPageState(pageState: PageStates): Page {
    for (const page of this.pages) {
      if (page.pageState === pageState) {
        return page;
      }
    }
    return null;
  }

  public enableBlockInput(enable: boolean) {
    this.blockInput.active = enable;
  }

  public transitionToHomePage() {
    this.getPageByPageState(this.currentPageState).transitionPage(
      PageStates.GameSelection,
    );
  }

  public resetPage() {
    this.getPageByPageState(this.currentPageState).transitionPage(
      this.currentPageState,
    );
  }
}
