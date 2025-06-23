# Robot Task Simulator

A web-based simulator for designing, testing, and visualizing robot task strategies on a grid. This project allows users to simulate robot movement, task execution, and pathfinding algorithms in a customizable environment.

## Features

- **Grid-based Simulation:** Visualize robots moving and performing tasks on a grid.
- **Customizable Components:** Easily add or modify robots, tasks, and grid properties.
- **Pathfinding Algorithms:** Includes utilities for pathfinding and strategy testing.
- **State Management:** Uses modern React state management for simulation control.
- **Testing Suite:** Comprehensive tests for components, hooks, and utilities.
- **Authentication:** Secure access to simulation features.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend/Logic:** Convex (for simulation logic and schema)
- **Styling:** CSS Modules/PostCSS
- **Testing:** Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
git clone https://github.com/your-username/robot-task-simulator.git
cd robot-task-simulator
npm install
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the simulator in your browser.

### Running Tests

```bash
npm test
```

## Project Structure

- `src/components/` – UI components (grid, controls, etc.)
- `src/hooks/` – Custom React hooks (e.g., simulation logic)
- `src/stores/` – State management
- `src/utils/` – Pathfinding and strategy utilities
- `convex/` – Backend logic, schema, and simulation logic
- `public/` – Static assets
