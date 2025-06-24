import * as useSimulationModule from "@/hooks/useSimulation";
import * as useSimulationStoreModule from "@/stores/simulation-store";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Controls } from "../controls";

// Mock the hooks
jest.mock("@/hooks/useSimulation");
jest.mock("@/stores/simulation-store");

describe("Controls", () => {
  let mockUseSimulation: jest.SpyInstance;
  let mockUseSimulationStore: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSimulation = jest.spyOn(useSimulationModule, "useSimulation");
    mockUseSimulationStore = jest.spyOn(
      useSimulationStoreModule,
      "useSimulationStore"
    );
    mockUseSimulation.mockImplementation(() => ({
      isRunning: false,
      isPaused: false,
      speed: "normal",
      strategy: "nearest",
      robots: [{ id: "r1", position: [0, 0], path: [] }],
      tasks: [{ id: "t1", position: [1, 1] }],
      start: jest.fn(),
      pause: jest.fn(),
      reset: jest.fn(),
      clearGrid: jest.fn(),
      randomize: jest.fn(),
      setSpeed: jest.fn(),
      setStrategy: jest.fn(),
    }));
    mockUseSimulationStore.mockImplementation(() => ({
      placementMode: "robot",
      setPlacementMode: jest.fn(),
    }));
  });

  describe("Simulation Controls", () => {
    it("should enable Start button when robots and tasks exist", () => {
      render(<Controls />);

      const startButton = screen.getByRole("button", { name: /start/i });
      expect(startButton).not.toBeDisabled();
      expect(startButton).toHaveClass("variant-default");
    });

    it("should disable Start button when no robots", () => {
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        robots: [],
      });

      render(<Controls />);

      const startButton = screen.getByRole("button", { name: /start/i });
      expect(startButton).toBeDisabled();
    });

    it("should disable Start button when no tasks", () => {
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        tasks: [],
      });

      render(<Controls />);

      const startButton = screen.getByRole("button", { name: /start/i });
      expect(startButton).toBeDisabled();
    });

    it("should disable Start button when simulation is running", () => {
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        isRunning: true,
      });

      render(<Controls />);

      const startButton = screen.getByRole("button", { name: /start/i });
      expect(startButton).toBeDisabled();
    });

    it("should show Pause button when running and not paused", () => {
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        isRunning: true,
        isPaused: false,
      });

      render(<Controls />);

      const pauseButton = screen.getByRole("button", { name: /pause/i });
      expect(pauseButton).not.toBeDisabled();
    });

    it("should show Resume button when running and paused", () => {
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        isRunning: true,
        isPaused: true,
      });

      render(<Controls />);

      const resumeButton = screen.getByRole("button", { name: /resume/i });
      expect(resumeButton).not.toBeDisabled();
    });

    it("should call start when Start button is clicked", () => {
      const mockStart = jest.fn();
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        start: mockStart,
      });

      render(<Controls />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      expect(mockStart).toHaveBeenCalledTimes(1);
    });
  });

  describe("Grid Controls", () => {
    it("should call randomize when Randomize button is clicked", () => {
      const mockRandomize = jest.fn();
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        randomize: mockRandomize,
      });

      render(<Controls />);

      fireEvent.click(screen.getByRole("button", { name: /randomize/i }));
      expect(mockRandomize).toHaveBeenCalledTimes(1);
    });

    it("should call clearGrid when Clear All button is clicked", () => {
      const mockClearGrid = jest.fn();
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        clearGrid: mockClearGrid,
      });

      render(<Controls />);

      fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
      expect(mockClearGrid).toHaveBeenCalledTimes(1);
    });
  });

  describe("Placement Mode", () => {
    it("should highlight active placement mode", () => {
      render(<Controls />);

      const robotButton = screen.getByRole("button", { name: /robots/i });
      expect(robotButton).toHaveClass("variant-default");

      const taskButton = screen.getByRole("button", { name: /tasks/i });
      expect(taskButton).toHaveClass("variant-outline");
    });

    it("should call setPlacementMode when mode buttons are clicked", () => {
      const mockSetPlacementMode = jest.fn();
      mockUseSimulationStore.mockReturnValueOnce({
        ...useSimulationStoreModule.useSimulationStore(),
        setPlacementMode: mockSetPlacementMode,
      });

      render(<Controls />);

      fireEvent.click(screen.getByRole("button", { name: /tasks/i }));
      expect(mockSetPlacementMode).toHaveBeenCalledWith("task");

      fireEvent.click(screen.getByRole("button", { name: /obstacles/i }));
      expect(mockSetPlacementMode).toHaveBeenCalledWith("obstacle");
    });
  });

  describe("Strategy Selector", () => {
    it("should display current strategy", () => {
      render(<Controls />);

      expect(screen.getByText("Nearest First")).toBeInTheDocument();
    });

    it("should disable strategy selector when running", () => {
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        isRunning: true,
      });

      render(<Controls />);

      const strategyTrigger = screen.getByRole("combobox");
      expect(strategyTrigger).toBeDisabled();
    });

    it("should call setStrategy when strategy is changed", async () => {
      const mockSetStrategy = jest.fn();
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        setStrategy: mockSetStrategy,
      });

      const user = userEvent.setup();
      render(<Controls />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByText("Round Robin"));

      expect(mockSetStrategy).toHaveBeenCalledWith("roundrobin");
    });
  });

  describe("Speed Selector", () => {
    it("should display current speed", () => {
      render(<Controls />);

      expect(screen.getByText("Normal")).toBeInTheDocument();
    });

    it("should call setSpeed when speed is changed", async () => {
      const mockSetSpeed = jest.fn();
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        setSpeed: mockSetSpeed,
      });

      const user = userEvent.setup();
      render(<Controls />);

      const speedSelectors = screen.getAllByRole("combobox");
      await user.click(speedSelectors[1]); // Speed is second selector
      await user.click(screen.getByText("Fast"));

      expect(mockSetSpeed).toHaveBeenCalledWith("fast");
    });
  });

  describe("Status Display", () => {
    it("should display robot and task counts", () => {
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        robots: [{ id: "r1" }, { id: "r2" }, { id: "r3" }],
        tasks: [{ id: "t1" }, { id: "t2" }],
      });

      render(<Controls />);

      expect(screen.getByText("3 Robots")).toBeInTheDocument();
      expect(screen.getByText("2 Tasks")).toBeInTheDocument();
    });

    it("should show Running status when simulation is running", () => {
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        isRunning: true,
        isPaused: false,
      });

      render(<Controls />);

      expect(screen.getByText("Running")).toBeInTheDocument();
    });

    it("should show Paused status when simulation is paused", () => {
      mockUseSimulation.mockReturnValueOnce({
        ...useSimulationModule.useSimulation(),
        isRunning: true,
        isPaused: true,
      });

      render(<Controls />);

      expect(screen.getByText("Paused")).toBeInTheDocument();
    });
  });
});
