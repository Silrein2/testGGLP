import { _decorator, Component, Node } from "cc";
import { State } from "./State";
import { PageStates } from "./Enums";
import { PageManager } from "./PageManager";
const { ccclass, property } = _decorator;

@ccclass("Page")
export class Page extends State {
  protected pageManager: PageManager;
  public pageState: PageStates = PageStates.None;

  public init(pageManager: PageManager) {
    this.pageManager = pageManager;
    this.node.active = false;
    this.setPageState();
  }

  protected setPageState() {}
}
