import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LatexExpression } from '../../src/components/ExpressionInput/LatexExpression';
import { LaTeXExpression } from '../../src/types/types';

describe('LatexExpression Accessibility', () => {
  const validExpression: LaTeXExpression = {
    id: 'test-1',
    rawInput: 'x = y + z',
    renderedHTML: '<span class="katex">x = y + z</span>',
    isValid: true,
    errorMessage: null,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const invalidExpression: LaTeXExpression = {
    id: 'test-2',
    rawInput: '\\invalid',
    renderedHTML: '',
    isValid: false,
    errorMessage: 'Invalid LaTeX command',
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('should have proper ARIA labels for valid expressions', () => {
    render(<LatexExpression latexExpression={validExpression} />);
    
    const expressionElement = screen.getByLabelText(`LaTeX expression: ${validExpression.rawInput}`);
    expect(expressionElement).toBeInTheDocument();
  });

  it('should have proper ARIA labels for invalid expressions', () => {
    render(<LatexExpression latexExpression={invalidExpression} />);
    
    const errorElement = screen.getByLabelText(`LaTeX error: ${invalidExpression.errorMessage}`);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('role', 'alert');
  });

  it('should be focusable when tabIndex is provided', () => {
    render(<LatexExpression latexExpression={validExpression} tabIndex={0} />);
    
    const expressionElement = screen.getByLabelText(`LaTeX expression: ${validExpression.rawInput}`);
    expect(expressionElement).toHaveAttribute('tabIndex', '0');
  });

  it('should display error information for screen readers', () => {
    render(<LatexExpression latexExpression={invalidExpression} />);
    
    // Check that error information is available
    const errorElement = screen.getByLabelText(`LaTeX error: ${invalidExpression.errorMessage}`);
    expect(errorElement).toBeInTheDocument();
  });
});