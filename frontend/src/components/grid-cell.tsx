interface GridCellProps {
  type: "empty" | "robot" | "task";
  onClick: () => void;
  isHighlighted?: boolean;
  hasPath?: boolean;
}
