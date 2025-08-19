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

export function timeString(elapsedTime: number): string {
  const totalSeconds = Math.floor(elapsedTime);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  let timeString = "";
  if (minutes > 0) {
    timeString += `${minutes}m`;
  }
  timeString += `${seconds}s`;
  return timeString;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitForCondition(condition: boolean): Promise<void> {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}
