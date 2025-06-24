import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import GridCell from "../grid-cell";

describe("GridCell", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("should render empty cell", () => {
    render(<GridCell type="empty" onClick={mockOnClick} />);

    const cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("bg-white");
    expect(screen.queryByRole("img", { hidden: true })).not.toBeInTheDocument();
  });

  it("should render robot cell with icon", () => {
    render(<GridCell type="robot" onClick={mockOnClick} />);

    const cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("bg-blue-500");
    // Lucide icons render as SVG elements
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("should render task cell with icon", () => {
    render(<GridCell type="task" onClick={mockOnClick} />);

    const cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("bg-green-500");
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("should render obstacle cell with icon", () => {
    render(<GridCell type="obstacle" onClick={mockOnClick} />);

    const cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("bg-gray-700");
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    render(<GridCell type="empty" onClick={mockOnClick} />);

    const cell = screen.getByRole("button", { hidden: true });
    fireEvent.click(cell);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should apply highlight styles when isHighlighted is true", () => {
    render(<GridCell type="empty" onClick={mockOnClick} isHighlighted />);

    const cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("ring-2", "ring-yellow-400");
  });

  it("should show path indicator when hasPath is true", () => {
    render(<GridCell type="empty" onClick={mockOnClick} hasPath />);

    const cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("bg-blue-100");

    // Check for path overlay div
    const pathOverlay = cell.querySelector(".bg-blue-200");
    expect(pathOverlay).toBeInTheDocument();
  });

  it("should apply hover styles", () => {
    render(<GridCell type="empty" onClick={mockOnClick} />);

    const cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("hover:bg-blue-50", "hover:border-blue-300");
  });

  it("should have correct hover colors for different types", () => {
    const { rerender } = render(
      <GridCell type="robot" onClick={mockOnClick} />
    );
    let cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("hover:bg-blue-600");

    rerender(<GridCell type="task" onClick={mockOnClick} />);
    cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("hover:bg-green-600");

    rerender(<GridCell type="obstacle" onClick={mockOnClick} />);
    cell = screen.getByRole("button", { hidden: true });
    expect(cell).toHaveClass("hover:bg-gray-800");
  });
});
