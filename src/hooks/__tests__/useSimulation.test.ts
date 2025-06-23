import { useUser } from "@clerk/nextjs";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useMutation, useQuery } from "convex/react";
import { useSimulation } from "../useSimulation";

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

// Mock Convex
jest.mock("convex/react", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));

// Mock the API
jest.mock("../../../convex/_generated/api", () => ({
  api: {
    simulation: {
      getSimulation: "getSimulation",
      initializeSimulation: "initializeSimulation",
      updateCell: "updateCell",
      startSimulation: "startSimulation",
      togglePause: "togglePause",
      resetSimulation: "resetSimulation",
      clearGrid: "clearGrid",
      randomizeGrid: "randomizeGrid",
      updateSettings: "updateSettings",
    },
    simulationLogic: {
      tick: "tick",
    },
  },
}));

describe("useSimulation", () => {
  const mockUser = { id: "user123" };
  const mockSimulation = {
    grid: [[{ row: 0, col: 0, type: "empty" }]],
    robots: [{ id: "r1", position: [0, 0], path: [] }],
    tasks: [{ id: "t1", position: [1, 1] }],
    isRunning: false,
    isPaused: false,
    speed: "normal",
    strategy: "nearest",
  };

  const mockMutations = {
    initialize: jest.fn(),
    updateCell: jest.fn(),
    start: jest.fn(),
    togglePause: jest.fn(),
    reset: jest.fn(),
    clearGrid: jest.fn(),
    randomize: jest.fn(),
    updateSettings: jest.fn(),
    tick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (useQuery as jest.Mock).mockReturnValue(mockSimulation);
    (useMutation as jest.Mock).mockImplementation((api: string) => {
      switch (api) {
        case "initializeSimulation":
          return mockMutations.initialize;
        case "updateCell":
          return mockMutations.updateCell;
        case "startSimulation":
          return mockMutations.start;
        case "togglePause":
          return mockMutations.togglePause;
        case "resetSimulation":
          return mockMutations.reset;
        case "clearGrid":
          return mockMutations.clearGrid;
        case "randomizeGrid":
          return mockMutations.randomize;
        case "updateSettings":
          return mockMutations.updateSettings;
        case "tick":
          return mockMutations.tick;
        default:
          return jest.fn();
      }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return simulation data from query", () => {
    const { result } = renderHook(() => useSimulation());

    expect(result.current.grid).toEqual(mockSimulation.grid);
    expect(result.current.robots).toEqual(mockSimulation.robots);
    expect(result.current.tasks).toEqual(mockSimulation.tasks);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.speed).toBe("normal");
    expect(result.current.strategy).toBe("nearest");
  });

  it("should initialize simulation if it does not exist", async () => {
    (useQuery as jest.Mock).mockReturnValue(null);

    renderHook(() => useSimulation());

    await waitFor(() => {
      expect(mockMutations.initialize).toHaveBeenCalledTimes(1);
    });
  });

  it("should not initialize if simulation already exists", () => {
    renderHook(() => useSimulation());

    expect(mockMutations.initialize).not.toHaveBeenCalled();
  });

  it("should handle cell clicks when not running", () => {
    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.handleCellClick(5, 10, "robot");
    });

    expect(mockMutations.updateCell).toHaveBeenCalledWith({
      row: 5,
      col: 10,
      placementMode: "robot",
      userId: "user123",
    });
  });

  it("should not handle cell clicks when running", () => {
    (useQuery as jest.Mock).mockReturnValue({
      ...mockSimulation,
      isRunning: true,
    });

    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.handleCellClick(5, 10, "robot");
    });

    expect(mockMutations.updateCell).not.toHaveBeenCalled();
  });

  it("should call start mutation", () => {
    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.start();
    });

    expect(mockMutations.start).toHaveBeenCalledWith({ userId: "user123" });
  });

  it("should call pause mutation", () => {
    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.pause();
    });

    expect(mockMutations.togglePause).toHaveBeenCalledWith({
      userId: "user123",
    });
  });

  it("should update settings", () => {
    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.setSpeed("fast");
    });

    expect(mockMutations.updateSettings).toHaveBeenCalledWith({
      speed: "fast",
      userId: "user123",
    });

    act(() => {
      result.current.setStrategy("roundrobin");
    });

    expect(mockMutations.updateSettings).toHaveBeenCalledWith({
      strategy: "roundrobin",
      userId: "user123",
    });
  });

  describe("simulation tick", () => {
    it("should start tick interval when running", () => {
      (useQuery as jest.Mock).mockReturnValue({
        ...mockSimulation,
        isRunning: true,
        isPaused: false,
        speed: "normal",
      });

      renderHook(() => useSimulation());

      // Fast forward 500ms (normal speed)
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockMutations.tick).toHaveBeenCalledWith({ userId: "user123" });
    });

    it("should not tick when paused", () => {
      (useQuery as jest.Mock).mockReturnValue({
        ...mockSimulation,
        isRunning: true,
        isPaused: true,
      });

      renderHook(() => useSimulation());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockMutations.tick).not.toHaveBeenCalled();
    });

    it("should use correct interval for different speeds", () => {
      const { rerender } = renderHook(() => useSimulation());

      // Test slow speed (1000ms)
      (useQuery as jest.Mock).mockReturnValue({
        ...mockSimulation,
        isRunning: true,
        speed: "slow",
      });

      rerender();

      act(() => {
        jest.advanceTimersByTime(999);
      });
      expect(mockMutations.tick).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(mockMutations.tick).toHaveBeenCalledTimes(1);

      // Test fast speed (200ms)
      mockMutations.tick.mockClear();
      (useQuery as jest.Mock).mockReturnValue({
        ...mockSimulation,
        isRunning: true,
        speed: "fast",
      });

      rerender();

      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(mockMutations.tick).toHaveBeenCalledTimes(1);
    });

    it("should clean up interval on unmount", () => {
      (useQuery as jest.Mock).mockReturnValue({
        ...mockSimulation,
        isRunning: true,
      });

      const { unmount } = renderHook(() => useSimulation());

      unmount();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockMutations.tick).not.toHaveBeenCalled();
    });
  });

  it("should handle user not being logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.handleCellClick(0, 0, "robot");
    });

    expect(mockMutations.updateCell).toHaveBeenCalledWith({
      row: 0,
      col: 0,
      placementMode: "robot",
      userId: undefined,
    });
  });

  it("should provide default values when simulation is null", () => {
    (useQuery as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useSimulation());

    expect(result.current.grid).toEqual([]);
    expect(result.current.robots).toEqual([]);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.speed).toBe("normal");
    expect(result.current.strategy).toBe("nearest");
  });
});
