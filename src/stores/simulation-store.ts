import { PlacementMode } from "@/types";
import { create } from "zustand";

export const GRID_ROWS = 30;
export const GRID_COLS = 75;

interface SimulationState {
  placementMode: PlacementMode;
  setPlacementMode: (mode: PlacementMode) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  placementMode: "robot",
  setPlacementMode: (mode: PlacementMode) => set({ placementMode: mode }),
}));
