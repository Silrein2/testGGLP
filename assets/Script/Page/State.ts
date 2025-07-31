import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("State")
export class State extends Component {
  public onEnter() {
    this.node.active = true;
  }

  public onExit() {
    this.node.active = false;
  }

  public execute() {}
}
