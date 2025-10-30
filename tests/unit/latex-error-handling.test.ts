import { renderLatex, validateLatex, parseLatexPatterns } from '../../src/utils/latexRenderer';

describe('LaTeX Error Handling', () => {
  it('should properly handle and report invalid LaTeX syntax', () => {
    const invalidExpression = '\\undefinedcommand';
    const result = renderLatex(invalidExpression);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('error');
  });

  it('should validate and reject malformed expressions', () => {
    const malformedExpr = '\\frac{missing_brace';
    const result = validateLatex(malformedExpr);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle empty expressions gracefully', () => {
    const result = renderLatex('');
    
    expect(result.isValid).toBe(true);
    expect(result.renderedHTML).toBe('');
  });

  it('should handle expressions with syntax errors', () => {
    const exprWithErrors = '\\sqrt{4} + \\mathit{x + y';
    const result = renderLatex(exprWithErrors);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should parse expressions with errors but identify valid parts', () => {
    const mixedExpr = 'Valid: $x = y$, Invalid: $\\undefined$';
    const matches = parseLatexPatterns(mixedExpr);
    
    expect(matches.length).toBeGreaterThanOrEqual(1);
    // Even with errors in the content, we should identify the LaTeX patterns
    expect(matches.some(m => m.expression.includes('$'))).toBe(true);
  });

  it('should handle deeply nested expressions without crashing', () => {
    const nestedExpr = '\\left(\\left(\\left(x^2\\right)^2\\right)^2\\right)';
    const result = renderLatex(nestedExpr);
    
    // Should either render successfully or fail gracefully
    expect(result.isValid).not.toBeUndefined();
  });

  it('should handle extremely long expressions', () => {
    const longExpr = 'x = ' + 'a + '.repeat(100) + 'b';
    const result = renderLatex(longExpr);
    
    // Should handle long expressions gracefully
    expect(result.isValid).not.toBeUndefined();
  });
});