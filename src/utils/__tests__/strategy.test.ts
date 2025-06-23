import { Robot, Task } from "@/types";
import { assignTasksNearestFirst, assignTasksRoundRobin } from "../strategy";

describe("strategy utils", () => {
  describe("assignTasksNearestFirst", () => {
    it("should assign nearest task to idle robot", () => {
      const robots: Robot[] = [{ id: "r1", position: [0, 0], path: [] }];

      const tasks: Task[] = [
        { id: "t1", position: [1, 1] }, // Distance: 2
        { id: "t2", position: [5, 5] }, // Distance: 10
      ];

      const result = assignTasksNearestFirst(robots, tasks);

      expect(result[0].target).toEqual([1, 1]);
      expect(tasks[0].assignedTo).toBe("r1");
      expect(tasks[1].assignedTo).toBeUndefined();
    });

    it("should not reassign robots that already have targets", () => {
      const robots: Robot[] = [
        {
          id: "r1",
          position: [0, 0],
          target: [10, 10],
          path: [
            [1, 0],
            [2, 0],
          ],
        },
        { id: "r2", position: [5, 5], path: [] },
      ];

      const tasks: Task[] = [
        { id: "t1", position: [1, 1] },
        { id: "t2", position: [6, 6] },
      ];

      const result = assignTasksNearestFirst(robots, tasks);

      // First robot should keep its target
      expect(result[0].target).toEqual([10, 10]);
      // Second robot should get nearest task
      expect(result[1].target).toEqual([6, 6]);
    });

    it("should handle multiple robots competing for same task", () => {
      const robots: Robot[] = [
        { id: "r1", position: [0, 0], path: [] },
        { id: "r2", position: [2, 2], path: [] },
      ];

      const tasks: Task[] = [
        { id: "t1", position: [1, 1] }, // Nearest to both
        { id: "t2", position: [10, 10] },
      ];

      const result = assignTasksNearestFirst(robots, tasks);

      // First robot should get the nearest task
      expect(result[0].target).toEqual([1, 1]);
      expect(tasks[0].assignedTo).toBe("r1");

      // Second robot should get the remaining task
      expect(result[1].target).toEqual([10, 10]);
      expect(tasks[1].assignedTo).toBe("r2");
    });

    it("should handle more tasks than robots", () => {
      const robots: Robot[] = [{ id: "r1", position: [0, 0], path: [] }];

      const tasks: Task[] = [
        { id: "t1", position: [1, 1] },
        { id: "t2", position: [2, 2] },
        { id: "t3", position: [3, 3] },
      ];

      const result = assignTasksNearestFirst(robots, tasks);

      expect(result[0].target).toEqual([1, 1]);
      expect(tasks[0].assignedTo).toBe("r1");
      expect(tasks[1].assignedTo).toBeUndefined();
      expect(tasks[2].assignedTo).toBeUndefined();
    });

    it("should handle no available tasks", () => {
      const robots: Robot[] = [{ id: "r1", position: [0, 0], path: [] }];

      const tasks: Task[] = [];

      const result = assignTasksNearestFirst(robots, tasks);

      expect(result[0].target).toBeUndefined();
    });
  });

  describe("assignTasksRoundRobin", () => {
    it("should distribute tasks evenly among robots", () => {
      const robots: Robot[] = [
        { id: "r1", position: [0, 0], path: [] },
        { id: "r2", position: [5, 5], path: [] },
      ];

      const tasks: Task[] = [
        { id: "t1", position: [1, 1] },
        { id: "t2", position: [2, 2] },
        { id: "t3", position: [3, 3] },
        { id: "t4", position: [4, 4] },
      ];

      const result = assignTasksRoundRobin(robots, tasks);

      // Tasks should be distributed alternately
      expect(result[0].target).toEqual([1, 1]);
      expect(result[1].target).toEqual([2, 2]);
      expect(tasks[0].assignedTo).toBe("r1");
      expect(tasks[1].assignedTo).toBe("r2");

      // Remaining tasks should not be assigned yet
      expect(tasks[2].assignedTo).toBeUndefined();
      expect(tasks[3].assignedTo).toBeUndefined();
    });

    it("should only assign to idle robots", () => {
      const robots: Robot[] = [
        { id: "r1", position: [0, 0], target: [10, 10], path: [[1, 0]] },
        { id: "r2", position: [5, 5], path: [] },
        { id: "r3", position: [8, 8], path: [] },
      ];

      const tasks: Task[] = [
        { id: "t1", position: [1, 1] },
        { id: "t2", position: [2, 2] },
      ];

      const result = assignTasksRoundRobin(robots, tasks);

      // First robot should keep its target
      expect(result[0].target).toEqual([10, 10]);

      // Tasks should be assigned to idle robots only
      expect(result[1].target).toEqual([1, 1]);
      expect(result[2].target).toEqual([2, 2]);
    });

    it("should handle single robot with multiple tasks", () => {
      const robots: Robot[] = [{ id: "r1", position: [0, 0], path: [] }];

      const tasks: Task[] = [
        { id: "t1", position: [1, 1] },
        { id: "t2", position: [2, 2] },
        { id: "t3", position: [3, 3] },
      ];

      const result = assignTasksRoundRobin(robots, tasks);

      // Only first task should be assigned
      expect(result[0].target).toEqual([1, 1]);
      expect(tasks[0].assignedTo).toBe("r1");
      expect(tasks[1].assignedTo).toBeUndefined();
      expect(tasks[2].assignedTo).toBeUndefined();
    });

    it("should return unchanged robots if no idle robots", () => {
      const robots: Robot[] = [
        { id: "r1", position: [0, 0], target: [10, 10], path: [[1, 0]] },
        { id: "r2", position: [5, 5], target: [11, 11], path: [[6, 5]] },
      ];

      const tasks: Task[] = [{ id: "t1", position: [1, 1] }];

      const result = assignTasksRoundRobin(robots, tasks);

      expect(result).toEqual(robots);
      expect(tasks[0].assignedTo).toBeUndefined();
    });
  });
});
