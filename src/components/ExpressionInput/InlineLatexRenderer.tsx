import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { debounce } from '../../utils/latexRenderer';
import { LatexExpression } from './LatexExpression';
import { LaTeXExpression } from '../../types/types';

interface InlineLatexRendererProps {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  ariaLabel?: string;
  className?: string;
}

export const InlineLatexRenderer: React.FC<InlineLatexRendererProps> = ({
  value,
  onChange,
  debounceMs = 300,
  ariaLabel = 'Inline LaTeX expression input',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [expressions, setExpressions] = useState<LaTeXExpression[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Update local state when value prop changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value, inputValue]);

  // Process LaTeX expressions with debouncing
  const debouncedProcess = useRef(
    debounce((inputVal: unknown) => {
      const input = inputVal as string;
      setIsProcessing(true);
      
      try {
        // For this implementation, we'll process the entire input as one expression
        // In a more advanced implementation, we would parse and process multiple expressions
        const expressionId = `latex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        let isValid = true;
        let renderedHTML = '';
        let errorMessage: string | null = null;
        
        if (input.trim()) {
          // Check if input contains LaTeX-like syntax
          if (input.includes('\\') || input.includes('^') || input.includes('_') || 
              input.includes('{') || input.includes('}') || input.includes('(') || input.includes(')')) {
            try {
              // Use KaTeX to render
              renderedHTML = katex.renderToString(input, { 
                throwOnError: false, 
                errorColor: '#cc0000' 
              });
            } catch (error) {
              isValid = false;
              errorMessage = error instanceof Error ? error.message : 'LaTeX rendering error';
            }
          } else {
            // Not a LaTeX expression, just return as plain text
            renderedHTML = input;
          }
        }
        
        const newExpression: LaTeXExpression = {
          id: expressionId,
          rawInput: input,
          renderedHTML,
          isValid,
          errorMessage,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setExpressions([newExpression]);
      } catch (error) {
        console.error('Error processing LaTeX expression:', error);
      } finally {
        setIsProcessing(false);
      }
    }, debounceMs)
  ).current;

  useEffect(() => {
    debouncedProcess(inputValue);
  }, [inputValue, debouncedProcess]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Notify parent of change immediately
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle special keys if needed
    if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter could be used for new line in multi-line expressions
      e.preventDefault();
      e.currentTarget.value += '\n';
    }
  };

  return (
    <div className={`inline-latex-renderer ${className}`}>
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        className={`latex-input ${isProcessing ? 'processing' : ''}`}
        placeholder="Type LaTeX expressions like: v_5 = {1,1,1}..."
      />
      
      {expressions.length > 0 && (
        <div className="latex-preview">
          {expressions.map((expr) => (
            <LatexExpression
              key={expr.id}
              latexExpression={expr}
              className={expr.isValid ? 'valid-expression' : 'invalid-expression'}
            />
          ))}
        </div>
      )}
      
      {isProcessing && (
        <div className="processing-indicator" aria-label="Processing LaTeX expression">
          Rendering...
        </div>
      )}
    </div>
  );
};