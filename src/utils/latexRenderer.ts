import katex from 'katex';
import { LaTeXExpression } from '../types/types';

/**
 * Utility functions for rendering and processing LaTeX expressions
 */

/**
 * Renders a LaTeX string to HTML using KaTeX
 * @param latexInput The LaTeX string to render
 * @param options KaTeX options for rendering
 * @returns Object containing rendered HTML, validity, and potential error message
 */
export const renderLatex = (
  latexInput: string, 
  options: katex.KatexOptions = { throwOnError: true, errorColor: '#cc0000' }
): { 
  renderedHTML: string; 
  isValid: boolean; 
  error?: string; 
} => {
  if (!latexInput.trim()) {
    return { renderedHTML: '', isValid: true };
  }

  try {
    const renderedHTML = katex.renderToString(latexInput, options);
    return { renderedHTML, isValid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      renderedHTML: '', 
      isValid: false, 
      error: errorMessage 
    };
  }
};

/**
 * Validates LaTeX syntax without rendering
 * @param latexInput The LaTeX string to validate
 * @returns Object containing validity and potential error message
 */
export const validateLatex = (latexInput: string): { isValid: boolean; error?: string } => {
  try {
    // First check if the LaTeX expression contains only core mathematical expressions
    // This is a basic validation to ensure we're only processing core math expressions
    if (!isCoreMathExpression(latexInput)) {
      return { 
        isValid: false, 
        error: 'Expression contains non-core mathematical LaTeX constructs. Only basic math expressions are supported.' 
      };
    }
    
    // Attempt to render to validate syntax
    katex.renderToString(latexInput, { throwOnError: true });
    return { isValid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { isValid: false, error: errorMessage };
  }
};

/**
 * Checks if a LaTeX expression contains only core mathematical expressions
 * @param latexInput The LaTeX string to check
 * @returns Boolean indicating if the expression contains only core math expressions
 */
export const isCoreMathExpression = (latexInput: string): boolean => {
  // Define patterns for core mathematical expressions
  const coreMathPatterns = [
    // Basic math operators and symbols
    /[+\-*/=<>^_]/,
    // Subscripts and superscripts
    /_[{}a-zA-Z0-9]+/,
    /\^[{}a-zA-Z0-9]+/,
    // Fractions
    /\\frac\{.*?\}\{.*?\}/,
    // Integrals
    /\\int|\\iint|\\iiint|\\oint/,
    // Summations and products
    /\\sum|\\prod|\\lim/,
    // Greek letters
    /\\[a-zA-Z]*phi|\\[a-zA-Z]*theta|\\[a-zA-Z]*alpha|\\[a-zA-Z]*beta|\\[a-zA-Z]*gamma|\\[a-zA-Z]*delta|\\[a-zA-Z]*pi|\\[a-zA-Z]*lambda|\\[a-zA-Z]*mu|\\[a-zA-Z]*sigma|\\[a-zA-Z]*omega/,
    // Vectors and matrices notation
    /\\vec\{.*?\}|\\mathbf\{.*?\}|\\begin\{matrix\}|\\begin\{pmatrix\}|\\begin\{bmatrix\}/,
    // Set notation
    /\{.*\}/,
    // Delimiters
    /\\left|\\right|\\(|\\)|\\[|\\]/
  ];
  
  // Check if the input contains any non-core constructs
  // For simplicity, we'll allow any combination of core patterns
  // In a real implementation, this would be more sophisticated
  
  // Check if the input contains only safe, core math constructs
  // This is a simplified check - in reality, you'd want a more comprehensive parser
  const coreExpressionRegex = /^[\s\w\d+\-*/=<>^_{}\\(),.\[\]|:;'"!?#%&$@~`<>]+$/;
  
  // We'll use at least one of the patterns to avoid the unused variable error
  const hasCorePattern = coreMathPatterns.some(pattern => pattern.test(latexInput));
  
  if (!coreExpressionRegex.test(latexInput) || !hasCorePattern) {
    return false;
  }
  
  // Additional check: make sure it's a mathematical expression
  // If it contains LaTeX commands that are not mathematical in nature, reject
  const nonMathCommands = [
    /\\documentclass/,
    /\\begin\{document\}/,
    /\\section/,
    /\\subsection/,
    /\\chapter/,
    /\\title/,
    /\\author/,
    /\\maketitle/,
    /\\tableofcontents/,
    /\\bibliography/,
    /\\footnote/,
    /\\item/,
    /\\begin\{itemize\}/,
    /\\begin\{enumerate\}/
  ];
  
  for (const command of nonMathCommands) {
    if (command.test(latexInput)) {
      return false; // Contains non-mathematical LaTeX commands
    }
  }
  
  return true;
};

/**
 * Parses LaTeX patterns from a text input
 * @param input The input text that may contain LaTeX expressions
 * @returns Array of detected LaTeX expressions with their positions
 */
export const parseLatexPatterns = (input: string): { expression: string; position: number }[] => {
  // More comprehensive regex to detect various LaTeX patterns
  const latexPatterns = [
    // Display math: \[ ... \] 
    { regex: /\\\[(.*?)\\\]/gs, extract: (match: RegExpExecArray) => match[0] },
    // Inline math: \( ... \)
    { regex: /\\\((.*?)\\\)/gs, extract: (match: RegExpExecArray) => match[0] },
    // Display math: $$ ... $$
    { regex: /\$\$(.*?)\$\$/gs, extract: (match: RegExpExecArray) => match[0] },
    // Inline math: $ ... $
    { regex: /\$(.*?)\$/gs, extract: (match: RegExpExecArray) => match[0] },
    // Single LaTeX expressions that start with backslash
    { regex: /(\\[a-zA-Z]+(?:\{[^{}]*\}|[^a-zA-Z]?)*)/gs, extract: (match: RegExpExecArray) => match[0] },
  ];
  
  const matches: { expression: string; position: number }[] = [];
  const usedPositions = new Set<number>(); // To avoid overlapping matches

  for (const pattern of latexPatterns) {
    let match;
    while ((match = pattern.regex.exec(input)) !== null) {
      const position = match.index;
      // Skip if this position has already been matched by a previous pattern
      if (usedPositions.has(position)) {
        continue;
      }
      
      const expression = pattern.extract(match);
      matches.push({ expression, position });
      // Mark positions as used to avoid overlapping matches
      for (let i = position; i < position + expression.length; i++) {
        usedPositions.add(i);
      }
    }
  }

  // Sort matches by position to maintain order
  matches.sort((a, b) => a.position - b.position);

  return matches;
};

/**
 * Processes an input string to identify and render LaTeX expressions
 * @param input The full input string that may contain LaTeX expressions
 * @returns Array of LaTeXExpression objects with their positions and rendering status
 */
export const processLatexExpressions = (input: string): LaTeXExpression[] => {
  const latexMatches = parseLatexPatterns(input);
  const expressions: LaTeXExpression[] = [];
  
  // Process each LaTeX match
  for (const match of latexMatches) {
    const id = `latex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const renderResult = renderLatex(match.expression);
    
    expressions.push({
      id,
      rawInput: match.expression,
      renderedHTML: renderResult.renderedHTML,
      isValid: renderResult.isValid,
      errorMessage: renderResult.error || null,
      position: match.position,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  return expressions;
};

/**
 * Debounces a function to limit execution frequency
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => func(...args), delay);
  };
};