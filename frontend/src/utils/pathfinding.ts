import { Robot } from "@/types";

export function manhattanDistance(
  pos1: [number, number],
  pos2: [number, number]
): number {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

export function generatePath(
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
