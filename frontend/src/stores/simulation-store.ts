import { Cell, Robot, Speed, Task } from "@/types";
import { create } from "zustand";

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
  /*
  strategy: Strategy;
  placementMode: PlacementMode;

  // Simulation controls
  start: () => void;
  pause: () => void;
  reset: () => void;
  */
  tick: () => void;

  // Grid manipulation
  handleCellClick: (row: number, col: number) => void;
  /*
  clearGrid: () => void;
  randomize: () => void;

  // Settings
  setSpeed: (speed: Speed) => void;
  setStrategy: (strategy: Strategy) => void;
  setPlacementMode: (mode: PlacementMode) => void;

  // Helper methods
  assignTasks: () => void;
  moveRobots: () => void;
  isSimulationComplete: () => boolean;
  */
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

const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state
  /*
  grid: createEmptyGrid(),
  robots: [],
  tasks: [],
  */
  grid: (() => {
    const grid = createEmptyGrid();
    // Place robots in a pattern
    const robotPositions = [
      [5, 10],
      [5, 20],
      [5, 30], // Top row
      [15, 15],
      [15, 25], // Middle row
      [25, 10],
      [25, 20],
      [25, 30], // Bottom row
    ];
    // Place tasks in a pattern
    const taskPositions = [
      [10, 5],
      [10, 15],
      [10, 25],
      [10, 35], // Top row
      [20, 10],
      [20, 20],
      [20, 30], // Middle row
      [25, 5],
      [25, 15],
      [25, 25],
      [25, 35], // Bottom row
    ];

    // Update grid with robots
    robotPositions.forEach(([row, col]) => {
      if (row < GRID_ROWS && col < GRID_COLS) {
        grid[row][col].type = "robot";
      }
    });

    // Update grid with tasks
    taskPositions.forEach(([row, col]) => {
      if (row < GRID_ROWS && col < GRID_COLS) {
        grid[row][col].type = "task";
      }
    });

    return grid;
  })(),
  robots: [
    { id: "robot1", position: [5, 10], path: [] },
    { id: "robot2", position: [5, 20], path: [] },
    { id: "robot3", position: [5, 30], path: [] },
    { id: "robot4", position: [15, 15], path: [] },
    { id: "robot5", position: [15, 25], path: [] },
    { id: "robot6", position: [25, 10], path: [] },
    { id: "robot7", position: [25, 20], path: [] },
    { id: "robot8", position: [25, 30], path: [] },
  ],
  tasks: [
    { id: "task1", position: [10, 5] },
    { id: "task2", position: [10, 15] },
    { id: "task3", position: [10, 25] },
    { id: "task4", position: [10, 35] },
    { id: "task5", position: [20, 10] },
    { id: "task6", position: [20, 20] },
    { id: "task7", position: [20, 30] },
    { id: "task8", position: [25, 5] },
    { id: "task9", position: [25, 15] },
    { id: "task10", position: [25, 25] },
    { id: "task11", position: [25, 35] },
  ],

  isRunning: false,
  isPaused: false,
  speed: "normal",
  handleCellClick: () => {},
  tick: () => {},
  /*
  strategy: "nearest",
  placementMode: "robot",

  // Simulation controls
  start: () => {
    const { robots, tasks, assignTasks } = get();
    if (robots.length === 0 || tasks.length === 0) return;

    assignTasks();
    set({ isRunning: true, isPaused: false });
  },

  pause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  reset: () => {
    set((state) => ({
      isRunning: false,
      isPaused: false,
      robots: state.robots.map((robot) => ({
        ...robot,
        target: undefined,
        path: [],
      })),
      tasks: state.tasks.map((task) => ({
        ...task,
        assignedTo: undefined,
      })),
    }));
  },

  tick: () => {
    const {
      isRunning,
      isPaused,
      moveRobots,
      assignTasks,
      isSimulationComplete,
    } = get();
    if (!isRunning || isPaused) return;

    moveRobots();
    assignTasks();

    if (isSimulationComplete()) {
      set({ isRunning: false });
    }
  },

  // Grid manipulation
  handleCellClick: (row: number, col: number) => {
    const { grid, robots, tasks, placementMode, isRunning } = get();
    if (isRunning) return;

    const cell = grid[row][col];

    if (cell.type === "empty") {
      // Place new entity
      const newGrid = grid.map((gridRow) =>
        gridRow.map((gridCell) =>
          gridCell.row === row && gridCell.col === col
            ? { ...gridCell, type: placementMode }
            : gridCell
        )
      );

      if (placementMode === "robot") {
        const newRobot: Robot = {
          id: generateUniqueId(),
          position: [row, col],
          path: [],
        };
        set({
          grid: newGrid,
          robots: [...robots, newRobot],
        });
      } else {
        const newTask: Task = {
          id: generateUniqueId(),
          position: [row, col],
        };
        set({
          grid: newGrid,
          tasks: [...tasks, newTask],
        });
      }
    } else {
      // Remove existing entity
      const newGrid = grid.map((gridRow) =>
        gridRow.map((gridCell) =>
          gridCell.row === row && gridCell.col === col
            ? { ...gridCell, type: "empty" as const }
            : gridCell
        )
      );

      if (cell.type === "robot") {
        set({
          grid: newGrid,
          robots: robots.filter(
            (robot) => robot.position[0] !== row || robot.position[1] !== col
          ),
        });
      } else if (cell.type === "task") {
        set({
          grid: newGrid,
          tasks: tasks.filter(
            (task) => task.position[0] !== row || task.position[1] !== col
          ),
        });
      }
    }
  },

  clearGrid: () => {
    set({
      grid: createEmptyGrid(),
      robots: [],
      tasks: [],
      isRunning: false,
      isPaused: false,
    });
  },

  randomize: () => {
    const newGrid = createEmptyGrid();
    const newRobots: Robot[] = [];
    const newTasks: Task[] = [];

    const robotCount = Math.floor(Math.random() * 10) + 5; // 5-15 robots
    const taskCount = Math.floor(Math.random() * 15) + 10; // 10-25 tasks

    const occupiedCells = new Set<string>();

    // Place robots
    for (let i = 0; i < robotCount; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * GRID_ROWS);
        col = Math.floor(Math.random() * GRID_COLS);
      } while (occupiedCells.has(`${row},${col}`));

      occupiedCells.add(`${row},${col}`);
      newGrid[row][col].type = "robot";
      newRobots.push({
        id: generateUniqueId(),
        position: [row, col],
        path: [],
      });
    }

    // Place tasks
    for (let i = 0; i < taskCount; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * GRID_ROWS);
        col = Math.floor(Math.random() * GRID_COLS);
      } while (occupiedCells.has(`${row},${col}`));

      occupiedCells.add(`${row},${col}`);
      newGrid[row][col].type = "task";
      newTasks.push({
        id: generateUniqueId(),
        position: [row, col],
      });
    }

    set({
      grid: newGrid,
      robots: newRobots,
      tasks: newTasks,
      isRunning: false,
      isPaused: false,
    });
  },

  // Settings
  setSpeed: (speed: Speed) => set({ speed }),
  setStrategy: (strategy: Strategy) => set({ strategy }),
  setPlacementMode: (mode: PlacementMode) => set({ placementMode: mode }),

  // Helper methods
  assignTasks: () => {
    const { robots, tasks, strategy } = get();
    let updatedRobots: Robot[];

    if (strategy === "nearest") {
      updatedRobots = assignTasksNearestFirst(robots, tasks);
    } else {
      updatedRobots = assignTasksRoundRobin(robots, tasks);
    }

    // Generate paths for robots with new targets
    updatedRobots.forEach((robot) => {
      if (robot.target && robot.path.length === 0) {
        robot.path = generatePath(robot.position, robot.target);
      }
    });

    set({ robots: updatedRobots });
  },

  moveRobots: () => {
    const { robots, tasks, grid } = get();
    const updatedRobots = [...robots];
    const updatedTasks = [...tasks];
    const updatedGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

    updatedRobots.forEach((robot) => {
      if (robot.path.length === 0) return;

      // Clear current position
      const [currentRow, currentCol] = robot.position;
      updatedGrid[currentRow][currentCol].type = "empty";

      // Move to next position
      const nextStep = getNextStep(robot);
      if (nextStep) {
        robot.position = nextStep;
        robot.path = robot.path.slice(1);

        // Check if reached target
        if (
          robot.target &&
          robot.position[0] === robot.target[0] &&
          robot.position[1] === robot.target[1]
        ) {
          // Remove completed task
          const taskIndex = updatedTasks.findIndex(
            (task) =>
              task.position[0] === robot.target![0] &&
              task.position[1] === robot.target![1]
          );

          if (taskIndex !== -1) {
            updatedTasks.splice(taskIndex, 1);
          }

          // Clear robot target
          robot.target = undefined;
          robot.path = [];
        }

        // Update grid with new robot position
        const [newRow, newCol] = robot.position;
        updatedGrid[newRow][newCol].type = "robot";
      }
    });

    set({
      robots: updatedRobots,
      tasks: updatedTasks,
      grid: updatedGrid,
    });
  },

  isSimulationComplete: () => {
    const { tasks } = get();
    return tasks.length === 0;
  },
  */
}));
