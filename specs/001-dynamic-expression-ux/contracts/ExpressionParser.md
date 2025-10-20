# Contract: ExpressionParser API

**Feature**: Dynamic Expression UX (001-dynamic-expression-ux)  
**Contract Version**: 1.0.0  
**Date**: 2025-10-30

## Overview
This contract defines the API for the ExpressionParser utility that will handle parsing mathematical expressions containing vector operations.

## API Definition

### Interface: ExpressionParser

#### Method: parseExpression
Parses a mathematical expression and identifies vector operations that should result in ghost vectors.

**Input**: 
- `expression: string` - The mathematical expression to parse (e.g., "v1 + [1,2,3]")
- `vectorDefinitions: VectorDefinition[]` - Available vector definitions that can be referenced in the expression

**Output**: 
- `result: ParseResult` - The parsed result with information about ghost vectors needed

**Type Definitions**:
```typescript
interface VectorDefinition {
  id: string;
  name: string;
  value: [number, number, number];
}

interface ParseResult {
  isValid: boolean;
  error?: string;
  ghostVectorOperations: GhostVectorOperation[];
  requiresVisualization: boolean;
}

interface GhostVectorOperation {
  operation: string;           // The operation that creates the ghost vector (e.g., "v1 + [1,2,3]")
  baseVectorName: string;      // Name of the base vector (e.g., "v1")
  baseVectorValue: [number, number, number]; // Value of the base vector
  operand: string | [number, number, number]; // The operand (another vector name or coordinates)
  operandValue: [number, number, number];      // The resolved value of the operand
  resultingVector: [number, number, number];   // The resulting vector from the operation
}
```

#### Method: validateExpression
Validates that an expression is syntactically correct.

**Input**: 
- `expression: string` - The mathematical expression to validate

**Output**: 
- `result: ValidationResult`

**Type Definitions**:
```typescript
interface ValidationResult {
  isValid: boolean;
  error?: string;
  expressionType: 'vector' | 'scalar' | 'matrix' | 'unknown';
}
```

#### Method: convertToLatex
Converts a mathematical expression to LaTeX format for display.

**Input**: 
- `expression: string` - The mathematical expression to convert

**Output**: 
- `latex: string` - The LaTeX representation of the expression

## Behavior Contracts

### Contract 1: Vector Reference Detection
**Given**: An expression containing references to defined vectors (e.g., "v1 + v2")
**When**: parseExpression is called with matching VectorDefinition objects
**Then**: The returned ParseResult should include ghostVectorOperations for applicable vector operations

### Contract 2: Invalid Expression Handling
**Given**: An expression with invalid syntax (e.g., "v1 + [1,2")
**When**: parseExpression or validateExpression is called
**Then**: The returned result should have isValid=false and an appropriate error message

### Contract 3: LaTeX Conversion
**Given**: A valid mathematical expression (e.g., "v1 + [1,2,3]")
**When**: convertToLatex is called
**Then**: A valid LaTeX string should be returned (e.g., "\\vec{v_1} + \\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}")

### Contract 4: Performance Requirement
**Given**: An expression of reasonable length (< 200 characters)
**When**: Any parsing method is called
**Then**: The method should return within 50ms

## Error Handling

### Expected Error Cases
1. `InvalidExpressionError`: Expression syntax is invalid
2. `UndefinedVectorError`: Expression references a vector that is not defined
3. `OperationNotSupportedError`: Expression contains an unsupported operation

### Error Format
All errors should follow this format:
```typescript
interface ParseError {
  type: string;      // Error type identifier
  message: string;   // Human-readable error message
  expression: string; // The expression that caused the error
  position?: number; // Position in expression where error occurred (if applicable)
}
```

## Backward Compatibility
- This is a new API with no backward compatibility concerns
- Future versions should maintain the same interface for parseExpression and validateExpression

## Testing Requirements
1. Unit test: Parse valid vector operations correctly
2. Unit test: Handle invalid expressions gracefully
3. Unit test: Convert expressions to LaTeX correctly
4. Performance test: Parsing completes within 50ms
5. Integration test: Works with real vector definitions from store