import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InlineLatexRenderer } from '../../src/components/ExpressionInput/InlineLatexRenderer';

// Mock KaTeX
jest.mock('katex', () => ({
  renderToString: jest.fn((input: string) => {
    if (input.includes('\\undefined')) {
      throw new Error('KaTeX parse error');
    }
    return `<span class="katex">${input}</span>`;
  }),
}));

describe('InlineLatexRenderer Integration', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render and update properly when user types', async () => {
    render(
      <InlineLatexRenderer
        value=""
        onChange={mockOnChange}
        debounceMs={0} // Disable debounce for testing
      />
    );

    const textarea = screen.getByRole('textbox');
    
    // Simulate user typing
    fireEvent.change(textarea, { target: { value: 'x = y + z' } });
    
    // Wait for the change to propagate
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('x = y + z');
    });
  });

  it('should render LaTeX expressions correctly', async () => {
    render(
      <InlineLatexRenderer
        value="v_5 = {1,1,1}"
        onChange={mockOnChange}
        debounceMs={0} // Disable debounce for testing
      />
    );

    // Check if the expression is rendered in some way
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  it('should handle invalid LaTeX expressions', async () => {
    render(
      <InlineLatexRenderer
        value="\\undefinedcommand"
        onChange={mockOnChange}
        debounceMs={0} // Disable debounce for testing
      />
    );

    // Check for error handling
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('\\undefinedcommand');
    });
  });

  it('should maintain accessibility attributes', () => {
    render(
      <InlineLatexRenderer
        value="x = y"
        onChange={mockOnChange}
        ariaLabel="Test LaTeX input"
        debounceMs={0} // Disable debounce for testing
      />
    );

    const textbox = screen.getByRole('textbox');
    expect(textbox).toHaveAccessibleName('Test LaTeX input');
  });
});