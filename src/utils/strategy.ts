import { Robot, Task } from "@/types";
import { manhattanDistance } from "./pathfinding";

export function assignTasksNearestFirst(
  robots: Robot[],
  tasks: Task[],
): Robot[] {
  const updatedRobots = [...robots];
  const availableTasks = tasks.filter((task) => !task.assignedTo);

  // Clear existing assignments for robots without targets
  updatedRobots.forEach((robot) => {
    if (!robot.target) {
      const assignedTask = tasks.find((task) => task.assignedTo === robot.id);
      if (assignedTask) {
        assignedTask.assignedTo = undefined;
      }
    }
  });

  // Assign tasks to idle robots
  const idleRobots = updatedRobots.filter((robot) => !robot.target);

  idleRobots.forEach((robot) => {
    const unassignedTasks = availableTasks.filter((task) => !task.assignedTo);
    if (unassignedTasks.length === 0) return;

    // Find nearest task
    let nearestTask = unassignedTasks[0];
    let minDistance = manhattanDistance(robot.position, nearestTask.position);

    unassignedTasks.forEach((task) => {
      const distance = manhattanDistance(robot.position, task.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestTask = task;
      }
    });

    // Assign task
    nearestTask.assignedTo = robot.id;
    robot.target = nearestTask.position;
  });

  return updatedRobots;
}

export function assignTasksRoundRobin(robots: Robot[], tasks: Task[]): Robot[] {
  const updatedRobots = [...robots];
  const availableTasks = tasks.filter((task) => !task.assignedTo);
  const idleRobots = updatedRobots.filter((robot) => !robot.target);

  if (idleRobots.length === 0 || availableTasks.length === 0)
    return updatedRobots;

  // Assign tasks in round-robin fashion
  availableTasks.forEach((task, index) => {
    const robotIndex = index % idleRobots.length;
    const robot = idleRobots[robotIndex];

    if (!robot.target) {
      // Make sure robot is still idle
      task.assignedTo = robot.id;
      robot.target = task.position;
    }
  });

  return updatedRobots;
}
