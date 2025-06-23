"use client";

import { useSimulation } from "@/hooks/useSimulation";
import { useSimulationStore } from "@/stores/simulation-store";
import GridCell from "./grid-cell";

export function Grid() {
  const { grid, robots, tasks, handleCellClick } = useSimulation();
  const { placementMode } = useSimulationStore();

  // Create a map of path positions for highlighting
  const pathPositions = new Set<string>();
  robots.forEach((robot) => {
    robot.path.forEach(([row, col]) => {
      pathPositions.add(`${row},${col}`);
    });
  });

  return (
    <div className="w-full overflow-auto">
      <div
        className="grid gap-0 border border-gray-300 min-w-full"
        style={{
          gridTemplateColumns: `repeat(75, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(30, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <GridCell
              key={`${rowIndex}-${colIndex}`}
              type={cell.type}
              onClick={() => handleCellClick(rowIndex, colIndex, placementMode)}
              hasPath={pathPositions.has(`${rowIndex},${colIndex}`)}
            />
          )),
        )}
      </div>
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {robots
          .filter((robot) => robot.target)
          .map((robot) => {
            const task = tasks.find(
              (t) =>
                t.position[0] === robot.target![0] &&
                t.position[1] === robot.target![1],
            );
            if (!task) return null;

            // Calculate pixel positions
            const cellWidth = 100 / 75;
            const cellHeight = 100 / 30;
            const startX = (robot.position[1] + 0.5) * cellWidth;
            const startY = (robot.position[0] + 0.5) * cellHeight;
            const endX = (task.position[1] + 0.5) * cellWidth;
            const endY = (task.position[0] + 0.5) * cellHeight;

            return (
              <line
                key={robot.id}
                x1={`${startX}%`}
                y1={`${startY}%`}
                x2={`${endX}%`}
                y2={`${endY}%`}
                stroke="#ef4444"
                strokeWidth="1"
                strokeOpacity="0.5"
                strokeDasharray="4,4"
              />
            );
          })}
      </svg>
    </div>
  );
}
