export interface Cell {
  row: number;
  col: number;
  type: "empty" | "robot" | "task";
}
