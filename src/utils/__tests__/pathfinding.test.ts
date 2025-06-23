import { Cell, Robot } from "@/types";
import { generatePath, getNextStep, manhattanDistance } from "../pathfinding";

describe("pathfinding utils", () => {
  describe("manhattanDistance", () => {
    it("should calculate correct distance between two points", () => {
      expect(manhattanDistance([0, 0], [3, 4])).toBe(7);
      expect(manhattanDistance([5, 5], [5, 5])).toBe(0);
      expect(manhattanDistance([10, 10], [0, 0])).toBe(20);
    });

    it("should handle negative coordinates", () => {
      expect(manhattanDistance([-5, -5], [5, 5])).toBe(20);
      expect(manhattanDistance([0, 0], [-3, -4])).toBe(7);
    });
  });

  describe("generatePath", () => {
    const createGrid = (rows: number, cols: number): Cell[][] => {
      return Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => ({
          row,
          col,
          type: "empty" as const,
        }))
      );
    };

    it("should generate a simple path without obstacles", () => {
      const grid = createGrid(5, 5);
      const path = generatePath([0, 0], [2, 2], grid);

      expect(path).toHaveLength(4);
      expect(path[path.length - 1]).toEqual([2, 2]);
    });

    it("should return empty path if start is an obstacle", () => {
      const grid = createGrid(5, 5);
      grid[0][0].type = "obstacle";
      const path = generatePath([0, 0], [2, 2], grid);

      expect(path).toHaveLength(0);
    });

    it("should return empty path if end is an obstacle", () => {
      const grid = createGrid(5, 5);
      grid[2][2].type = "obstacle";
      const path = generatePath([0, 0], [2, 2], grid);

      expect(path).toHaveLength(0);
    });

    it("should navigate around obstacles", () => {
      const grid = createGrid(5, 5);
      // Create a wall
      grid[1][1].type = "obstacle";
      grid[1][2].type = "obstacle";
      grid[1][3].type = "obstacle";

      const path = generatePath([0, 0], [2, 2], grid);

      expect(path.length).toBeGreaterThan(4); // Longer than direct path
      expect(path[path.length - 1]).toEqual([2, 2]);

      // Verify path doesn't go through obstacles
      path.forEach(([row, col]) => {
        expect(grid[row][col].type).not.toBe("obstacle");
      });
    });

    it("should fall back to simple path if no A* path found", () => {
      const grid = createGrid(5, 5);
      // Completely block the target
      grid[1][1].type = "obstacle";
      grid[1][2].type = "obstacle";
      grid[1][3].type = "obstacle";
      grid[2][1].type = "obstacle";
      grid[2][3].type = "obstacle";
      grid[3][1].type = "obstacle";
      grid[3][2].type = "obstacle";
      grid[3][3].type = "obstacle";

      const path = generatePath([0, 0], [2, 2], grid);

      // Should still return a path (simple path fallback)
      expect(path.length).toBeGreaterThan(0);
    });

    it("should handle grid boundaries", () => {
      const grid = createGrid(10, 10);
      const path = generatePath([0, 0], [9, 9], grid);

      expect(path).toHaveLength(18); // 9 right + 9 down
      expect(path[path.length - 1]).toEqual([9, 9]);
    });
  });

  describe("getNextStep", () => {
    it("should return the first step in the path", () => {
      const robot: Robot = {
        id: "robot1",
        position: [0, 0],
        path: [
          [0, 1],
          [0, 2],
          [1, 2],
        ],
      };

      expect(getNextStep(robot)).toEqual([0, 1]);
    });

    it("should return null if path is empty", () => {
      const robot: Robot = {
        id: "robot1",
        position: [0, 0],
        path: [],
      };

      expect(getNextStep(robot)).toBeNull();
    });
  });
});
