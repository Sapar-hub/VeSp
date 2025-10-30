import React from 'react';
import { LaTeXExpression } from '../../types/types';

interface LatexExpressionProps {
  latexExpression: LaTeXExpression;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
}

export const LatexExpression: React.FC<LatexExpressionProps> = ({
  latexExpression,
  className = '',
  onClick,
  tabIndex
}) => {
  const { renderedHTML, isValid, errorMessage } = latexExpression;

  if (!isValid && errorMessage) {
    return (
      <span
        className={`katex-error ${className}`}
        onClick={onClick}
        tabIndex={tabIndex}
        aria-label={`LaTeX error: ${errorMessage}`}
        role="alert"
      >
        {latexExpression.rawInput}
      </span>
    );
  }

  return (
    <span
      className={`katex-container ${className}`}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={`LaTeX expression: ${latexExpression.rawInput}`}
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
    />
  );
};