export interface Cell {
  row: number;
  col: number;
  type: "empty" | "robot" | "task";
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
