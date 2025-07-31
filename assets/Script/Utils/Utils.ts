import { Component, Node } from "cc";

export function getComponentInParent<T extends Component>(
  startNode: Node,
  componentType: new (...args: any[]) => T,
): T | null {
  let currentNode: Node | null = startNode;

  while (currentNode) {
    const component = currentNode.getComponent(componentType);
    if (component) {
      return component;
    }
    currentNode = currentNode.parent;
  }

  return null;
}

export function isNullOrEmpty(str: string | null | undefined): boolean {
  if (str === null || str === undefined) {
    return true;
  }
  return str.trim() === "";
}
