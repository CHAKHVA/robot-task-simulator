import { Cell, Robot } from "@/types";

export function manhattanDistance(
  pos1: [number, number],
  pos2: [number, number]
): number {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

interface PathNode {
  position: [number, number];
  g: number; // Cost from start to current node
  h: number; // Heuristic (manhattan distance to goal)
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

export function generatePath(
  start: [number, number],
  end: [number, number],
  grid: Cell[][]
): [number, number][] {
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  // Check if start or end is blocked
  if (
    grid[startRow][startCol].type === "obstacle" ||
    grid[endRow][endCol].type === "obstacle"
  ) {
    return [];
  }

  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();

  const startNode: PathNode = {
    position: start,
    g: 0,
    h: manhattanDistance(start, end),
    f: manhattanDistance(start, end),
    parent: null,
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    // Find node with lowest f cost
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i;
      }
    }

    const currentNode = openSet[currentIndex];

    // Check if we reached the goal
    if (
      currentNode.position[0] === endRow &&
      currentNode.position[1] === endCol
    ) {
      // Reconstruct path
      const path: [number, number][] = [];
      let current: PathNode | null = currentNode;
      while (current) {
        path.unshift(current.position);
        current = current.parent;
      }
      return path.slice(1); // Remove start position
    }

    // Move current node from open to closed set
    openSet.splice(currentIndex, 1);
    closedSet.add(`${currentNode.position[0]},${currentNode.position[1]}`);

    // Check all neighbors
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1], // Up, Down, Left, Right
    ];

    for (const [dRow, dCol] of directions) {
      const newRow = currentNode.position[0] + dRow;
      const newCol = currentNode.position[1] + dCol;

      // Check bounds
      if (
        newRow < 0 ||
        newRow >= grid.length ||
        newCol < 0 ||
        newCol >= grid[0].length
      ) {
        continue;
      }

      // Check if neighbor is obstacle or already visited
      if (
        grid[newRow][newCol].type === "obstacle" ||
        closedSet.has(`${newRow},${newCol}`)
      ) {
        continue;
      }

      const neighbor: PathNode = {
        position: [newRow, newCol],
        g: currentNode.g + 1,
        h: manhattanDistance([newRow, newCol], end),
        f: 0,
        parent: currentNode,
      };
      neighbor.f = neighbor.g + neighbor.h;

      // Check if this path to neighbor is better than any previous one
      const existingNodeIndex = openSet.findIndex(
        (node) => node.position[0] === newRow && node.position[1] === newCol
      );

      if (existingNodeIndex === -1) {
        openSet.push(neighbor);
      } else if (neighbor.g < openSet[existingNodeIndex].g) {
        openSet[existingNodeIndex] = neighbor;
      }
    }
  }

  // No path found, fall back to simple path
  return generateSimplePath(start, end);
}

function generateSimplePath(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const path: [number, number][] = [];
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  let currentRow = startRow;
  let currentCol = startCol;

  // Move vertically first, then horizontally
  while (currentRow !== endRow) {
    if (currentRow < endRow) {
      currentRow++;
    } else {
      currentRow--;
    }
    path.push([currentRow, currentCol]);
  }

  while (currentCol !== endCol) {
    if (currentCol < endCol) {
      currentCol++;
    } else {
      currentCol--;
    }
    path.push([currentRow, currentCol]);
  }

  return path;
}

export function getNextStep(robot: Robot): [number, number] | null {
  if (robot.path.length === 0) return null;
  return robot.path[0];
}
