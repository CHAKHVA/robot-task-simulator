// src/hooks/useSimulation.ts
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export function useSimulation() {
  const { user } = useUser();
  const userId = user?.id;

  // Queries
  const simulation = useQuery(api.simulation.getSimulation);

  // Mutations
  const updateCell = useMutation(api.simulation.updateCell);
  const start = useMutation(api.simulation.startSimulation);
  const togglePause = useMutation(api.simulation.togglePause);
  const reset = useMutation(api.simulation.resetSimulation);
  const clearGrid = useMutation(api.simulation.clearGrid);
  const randomize = useMutation(api.simulation.randomizeGrid);
  const updateSettings = useMutation(api.simulation.updateSettings);
  const tick = useMutation(api.simulationLogic.tick);

  // Simulation tick loop
  useEffect(() => {
    if (!simulation?.isRunning || simulation?.isPaused) return;

    const speedMap = {
      slow: 1000,
      normal: 500,
      fast: 200,
    };

    const interval = setInterval(() => {
      tick({ userId });
    }, speedMap[simulation.speed]);

    return () => clearInterval(interval);
  }, [
    simulation?.isRunning,
    simulation?.isPaused,
    simulation?.speed,
    tick,
    userId,
  ]);

  return {
    // Simulation data
    grid: simulation?.grid ?? [],
    robots: simulation?.robots ?? [],
    tasks: simulation?.tasks ?? [],
    isRunning: simulation?.isRunning ?? false,
    isPaused: simulation?.isPaused ?? false,
    speed: simulation?.speed ?? "normal",
    strategy: simulation?.strategy ?? "nearest",

    // Actions
    handleCellClick: (
      row: number,
      col: number,
      placementMode: "robot" | "task" | "obstacle",
    ) => {
      if (!simulation?.isRunning) {
        updateCell({ row, col, placementMode, userId });
      }
    },
    start: () => start({ userId }),
    pause: () => togglePause({ userId }),
    reset: () => reset({ userId }),
    clearGrid: () => clearGrid({ userId }),
    randomize: () => randomize({ userId }),
    setSpeed: (speed: "slow" | "normal" | "fast") =>
      updateSettings({ speed, userId }),
    setStrategy: (strategy: "nearest" | "roundrobin") =>
      updateSettings({ strategy, userId }),
  };
}
