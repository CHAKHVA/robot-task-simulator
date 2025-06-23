"use client";

import { Controls } from "@/components/controls";
import { Grid } from "@/components/grid";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Robot Task Simulator
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Place robots and tasks on the grid, choose a strategy, and watch
              as robots intelligently complete tasks using pathfinding
              algorithms.
            </p>
          </div>
          <div className="ml-4 flex items-center">
            <Authenticated>
              <UserButton />
            </Authenticated>
            <Unauthenticated>
              <SignInButton />
            </Unauthenticated>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Controls />

      {/* Main Grid Area */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative">
            <Grid />
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              Click on empty cells to place robots or tasks. Click on existing
              entities to remove them. Use the controls above to run the
              simulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
