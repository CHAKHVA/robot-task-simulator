import { cn } from "@/lib/utils";
import { Bot, Target } from "lucide-react";

interface GridCellProps {
  type: "empty" | "robot" | "task";
  onClick: () => void;
  isHighlighted?: boolean;
  hasPath?: boolean;
}

export default function GridCell({
  type,
  onClick,
  isHighlighted,
  hasPath,
}: GridCellProps) {
  return (
    <div
      className={cn(
        "aspect-square border border-gray-200 cursor-pointer transition-all duration-150 flex items-center justify-center text-xs relative",
        "hover:bg-blue-50 hover:border-blue-300",
        type === "empty" && "bg-white",
        type === "robot" && "bg-blue-500 text-white hover:bg-blue-600",
        type === "task" && "bg-green-500 text-white hover:bg-green-600",
        isHighlighted && "ring-2 ring-yellow-400 ring-opacity-50",
        hasPath && "bg-blue-100"
      )}
      onClick={onClick}
    >
      {type === "robot" && <Bot size={12} />}
      {type === "task" && <Target size={12} />}
      {hasPath && type === "empty" && (
        <div className="absolute inset-0 bg-blue-200 opacity-30" />
      )}
    </div>
  );
}
