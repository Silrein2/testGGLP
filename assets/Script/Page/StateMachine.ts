import { _decorator, Component, Node } from "cc";
import { State } from "./State";
const { ccclass, property } = _decorator;

@ccclass("StateMachine")
export class StateMachine extends Component {
  private currentState: State;
  private states: State[] = [];

  public init(baseState: State) {
    this.currentState = baseState;
    this.currentState.onEnter();
    this.states.push(this.currentState);
  }

  update(deltaTime: number) {
    if (!this.currentState) return;
    this.currentState.execute();
  }

  public transitionState(newState: State) {
    if (this.currentState != null) {
      this.currentState.onExit();
    }
    this.currentState = newState;
    this.states.push(this.currentState);
    this.currentState.onEnter();
  }

  public popState() {
    if (this.states.length <= 1) return;
    this.states[this.states.length - 1].onExit();
    this.states.pop();
    this.currentState = this.states[this.states.length - 1];
    this.currentState.onEnter();
  }
}
