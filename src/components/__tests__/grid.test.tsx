import * as useSimulationModule from "@/hooks/useSimulation";
import * as useSimulationStoreModule from "@/stores/simulation-store";
import "@testing-library/jest-dom";

// Mock the hooks
jest.mock("@/hooks/useSimulation");
jest.mock("@/stores/simulation-store");

// Mock GridCell component to make testing easier
jest.mock("../grid-cell", () => ({
  __esModule: true,
  default: ({
    type,
    onClick,
    hasPath,
    ...props
  }: {
    type: string;
    onClick: () => void;
    hasPath?: boolean;
  }) => (
    <div
      data-testid={`cell-${type}`}
      data-has-path={hasPath}
      onClick={onClick}
      {...props}
    >
      {type}
    </div>
  ),
}));

describe("Grid", () => {
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
      grid: [
        [
          { row: 0, col: 0, type: "robot" },
          { row: 0, col: 1, type: "empty" },
          { row: 0, col: 2, type: "task" },
        ],
        [
          { row: 1, col: 0, type: "empty" },
          { row: 1, col: 1, type: "obstacle" },
          { row: 1, col: 2, type: "empty" },
        ],
      ],
      robots: [
        {
          id: "r1",
          position: [0, 0],
          path: [
            [0, 1],
            [1, 1],
          ],
          target: [0, 2],
        },
      ],
      tasks: [{ id: "t1", position: [0, 2] }],
      handleCellClick: jest.fn(),
    }));
    mockUseSimulationStore.mockImplementation(() => ({
      placementMode: "robot",
    }));
  });

  it("should render grid with correct dimensions", () => {
    // ... rest of the test ...
  });
  // ... other tests ...
});
