import { v } from "convex/values";
import { mutation } from "./_generated/server";

export type Cell = {
  row: number;
  col: number;
  type: "empty" | "robot" | "task" | "obstacle";
};

export type Robot = {
  id: string;
  position: number[];
  target?: number[];
  path: number[][];
};

export type Task = {
  id: string;
  position: number[];
  assignedTo?: string;
};

function manhattanDistance(pos1: number[], pos2: number[]): number {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

interface PathNode {
  position: number[];
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

function generatePath(
  start: number[],
  end: number[],
  grid: Cell[][],
): number[][] {
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

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
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i;
      }
    }

    const currentNode = openSet[currentIndex];

    if (
      currentNode.position[0] === endRow &&
      currentNode.position[1] === endCol
    ) {
      const path: number[][] = [];
      let current: PathNode | null = currentNode;
      while (current) {
        path.unshift(current.position);
        current = current.parent;
      }
      return path.slice(1);
    }

    openSet.splice(currentIndex, 1);
    closedSet.add(`${currentNode.position[0]},${currentNode.position[1]}`);

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dRow, dCol] of directions) {
      const newRow = currentNode.position[0] + dRow;
      const newCol = currentNode.position[1] + dCol;

      if (
        newRow < 0 ||
        newRow >= grid.length ||
        newCol < 0 ||
        newCol >= grid[0].length
      ) {
        continue;
      }

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

      const existingNodeIndex = openSet.findIndex(
        (node) => node.position[0] === newRow && node.position[1] === newCol,
      );

      if (existingNodeIndex === -1) {
        openSet.push(neighbor);
      } else if (neighbor.g < openSet[existingNodeIndex].g) {
        openSet[existingNodeIndex] = neighbor;
      }
    }
  }

  return generateSimplePath(start, end);
}

function generateSimplePath(start: number[], end: number[]): number[][] {
  const path: number[][] = [];
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  let currentRow = startRow;
  let currentCol = startCol;

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

// Strategy functions
function assignTasksNearestFirst(robots: Robot[], tasks: Task[]): Robot[] {
  const updatedRobots = [...robots];
  const availableTasks = tasks.filter((task) => !task.assignedTo);

  updatedRobots.forEach((robot) => {
    if (!robot.target) {
      const assignedTask = tasks.find((task) => task.assignedTo === robot.id);
      if (assignedTask) {
        assignedTask.assignedTo = undefined;
      }
    }
  });

  const idleRobots = updatedRobots.filter((robot) => !robot.target);

  idleRobots.forEach((robot) => {
    const unassignedTasks = availableTasks.filter((task) => !task.assignedTo);
    if (unassignedTasks.length === 0) return;

    let nearestTask = unassignedTasks[0];
    let minDistance = manhattanDistance(robot.position, nearestTask.position);

    unassignedTasks.forEach((task) => {
      const distance = manhattanDistance(robot.position, task.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestTask = task;
      }
    });

    nearestTask.assignedTo = robot.id;
    robot.target = nearestTask.position;
  });

  return updatedRobots;
}

function assignTasksRoundRobin(robots: Robot[], tasks: Task[]): Robot[] {
  const updatedRobots = [...robots];
  const availableTasks = tasks.filter((task) => !task.assignedTo);
  const idleRobots = updatedRobots.filter((robot) => !robot.target);

  if (idleRobots.length === 0 || availableTasks.length === 0)
    return updatedRobots;

  availableTasks.forEach((task, index) => {
    const robotIndex = index % idleRobots.length;
    const robot = idleRobots[robotIndex];

    if (!robot.target) {
      task.assignedTo = robot.id;
      robot.target = task.position;
    }
  });

  return updatedRobots;
}

// Main tick function
export const tick = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    const simulation = await ctx.db.query("simulations").first();
    if (!simulation || !simulation.isRunning || simulation.isPaused) return;

    const { grid, tasks, strategy } = simulation;
    let { robots } = simulation;

    // Assign tasks
    if (strategy === "nearest") {
      robots = assignTasksNearestFirst(robots, tasks);
    } else {
      robots = assignTasksRoundRobin(robots, tasks);
    }

    // Generate paths for robots with new targets
    robots.forEach((robot) => {
      if (robot.target && robot.path.length === 0) {
        robot.path = generatePath(robot.position, robot.target, grid);
      }
    });

    // Move robots
    const updatedGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const updatedTasks = [...tasks];

    robots.forEach((robot) => {
      if (robot.path.length === 0) return;

      const nextStep = robot.path[0];
      if (
        nextStep &&
        updatedGrid[nextStep[0]][nextStep[1]].type === "obstacle"
      ) {
        if (robot.target) {
          robot.path = generatePath(robot.position, robot.target, updatedGrid);
        }
        return;
      }

      // Clear current position
      const [currentRow, currentCol] = robot.position;
      updatedGrid[currentRow][currentCol].type = "empty";

      // Move to next position
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
              task.position[1] === robot.target![1],
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

    // Check if simulation is complete
    const isComplete = updatedTasks.length === 0;

    await ctx.db.patch(simulation._id, {
      grid: updatedGrid,
      robots,
      tasks: updatedTasks,
      isRunning: !isComplete,
      lastUpdateBy: userId,
      lastUpdateAt: Date.now(),
    });
  },
});
