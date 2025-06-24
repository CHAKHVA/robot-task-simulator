import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Cell, Robot, Task } from "./simulationLogic";

const GRID_ROWS = 30;
const GRID_COLS = 75;

// Helper function to create empty grid
const createEmptyGrid = () => {
  return Array.from({ length: GRID_ROWS }, (_, row) =>
    Array.from(
      { length: GRID_COLS },
      (_, col) =>
        ({
          row,
          col,
          type: "empty",
        }) as Cell
    )
  );
};

// Helper function to generate unique ID
const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Get or create simulation
export const getSimulation = query({
  handler: async (ctx) => {
    const simulations = await ctx.db.query("simulations").collect();

    if (simulations.length === 0) {
      return null;
    }

    return simulations[0];
  },
});

// Initialize simulation
export const initializeSimulation = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("simulations").first();

    if (existing) {
      return existing._id;
    }

    const grid = createEmptyGrid();

    // Place initial robots
    const robotPositions = [
      [5, 10],
      [5, 20],
      [5, 30],
      [15, 15],
      [15, 25],
      [25, 10],
      [25, 20],
      [25, 30],
    ];

    // Place initial tasks
    const taskPositions = [
      [10, 5],
      [10, 15],
      [10, 25],
      [10, 35],
      [20, 10],
      [20, 20],
      [20, 30],
      [25, 5],
      [25, 15],
      [25, 25],
      [25, 35],
    ];

    const robots = robotPositions.map((pos, i) => ({
      id: `robot${i + 1}`,
      position: pos,
      path: [],
    }));

    const tasks = taskPositions.map((pos, i) => ({
      id: `task${i + 1}`,
      position: pos,
    }));

    // Update grid
    robotPositions.forEach(([row, col]) => {
      if (row < GRID_ROWS && col < GRID_COLS) {
        grid[row][col].type = "robot";
      }
    });

    taskPositions.forEach(([row, col]) => {
      if (row < GRID_ROWS && col < GRID_COLS) {
        grid[row][col].type = "task";
      }
    });

    const id = await ctx.db.insert("simulations", {
      grid,
      robots,
      tasks,
      isRunning: false,
      isPaused: false,
      speed: "normal",
      strategy: "nearest",
      lastUpdateAt: Date.now(),
    });

    return id;
  },
});

// Update grid cell
export const updateCell = mutation({
  args: {
    row: v.number(),
    col: v.number(),
    placementMode: v.union(
      v.literal("robot"),
      v.literal("task"),
      v.literal("obstacle")
    ),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { row, col, placementMode, userId }) => {
    const simulation = await ctx.db.query("simulations").first();
    if (!simulation) return;

    const grid = simulation.grid;
    const cell = grid[row][col];

    if (cell.type === "empty") {
      // Place new entity
      grid[row][col].type = placementMode;

      if (placementMode === "robot") {
        const newRobot = {
          id: generateUniqueId(),
          position: [row, col],
          path: [],
        };
        simulation.robots.push(newRobot);
      } else if (placementMode === "task") {
        const newTask = {
          id: generateUniqueId(),
          position: [row, col],
        };
        simulation.tasks.push(newTask);
      }
    } else {
      // Remove existing entity
      const cellType = cell.type;
      grid[row][col].type = "empty";

      if (cellType === "robot") {
        simulation.robots = simulation.robots.filter(
          (robot) => robot.position[0] !== row || robot.position[1] !== col
        );
      } else if (cellType === "task") {
        simulation.tasks = simulation.tasks.filter(
          (task) => task.position[0] !== row || task.position[1] !== col
        );
      }
    }

    await ctx.db.patch(simulation._id, {
      grid,
      robots: simulation.robots,
      tasks: simulation.tasks,
      lastUpdateBy: userId,
      lastUpdateAt: Date.now(),
    });
  },
});

// Start simulation
export const startSimulation = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    const simulation = await ctx.db.query("simulations").first();
    if (!simulation) return;

    if (simulation.robots.length === 0 || simulation.tasks.length === 0) return;

    await ctx.db.patch(simulation._id, {
      isRunning: true,
      isPaused: false,
      lastUpdateBy: userId,
      lastUpdateAt: Date.now(),
    });
  },
});

// Pause/resume simulation
export const togglePause = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    const simulation = await ctx.db.query("simulations").first();
    if (!simulation) return;

    await ctx.db.patch(simulation._id, {
      isPaused: !simulation.isPaused,
      lastUpdateBy: userId,
      lastUpdateAt: Date.now(),
    });
  },
});

// Reset simulation
export const resetSimulation = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    const simulation = await ctx.db.query("simulations").first();
    if (!simulation) return;

    const robots = simulation.robots.map((robot) => ({
      ...robot,
      target: undefined,
      path: [],
    }));

    const tasks = simulation.tasks.map((task) => ({
      ...task,
      assignedTo: undefined,
    }));

    await ctx.db.patch(simulation._id, {
      isRunning: false,
      isPaused: false,
      robots,
      tasks,
      lastUpdateBy: userId,
      lastUpdateAt: Date.now(),
    });
  },
});

// Clear grid
export const clearGrid = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    const simulation = await ctx.db.query("simulations").first();
    if (!simulation) return;

    await ctx.db.patch(simulation._id, {
      grid: createEmptyGrid(),
      robots: [],
      tasks: [],
      isRunning: false,
      isPaused: false,
      lastUpdateBy: userId,
      lastUpdateAt: Date.now(),
    });
  },
});

// Randomize grid
export const randomizeGrid = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    const simulation = await ctx.db.query("simulations").first();
    if (!simulation) return;

    const newGrid = createEmptyGrid();
    const newRobots: Robot[] = [];
    const newTasks: Task[] = [];

    const robotCount = Math.floor(Math.random() * 10) + 5;
    const taskCount = Math.floor(Math.random() * 15) + 10;
    const obstacleCount = Math.floor(Math.random() * 20) + 10;

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

    // Place obstacles
    for (let i = 0; i < obstacleCount; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * GRID_ROWS);
        col = Math.floor(Math.random() * GRID_COLS);
      } while (occupiedCells.has(`${row},${col}`));

      occupiedCells.add(`${row},${col}`);
      newGrid[row][col].type = "obstacle";
    }

    await ctx.db.patch(simulation._id, {
      grid: newGrid,
      robots: newRobots,
      tasks: newTasks,
      isRunning: false,
      isPaused: false,
      lastUpdateBy: userId,
      lastUpdateAt: Date.now(),
    });
  },
});

// Update settings
export const updateSettings = mutation({
  args: {
    speed: v.optional(
      v.union(v.literal("slow"), v.literal("normal"), v.literal("fast"))
    ),
    strategy: v.optional(
      v.union(v.literal("nearest"), v.literal("roundrobin"))
    ),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { speed, strategy, userId }) => {
    const simulation = await ctx.db.query("simulations").first();
    if (!simulation) return;

    const updates: Partial<{
      speed: "slow" | "normal" | "fast";
      strategy: "nearest" | "roundrobin";
      lastUpdateBy?: string;
      lastUpdateAt: number;
    }> = {
      lastUpdateBy: userId,
      lastUpdateAt: Date.now(),
    };

    if (speed !== undefined) updates.speed = speed;
    if (strategy !== undefined) updates.strategy = strategy;

    await ctx.db.patch(simulation._id, updates);
  },
});

// Simulation tick (to be called by a cron job or client)
export const simulationTick = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    const simulation = await ctx.db.query("simulations").first();
    if (!simulation || !simulation.isRunning || simulation.isPaused) return;

    await ctx.db.patch(simulation._id, {
      lastUpdateBy: userId,
      lastUpdateAt: Date.now(),
    });
  },
});
