import { render, screen, fireEvent } from '@testing-library/react';
import { Grid } from '../grid';

// Mock the hooks
jest.mock('@/hooks/useSimulation', () => ({
  useSimulation: () => ({
    grid: [
      [
        { row: 0, col: 0, type: 'robot' },
        { row: 0, col: 1, type: 'empty' },
        { row: 0, col: 2, type: 'task' },
      ],
      [
        { row: 1, col: 0, type: 'empty' },
        { row: 1, col: 1, type: 'obstacle' },
        { row: 1, col: 2, type: 'empty' },
      ],
    ],
    robots: [
      { id: 'r1', position: [0, 0], path: [[0, 1], [1, 1]], target: [0, 2] },
    ],
    tasks: [
      { id: 't1', position: [0, 2] },
    ],
    handleCellClick: jest.fn(),
  }),
}));

jest.mock('@/stores/simulation-store', () => ({
  useSimulationStore: () => ({
    placementMode: 'robot',
  }),
}));

// Mock GridCell component to make testing easier
jest.mock('../grid-cell', () => ({
  __esModule: true,
  default: ({ type, onClick, hasPath, ...props }: any) => (
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

describe('Grid', () => {
  const mockUseSimulation = require('@/hooks/useSimulation').useSimulation;
  const mockUseSimulationStore = require('@/stores/simulation-store').useSimulationStore;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render grid with correct dimensions', () => {
    const largeGrid = Array(30).fill(null).map((_, row) =>
      Array(75).fill(null).map((_, col) => ({
        row,
        col,
        type: 'empty' as const,
      }))
    );
    
    mockUseSimulation.mockReturnValueOnce({
      ...mockUseSimulation(),