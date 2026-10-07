# Mosaic Agent Guide

This document is the primary specification and architectural contract for AI coding agents (such as Codex, Claude Code, Cursor, and Copilot) working within the Mosaic codebase.

Read this guide to understand Mosaic's identity, system architecture, component libraries, simulation lifecycle, and design rules before creating or modifying interactive educational lessons.

---

## 1. Mosaic Identity

**Mosaic** is a local-first, agent-compatible framework for generating rich, interactive educational experiences.

Key tenets:
* **Existing AI Coding Agent as Control Plane**: Mosaic is **not** a standalone LLM runtime or backend server. The AI coding harness in which you are running (e.g. Codex, Claude Code, Cursor, Copilot) acts as the control plane. You read the user request, plan the pedagogical arc, write the simulation spec and React interface using Mosaic's toolkit, and verify the result.
* **Local-First & Client-Side**: Lessons run entirely in the user's browser on `localhost`. There is no cloud backend, external database, or remote execution service required for running generated simulations.
* **Declarative Simulation Engine**: State evolution, deterministic transitions, mathematical expressions, conditions, and event rules are owned by `@mosaic/simulation` and validated by `@mosaic/schemas`.
* **Semantic Toolkit**: Presentation, controls, visualizations, animations, and pedagogical scaffolding are provided by `@mosaic/ui`.

---

## 2. Core Architecture

```text
User Request
     ↓
Existing AI Harness (Codex / Claude Code / Cursor / Copilot)
     ↓
Mosaic Agent Layer (AGENT_GUIDE.md, Platform Adapters, Skills)
     ↓
Mosaic Toolkit (@mosaic/ui)
     ↓
Simulation Engine (@mosaic/simulation + @mosaic/schemas)
     ↓
Generated Educational Lesson (React + TypeScript)
     ↓
Local Browser / Localhost (Vite Dev Server)
```

### Layer Responsibilities

| Layer | Package / Location | Responsibility |
| --- | --- | --- |
| **Agent Layer** | `AGENT_GUIDE.md`, `.mosaic/skills/` | Teaches the AI agent how to design lessons, formulate simulation specs, pick semantic UI components, and verify code. |
| **Schema Layer** | `@mosaic/schemas` (`packages/schemas`) | Source of truth JSON schemas for simulation specifications, expressions, conditions, transitions, and event rules. |
| **Simulation Engine** | `@mosaic/simulation` (`packages/simulation`) | Framework-independent state manager. Evaluates expressions, executes sequential transitions, evaluates event rules, guarantees atomic step commits, and handles reset/parameter updates. |
| **Mosaic Toolkit** | `@mosaic/ui` (`packages/ui`) | React components for UI controls, data visualizations (ChartLine, Graph, Particle, Timeline, Heatmap, Diagram), motion primitives (Particle, Animated), simulation controls (Play, Pause, Step, Reset, ParameterControl), and educational containers (Explanation, Formula, CodeBlock, Question, Hint, Quiz). |
| **Lesson Application** | `apps/web` (`apps/web/src/main.tsx`) | Host React application running under Vite where interactive lessons are composed and rendered. |

---

## 3. Recommended Agent Workflow

When generating or extending an interactive educational lesson, follow these 12 steps:

1. **Understand the Educational Objective**: Identify what core mental model or concept the learner needs to discover (e.g., "How does learning rate affect gradient descent convergence?").
2. **Deconstruct Conceptual Progression**: Plan the pedagogical sequence (Concept $\rightarrow$ Explanation $\rightarrow$ Interactive Experiment $\rightarrow$ Observation $\rightarrow$ Reasoning Question $\rightarrow$ Assessment/Quiz).
3. **Identify Simulation State**: Define minimal numeric/structured dynamic variables that evolve over time (e.g., `{ x: 0, y: 0, vx: 10, vy: 20, t: 0 }`).
4. **Identify User-Controllable Parameters**: Define variables that the learner can manipulate to test hypotheses (e.g., `gravity`, `launchAngle`, `initialVelocity`). Keep static datasets separate.
5. **Formulate Declarative Transitions & Event Rules**: Define state update rules (via `@mosaic/simulation` transitions) and boundary conditions (event rules for thresholds or milestones).
6. **Select Mosaic Visualization Components**: Choose semantic visual components (`ChartLine`, `Graph`, `Particle`, `Timeline`, `Heatmap`, etc.).
7. **Select Mosaic Educational Components**: Choose pedagogical wrappers (`Explanation`, `Formula`, `CodeBlock`, `Question`, `Hint`, `Quiz`).
8. **Connect Controls to Simulation**: Instantiate `SimulationEngine` and bridge it to React using `useSimulationController`. Bind playback controls (`Play`, `Pause`, `Step`, `Reset`) and parameter inputs (`ParameterControl`, `Slider`).
9. **Add Intentional Animation**: Use `Particle`, `Animated`, or animated `Edge` to visualize physical movement or data transfer. Never animate purely for decoration.
10. **Run the Lesson Locally**: Build and serve the app locally via `npm run dev:web`.
11. **Verify Interactions & Determinism**: Verify that stepping, playing, pausing, parameter tuning, and resetting operate cleanly and deterministically.
12. **Verify Mosaic Abstraction Compliance**: Ensure semantic `@mosaic/ui` components are used as the primary abstraction before considering low-level fallback libraries.

---

## 4. Component Selection Rules

Always prefer high-level `@mosaic/ui` semantic components over ad-hoc HTML elements or lower-level library imports:

### Visualization Components

| Learner Need / Data Shape | Mosaic Component | Description & Props |
| --- | --- | --- |
| **Numerical trend / Time series (Default)** | `<ChartLine>` | Semantic line chart. `<ChartLine data={history} dataKey="value" stroke="..." />` |
| **Custom / Multi-Series Chart (Fallback)** | `<Chart>` | Responsive Recharts container for advanced multi-axis layouts. |
| **Network / System nodes & edges** | `<Graph>` | Interactive node-edge network backed by React Flow. `<Graph nodes={nodes} edges={edges} />` |
| **Diagram primitives (standalone)** | `<Node>`, `<Edge>` | SVG-level node and directed connection with optional animated pulses. |
| **Physical entity / Moving object** | `<Particle>` | Animated point with coordinate interpolation. `<Particle x={x} y={y} label="..." />` |
| **Process sequence / Stages** | `<Flow>` | Ordered sequence of process cards with active highlighting. `<Flow steps={[...]} activeIndex={i} />` |
| **Chronological / Milestone list** | `<Timeline>` | Ordered milestones with active stage indicators. `<Timeline items={[...]} />` |
| **2D Grid / Spatial intensity matrix** | `<Heatmap>` | Matrix of numeric intensities. `<Heatmap values={matrix} min={0} max={1} />` |
| **Labeled Diagram Container** | `<Diagram>` | Semantic wrapper for complex visual layouts. `<Diagram title="...">...</Diagram>` |
| **Mathematical Expression** | `<Equation>` | Labeled math layout container. `<Equation expression="..." />` |

### Educational Components

| Pedagogical Function | Mosaic Component | Description & Props |
| --- | --- | --- |
| **Conceptual narrative** | `<Explanation>` | Section with structured title and explanatory body text. `<Explanation title="...">...</Explanation>` |
| **Mathematical formula** | `<Formula>` | Formatted mathematical law or relationship. `<Formula expression="y = mx + b" />` |
| **Code or algorithm sample** | `<CodeBlock>` | Formatted code listing with language tag. `<CodeBlock code={code} language="ts" />` |
| **Inquiry / Thought prompt** | `<Question>` | Prompt encouraging the learner to predict behavior before interacting. |
| **Progressive scaffolding** | `<Hint>` | Contextual tip or collapsible guidance. `<Hint title="Hint">...</Hint>` |
| **Assessment / Checkpoint** | `<Quiz>` | Single-choice knowledge check with interactive option selection. `<Quiz question="..." options={[...]} />` |

### Simulation & UI Controls

| Control Function | Mosaic Component | Description & Usage |
| --- | --- | --- |
| **Playback controls** | `<Play>`, `<Pause>`, `<Step>`, `<Reset>` | Standardized simulation action buttons hooked to `useSimulationController`. |
| **Playback speed** | `<SpeedControl>` | Slider controlling simulation step frequency (0.25x to 4x). |
| **Parameter manipulation** | `<ParameterControl>` | Slider bound to a named simulation parameter (`simulation.setParameter`). |
| **State inspection** | `<StateInspector>` | Debugging and educational view rendering the active `SimulationState` snapshot. |
| **Event log** | `<EventLog>` | Displays events emitted by the simulation engine during steps. |
| **Generic UI Controls** | `<Button>`, `<Slider>`, `<Toggle>`, `<Dropdown>`, `<Tabs>`, `<Card>`, `<Tooltip>` | Design-system compliant widgets from `@mosaic/ui`. |
| **Animated Wrapper** | `<Animated>` | Semantic enter/exit transition wrapper. |

---

## 5. Simulation Engine Rules

The simulation engine is the **single source of truth** for simulation state.

### 1. State Separation
* **Simulation State** (`SimulationState`): Dynamic data modified during simulation steps (e.g., position, velocity, iterations, queue).
* **Parameters** (`ParameterValues`): User-adjustable configuration constants (e.g., gravity, friction, learning rate, target).
* **Static Lesson Data**: Fixed constant context (e.g., fixed sorted dataset arrays, constant physics tables).
* **React State**: Only stores UI-specific presentation state (e.g., selected tab, quiz choice, chart history accumulation). **Never duplicate simulation state in separate React `useState` variables.**

### 2. Declarative Transitions vs. Escape Hatch
* **Default**: Use declarative `spec.transitions` (with arithmetic and comparison operations).
* **Escape Hatch (`onStep`)**: Use `SimulationEngineOptions.onStep` strictly when the computation cannot reasonably be represented declaratively (e.g. non-linear differential solvers, trigonometry, or custom string algorithms). Do not move ordinary logic to callbacks for convenience.

### 3. Composition Pattern
Instantiate the engine once in the component using React state or ref initializer, and wire it with `useSimulationController`:

```tsx
import { useState } from "react";
import { SimulationEngine } from "@mosaic/simulation";
import type { ValidatedSimulationSpec } from "@mosaic/simulation";
import {
  MosaicProvider,
  Play,
  Pause,
  Step,
  Reset,
  SpeedControl,
  ParameterControl,
  StateInspector,
  EventLog,
  useSimulationController,
} from "@mosaic/ui";

const spec: ValidatedSimulationSpec = {
  initialState: { position: 0, velocity: 2 },
  parameters: [
    { name: "acceleration", type: "number", value: 1 },
  ],
  transitions: [
    {
      updates: [
        {
          target: ["position"],
          value: {
            type: "operation",
            operation: "add",
            operands: [
              { type: "state", path: ["position"] },
              { type: "state", path: ["velocity"] },
            ],
          },
        },
        {
          target: ["velocity"],
          value: {
            type: "operation",
            operation: "add",
            operands: [
              { type: "state", path: ["velocity"] },
              { type: "parameter", name: "acceleration" },
            ],
          },
        },
      ],
    },
  ],
  eventRules: [
    {
      name: "threshold_reached",
      condition: {
        expression: {
          type: "operation",
          operation: "greater_than_or_equal",
          operands: [
            { type: "state", path: ["position"] },
            { type: "literal", value: 100 },
          ],
        },
      },
      payload: { type: "state", path: ["position"] },
    },
  ],
};

export function LessonSimulation() {
  const [engine] = useState(() => new SimulationEngine(spec));
  const simulation = useSimulationController({ engine });

  return (
    <MosaicProvider>
      <div className="controls">
        <Play onClick={simulation.play} disabled={simulation.isPlaying} />
        <Pause onClick={simulation.pause} disabled={!simulation.isPlaying} />
        <Step onClick={simulation.step} disabled={simulation.isPlaying} />
        <Reset onClick={simulation.reset} />
        <SpeedControl value={simulation.speed} onChange={simulation.setSpeed} />
        <ParameterControl
          name="acceleration"
          label="Acceleration"
          value={Number(simulation.parameters.acceleration)}
          min={0}
          max={5}
          step={0.5}
          onChange={(val) => simulation.setParameter("acceleration", val)}
        />
      </div>
      <StateInspector state={simulation.state} />
      <EventLog events={simulation.events} />
    </MosaicProvider>
  );
}
```

### 4. Step Semantics & Atomicity
* **Sequential Transitions**: Declared transitions execute sequentially. Later transitions observe the working state produced by earlier transitions.
* **Intra-Transition Snapshot**: Within a single transition, all update expressions evaluate against the **pre-transition snapshot**.
* **Post-Transition EventRules**: Event rules are evaluated against the final state after all transitions complete.
* **Atomic Step Commit**: If any transition or event evaluation throws an error, the working state is discarded and the engine state remains unmodified.

---

## 6. Visualization & Animation Rules

### Abstraction Hierarchy
1. **Default**: Prefer `@mosaic/ui` semantic components (`ChartLine`, `Graph`, `Particle`, `Timeline`, `Flow`, `Heatmap`, `Diagram`, `Equation`, `Node`, `Edge`).
2. **Fallback**: Use raw Recharts (inside `<Chart>`), React Flow, or Framer Motion only when the required behavior genuinely cannot be expressed through current Mosaic abstractions.
3. **D3 is not a direct dependency**. Keep mathematical calculations pure in TypeScript; render using Mosaic SVG/DOM components.

### Purposeful Animation
* Animation must clarify **spatial motion** (e.g. projectile flying across coordinates via `<Particle x={...} y={...} />`), **state changes** (e.g. active node highlighting in `<Graph>`), or **temporal sequence** (e.g. advancing `<Timeline>` or `<Flow>`).
* Avoid continuous distracting background oscillations or unprompted layout shifts.

---

## 7. Educational Design Rules

Every generated lesson should follow an intentional pedagogical arc:

```text
1. Concept Intro        (Explanation: What problem are we exploring?)
       ↓
2. Core Principle       (Formula / Diagram: The governing rules)
       ↓
3. Interactive Stage    (Simulation Controls + Visualization: Experiment and observe)
       ↓
4. Reasoning Inquiry    (Question / Hint: Predict what happens when X changes)
       ↓
5. Knowledge Check      (Quiz: Assess understanding with targeted feedback)
```

Not every lesson requires every single educational component, but every lesson must provide clear conceptual context and allow active manipulation rather than passive reading.

---

## 8. Local Development & Verification

When developing, verifying, or testing lessons in this repository, use the following commands:

```bash
# 1. Run all workspace tests (schemas, simulation, ui)
npm test --workspaces --if-present

# 2. Run TypeScript type checks across all workspaces
npm run check

# 3. Build all workspace packages
npm run build

# 4. Start the local development web server
npm run dev:web
```

---

## 9. Specialized Skills Index

For detailed guidelines on specific sub-domains, inspect the corresponding skill files in `.mosaic/skills/`:

* [Lesson Design Skill](.mosaic/skills/lesson-design/SKILL.md) — How to plan learning objectives, cognitive scaffolding, and interaction models.
* [Simulation Engine Skill](.mosaic/skills/simulation/SKILL.md) — Full API reference for specs, expressions, transitions, events, and engine execution.
* [Visualization Skill](.mosaic/skills/visualization/SKILL.md) — Detailed catalog and usage examples for all visual components.
* [Animation Skill](.mosaic/skills/animation/SKILL.md) — Guidelines and APIs for purposeful motion and transitions.
* [Education Skill](.mosaic/skills/education/SKILL.md) — How to compose narrative, formulas, code, questions, hints, and quizzes.
