import { _decorator, Component, Node } from "cc";
import { StateMachine } from "./StateMachine";
import { Page } from "./Page";
import { PageStates } from "./Enums";
import { Transition, TRANSITION_HIDDEN } from "../UI/Transition";
const { ccclass, property } = _decorator;

@ccclass("PageManager")
export class PageManager extends Component {
  @property({ type: [Page] })
  private pages: Page[] = [];

  @property({ type: Transition })
  private transition: Transition | null = null;

  private stateMachine: StateMachine;
  private isTransition: boolean = false;

  start() {
    for (const page of this.pages) {
      page.init(this);
      page.node.active = false;
    }
    this.stateMachine = this.node.getComponent(StateMachine);
    this.stateMachine.init(this.getPageByPageState(PageStates.Login));
    this.transition.node.on(
      TRANSITION_HIDDEN,
      () => {
        this.isTransition = false;
      },
      this,
    );
  }

  public async transitionState(newPage: PageStates) {
    this.isTransition = true;
    this.transition.play();
    while (this.isTransition) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    this.stateMachine.transitionState(this.getPageByPageState(newPage));
  }

  private getPageByPageState(pageState: PageStates): Page {
    for (const page of this.pages) {
      if (page.pageState === pageState) {
        return page;
      }
    }
    return null;
  }
}
