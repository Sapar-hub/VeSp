# Tasks: Dynamic Expression UX

**Input**: Design documents from `/specs/001-dynamic-expression-ux/`

## Phase 1: Setup

- [X] T001 [P] Install vitest for testing: `npm install --save-dev vitest`
- [X] T002 [P] Install react-latex for LaTeX rendering: `npm install react-latex`

## Phase 2: Foundational

- [X] T003 Create `src/store/expressionStore.ts` to manage the state of the expression input.
- [X] T004 [P] Create `src/components/core/GhostVector.tsx` for visualizing ghost vectors.
- [X] T005 [P] Create `src/math/ExpressionEngine.ts` to handle parsing and evaluation of expressions.

## Phase 3: User Story 1 - Single-Line Expression Input (Priority: P1)

**Goal**: Replace the current multi-line expression manager with a single-line input field similar to Desmos

**Independent Test**: Can be fully tested by verifying that the expression input is a single-line field and that multi-line expressions can be entered and parsed correctly.

### Tests for User Story 1

- [X] T006 [P] [US1] Write unit tests for the `ExpressionInputPanel` component in `src/components/ui/ExpressionInputPanel.test.tsx`.

### Implementation for User Story 1

- [X] T007 [US1] Update `src/components/ui/ExpressionInputPanel.tsx` to be a single-line input.
- [X] T008 [US1] Implement horizontal scrolling for long expressions in `src/components/ui/ExpressionInputPanel.tsx`.

## Phase 4: User Story 2 - Live LaTeX Preview (Priority: P2)

**Goal**: Implement dynamic LaTeX rendering of mathematical expressions as the user types

**Independent Test**: Can be tested by typing various mathematical expressions and verifying that the LaTeX preview renders correctly.

### Tests for User Story 2

- [X] T009 [P] [US2] Write unit tests for the LaTeX generation in `src/math/ExpressionEngine.test.ts`.

### Implementation for User Story 2

- [ ] T010 [US2] Integrate `react-latex` into `src/components/ui/ExpressionInputPanel.tsx`.
- [ ] T011 [US2] Update `src/store/expressionStore.ts` to include the LaTeX string.
- [ ] T012 [US2] Update `src/math/ExpressionEngine.ts` to generate the LaTeX string.

## Phase 5: User Story 3 - Ghost Vector Visualization (Priority: P3)

**Goal**: Visualize vector operations by showing "ghost" vectors when expressions use predefined vectors

**Independent Test**: Can be tested by defining a vector and then writing an expression that uses it, verifying the ghost vector appears.

### Tests for User Story 3

- [ ] T013 [P] [US3] Write unit tests for the ghost vector detection in `src/math/ExpressionEngine.test.ts`.

### Implementation for User Story 3

- [ ] T014 [US3] Update `src/math/ExpressionEngine.ts` to detect expressions that should generate a ghost vector.
- [ ] T015 [US3] Update `src/store/expressionStore.ts` to include the ghost vector data.
- [ ] T016 [US3] Update `src/components/core/ThreeCanvas.tsx` to render the `GhostVector` component.

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T017 [P] Documentation updates in `specs/001-dynamic-expression-ux/quickstart.md`.
- [ ] T018 Code cleanup and refactoring.