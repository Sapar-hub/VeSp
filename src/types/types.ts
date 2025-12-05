// Type definitions for scene objects and LaTeX expression types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface Scene {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, unknown>; // Stores the entire frontend state
}

export interface LaTeXExpression {
  id: string;                    // Unique identifier for the expression
  rawInput: string;             // The original user input containing LaTeX syntax
  renderedHTML: string;         // The processed HTML output from KaTeX
  isValid: boolean;             // Whether the LaTeX syntax is valid
  errorMessage: string | null;  // Error message if syntax is invalid
  position: number;             // Position within the expression input (for inline rendering)
  createdAt: Date;              // Timestamp of creation
  updatedAt: Date;              // Timestamp of last update
}

export interface InlineLatexRendererState {
  expressions: LaTeXExpression[]; // Array of LaTeX expressions in the input
  inputValue: string;            // Current value of the input field
  errorPositions: number[];      // Array of positions where errors occur
  isProcessing: boolean;         // Whether the input is currently being processed
  lastRenderTime: number;        // Timestamp of last rendering operation
}

// Extending the existing types with LaTeX-related properties
export interface ExpressionInputPanelState {
  // ... existing properties ...
  latexRenderingEnabled?: boolean;     // Whether LaTeX rendering is active
  latexLibrary?: 'katex' | null;       // The rendering library in use
  latexOptions?: Record<string, unknown>;  // Configuration options for the LaTeX renderer
  errorDisplayMode?: 'inline' | 'tooltip' | 'status'; // How to display errors
}

// Additional scene object types for the Vector Space application
export type SceneObjectUnion = 
  | VectorObject 
  | MatrixObject 
  | PlaneObject
  | PointObject
  | LineObject;

export interface VectorObject {
  id: string;
  type: 'vector';
  components: number[];
  color: string;
  visible: boolean;
  position: [number, number, number];
}

export interface MatrixObject {
  id: string;
  type: 'matrix';
  elements: number[][];
  dimensions: [number, number];
  color: string;
  visible: boolean;
}

export interface PlaneObject {
  id: string;
  type: 'plane';
  normal: [number, number, number];
  distance: number;
  color: string;
  visible: boolean;
}

export interface PointObject {
  id: string;
  type: 'point';
  coordinates: [number, number, number];
  color: string;
  visible: boolean;
}

export interface LineObject {
  id: string;
  type: 'line';
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  visible: boolean;
}