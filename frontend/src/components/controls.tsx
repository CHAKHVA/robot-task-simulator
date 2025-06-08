import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSimulationStore } from "@/stores/simulation-store";
import {
  Bot,
  Pause,
  Play,
  Shuffle,
  Square,
  Target,
  Trash2,
} from "lucide-react";

export function Controls() {
  const {
    isRunning,
    isPaused,
    speed,
    strategy,
    placementMode,
    robots,
    tasks,
    start,
    pause,
    reset,
    clearGrid,
    randomize,
    setSpeed,
    setStrategy,
    setPlacementMode,
  } = useSimulationStore();

  const canStart = robots.length > 0 && tasks.length > 0 && !isRunning;

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-4">
          {/* Simulation Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={start}
              disabled={!canStart}
              variant={canStart ? "default" : "secondary"}
              size="sm"
            >
              <Play size={16} className="mr-1" />
              Start
            </Button>

            <Button
              onClick={pause}
              disabled={!isRunning}
              variant="outline"
              size="sm"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              <span className="ml-1">{isPaused ? "Resume" : "Pause"}</span>
            </Button>

            <Button
              onClick={reset}
              disabled={!isRunning && robots.every((r) => !r.target)}
              variant="outline"
              size="sm"
            >
              <Square size={16} className="mr-1" />
              Reset
            </Button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Grid Controls */}
          <div className="flex items-center gap-2">
            <Button onClick={randomize} variant="outline" size="sm">
              <Shuffle size={16} className="mr-1" />
              Randomize
            </Button>

            <Button onClick={clearGrid} variant="outline" size="sm">
              <Trash2 size={16} className="mr-1" />
              Clear All
            </Button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Placement Mode */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Place:</span>
            <Button
              onClick={() => setPlacementMode("robot")}
              variant={placementMode === "robot" ? "default" : "outline"}
              size="sm"
            >
              <Bot size={16} className="mr-1" />
              Robots
            </Button>
            <Button
              onClick={() => setPlacementMode("task")}
              variant={placementMode === "task" ? "default" : "outline"}
              size="sm"
            >
              <Target size={16} className="mr-1" />
              Tasks
            </Button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Strategy Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Strategy:</span>
            <Select
              value={strategy}
              onValueChange={setStrategy}
              disabled={isRunning}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nearest">Nearest First</SelectItem>
                <SelectItem value="roundrobin">Round Robin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Speed:</span>
            <Select value={speed} onValueChange={setSpeed}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Bot size={12} className="mr-1" />
                {robots.length} Robots
              </Badge>
              <Badge variant="outline">
                <Target size={12} className="mr-1" />
                {tasks.length} Tasks
              </Badge>
            </div>

            {isRunning && (
              <Badge variant={isPaused ? "secondary" : "default"}>
                {isPaused ? "Paused" : "Running"}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
