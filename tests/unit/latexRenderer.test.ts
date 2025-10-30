import { renderLatex, validateLatex, parseLatexPatterns, isCoreMathExpression } from '../../src/utils/latexRenderer';

describe('LaTeX Renderer Utilities', () => {
  describe('renderLatex', () => {
    it('should render valid LaTeX expressions correctly', () => {
      const result = renderLatex('x = y + z');
      expect(result.isValid).toBe(true);
      expect(result.renderedHTML).not.toBeNull();
    });

    it('should handle invalid LaTeX expressions', () => {
      const result = renderLatex('\\invalidcommand');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return empty string for empty input', () => {
      const result = renderLatex('');
      expect(result.renderedHTML).toBe('');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateLatex', () => {
    it('should validate valid LaTeX expressions', () => {
      const result = validateLatex('a^2 + b^2 = c^2');
      expect(result.isValid).toBe(true);
    });

    it('should detect invalid LaTeX expressions', () => {
      const result = validateLatex('\\undefinedcommand');
      expect(result.isValid).toBe(false);
    });
  });

  describe('parseLatexPatterns', () => {
    it('should identify LaTeX patterns in text', () => {
      const input = 'Here is an equation: $x = y$ and another: $$a^2$$';
      const matches = parseLatexPatterns(input);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toHaveProperty('expression');
      expect(matches[0]).toHaveProperty('position');
    });

    it('should return empty array for text without LaTeX', () => {
      const input = 'This is plain text without any LaTeX';
      const matches = parseLatexPatterns(input);
      expect(matches.length).toBe(0);
    });
  });

  describe('isCoreMathExpression', () => {
    it('should identify core mathematical expressions', () => {
      expect(isCoreMathExpression('v_5 = {1,1,1}')).toBe(true);
      expect(isCoreMathExpression('\\frac{a}{b}')).toBe(true);
      expect(isCoreMathExpression('\\int_0^\\infty f(x) dx')).toBe(true);
    });

    it('should reject non-core mathematical expressions', () => {
      expect(isCoreMathExpression('\\documentclass{article}')).toBe(false);
      expect(isCoreMathExpression('\\section{Title}')).toBe(false);
    });
  });
});