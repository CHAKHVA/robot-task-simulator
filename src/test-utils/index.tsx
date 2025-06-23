// src/test-utils/index.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { render, RenderOptions } from "@testing-library/react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React from "react";

// Mock Convex client
const mockConvexClient = new ConvexReactClient("https://test.convex.cloud");

// Mock auth hook
const mockUseAuth = () => ({
  isLoaded: true,
  isSignedIn: true,
  getToken: jest.fn().mockResolvedValue("mock-token"),
});

interface TestProviderProps {
  children: React.ReactNode;
}

function TestProvider({ children }: TestProviderProps) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={mockConvexClient} useAuth={mockUseAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: TestProvider, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Test data factories
export const createMockRobot = (overrides = {}) => ({
  id: "robot-" + Math.random().toString(36).substr(2, 9),
  position: [0, 0],
  path: [],
  ...overrides,
});

export const createMockTask = (overrides = {}) => ({
  id: "task-" + Math.random().toString(36).substr(2, 9),
  position: [1, 1],
  ...overrides,
});

export const createMockGrid = (
  rows: number,
  cols: number,
  fillWith = "empty"
) => {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      type: fillWith as "empty" | "robot" | "task" | "obstacle",
    }))
  );
};

export const createMockSimulation = (overrides = {}) => ({
  grid: createMockGrid(30, 75),
  robots: [createMockRobot()],
  tasks: [createMockTask()],
  isRunning: false,
  isPaused: false,
  speed: "normal",
  strategy: "nearest",
  lastUpdateAt: Date.now(),
  ...overrides,
});
