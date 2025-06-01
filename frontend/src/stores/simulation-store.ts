import { Cell, PlacementMode, Robot, Speed, Strategy, Task } from "@/types";

export const GRID_ROWS = 30;
export const GRID_COLS = 75;

interface SimulationState {
  // Grid and entities
  grid: Cell[][];
  robots: Robot[];
  tasks: Task[];

  // Simulation state
  isRunning: boolean;
  isPaused: boolean;
  speed: Speed;
  strategy: Strategy;
  placementMode: PlacementMode;

  // Simulation controls
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;

  // Grid manipulation
  handleCellClick: (row: number, col: number) => void;
  clearGrid: () => void;
  randomize: () => void;

  // Settings
  setSpeed: (speed: Speed) => void;
  setStrategy: (strategy: Strategy) => void;
  setPlacementMode: (mode: PlacementMode) => void;

  // Helper methods
  assignTask: () => void;
  moveRobots: () => void;
  isSimulationComplete: () => boolean;
}

const createEmptyGrid = (): Cell[][] => {
  return Array.from({ length: GRID_ROWS }, (_, row) =>
    Array.from({ length: GRID_COLS }, (_, col) => ({
      row,
      col,
      type: "empty" as const,
    }))
  );
};
