import { renderLatex } from '../../src/utils/latexRenderer';

describe('LaTeX Rendering Performance', () => {
  const simpleExpression = 'x = y + z';
  const complexExpression = '\\int_0^{\\infty} \\frac{\\sin(x)}{x} dx = \\frac{\\pi}{2}';
  const veryComplexExpression = '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}';

  // Performance test for simple expressions
  test('simple expression rendering should complete under 100ms', () => {
    const startTime = performance.now();
    const result = renderLatex(simpleExpression);
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(100);
    expect(result.isValid).toBe(true);
  });

  // Performance test for complex expressions
  test('complex expression rendering should complete under 100ms', () => {
    const startTime = performance.now();
    const result = renderLatex(complexExpression);
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(100);
    expect(result.isValid).toBe(true);
  });

  // Performance test for very complex expressions
  test('very complex expression rendering should complete under 100ms', () => {
    const startTime = performance.now();
    const result = renderLatex(veryComplexExpression);
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(100);
    expect(result.isValid).toBe(true);
  });

  // Test batch rendering performance
  test('multiple expressions should render within performance bounds', () => {
    const startTime = performance.now();
    
    const expressions = [
      simpleExpression,
      complexExpression,
      veryComplexExpression,
      'a^2 + b^2 = c^2',
      '\\lim_{x \\to \\infty} f(x) = L'
    ];
    
    const results = expressions.map(expr => renderLatex(expr));
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(500); // 500ms for 5 expressions
    expect(results.every(r => r.isValid)).toBe(true);
  });
});