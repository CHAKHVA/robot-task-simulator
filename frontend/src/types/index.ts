export interface Cell {
  row: number;
  col: number;
  type: "empty" | "robot" | "task" | "obstacle";
}

export interface Robot {
  id: string;
  position: [number, number];
  target?: [number, number];
  path: [number, number][];
}

export interface Task {
  id: string;
  position: [number, number];
  assignedTo?: string;
}

export type Strategy = "nearest" | "roundrobin";
export type Speed = "slow" | "normal" | "fast";
export type PlacementMode = "robot" | "task" | "obstacle";
