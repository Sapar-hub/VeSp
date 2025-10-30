import React, { useEffect, useState } from 'react';
import useStore from '../../store/mainStore';
import { InlineLatexRenderer } from '../ExpressionInput/InlineLatexRenderer';

import { theme, commonStyles } from '../../styles/theme';

const panelStyle: React.CSSProperties = {
    ...commonStyles.panel,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '300px',
    borderRadius: '0 8px 8px 0',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out',
};

const textareaStyle: React.CSSProperties = {
    ...commonStyles.input,
    flex: 1,
    fontFamily: 'monospace',
    height: '200px',
    resize: 'vertical',
    margin: '0 15px',
    width: 'calc(100% - 30px)',
};

const errorTextStyle: React.CSSProperties = {
    color: theme.colors.error,
    fontSize: '12px',
    margin: '0 15px',
};

const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    right: '-20px',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '60px',
    background: theme.colors.background,
    border: theme.visual.border,
    borderLeft: 'none',
    color: theme.colors.text,
    cursor: 'pointer',
    borderRadius: '0 4px 4px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: theme.visual.backdropFilter,
};

export const ExpressionInputPanel: React.FC = () => {
    const { expressions, expressionErrors, updateExpression, evaluateExpressions } = useStore(state => state);
    const [isFolded, setIsFolded] = useState(false);
    const [latexEnabled, setLatexEnabled] = useState(true); // Enable LaTeX rendering by default

    useEffect(() => {
        const debounce = setTimeout(() => {
            evaluateExpressions();
        }, 500);
        return () => clearTimeout(debounce);
    }, [expressions, evaluateExpressions]);

    const handleExpressionChange = (value: string) => {
        updateExpression(value);
    };

    return (
        <div style={{ ...panelStyle, transform: isFolded ? 'translateX(-100%)' : 'translateX(0)' }}>
            <button style={toggleButtonStyle} onClick={() => setIsFolded(!isFolded)}>
                {isFolded ? '>' : '<'}
            </button>
            <h3 style={{ margin: '15px', paddingBottom: '10px', borderBottom: '1px solid #444', fontSize: '16px' }}>
                Expression Script
            </h3>

            {latexEnabled ? (
                <InlineLatexRenderer
                    value={expressions}
                    onChange={handleExpressionChange}
                    debounceMs={500}
                />
            ) : (
                <textarea
                    style={textareaStyle}
                    value={expressions}
                    onChange={(e) => handleExpressionChange(e.target.value)}
                    placeholder="a = [1, 2, 0]&#10;b = a * 2"
                />
            )}

            {/* Toggle between LaTeX rendering and plain text */}
            <div style={{ margin: '15px', display: 'flex', justifyContent: 'flex-start' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="checkbox"
                        checked={latexEnabled}
                        onChange={(e) => setLatexEnabled(e.target.checked)}
                        style={{ marginRight: '5px' }}
                    />
                    Enable LaTeX rendering
                </label>
            </div>

            {Array.from(expressionErrors.entries()).map(([lineId, error]) => (
                <p key={lineId} style={errorTextStyle}>{`Error on ${lineId}: ${error}`}</p>
            ))}
        </div>
    );
};