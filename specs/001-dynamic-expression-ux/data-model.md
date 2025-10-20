# Data Model: Dynamic Expression UX

## Expression

**Description**: Represents a mathematical expression entered by the user.

**Fields**:

- `raw_string`: The raw string input from the user.
- `latex_string`: The LaTeX representation of the expression.
- `is_valid`: A boolean indicating if the expression is valid and can be evaluated.

## Vector

**Description**: A mathematical vector, which can be defined by the user.

**Fields**:

- `id`: A unique identifier for the vector.
- `name`: A user-defined name for the vector.
- `components`: An array of numbers representing the vector components.
- `color`: The color of the vector in the visualization.
- `visible`: A boolean indicating if the vector is visible.

## Ghost Vector

**Description**: A visual representation of a vector operation, not a permanent object on the canvas.

**Fields**:

- `start_point`: The starting point of the ghost vector.
- `end_point`: The ending point of the ghost vector.
- `style`: The visual style of the ghost vector (e.g., dashed, transparent).
