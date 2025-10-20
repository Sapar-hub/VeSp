import React, { useEffect, useState } from 'react';
import useStore from '../../store/mainStore';

const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '300px',
    background: 'rgba(30, 30, 30, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '0 8px 8px 0',
    color: 'white',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease-in-out',
};

const textareaStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px',
    background: '#2a2a2a',
    border: '1px solid #555',
    borderRadius: '4px',
    color: 'white',
    fontFamily: 'monospace',
    height: '200px',
    resize: 'vertical',
    margin: '0 15px',
};


const errorTextStyle: React.CSSProperties = {
    color: '#c0392b',
    fontSize: '12px',
    margin: '0 15px',
};

const buttonStyle: React.CSSProperties = {
    padding: '4px 8px',
    border: 'none',
    borderRadius: '4px',
    background: '#555',
    color: 'white',
    cursor: 'pointer',
};

const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    right: '-20px',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '60px',
    background: 'rgba(30, 30, 30, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderLeft: 'none',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '0 4px 4px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

export const ExpressionInputPanel: React.FC = () => {
    const { expressions, expressionErrors, updateExpression, evaluateExpressions } = useStore(state => state);
    const [isFolded, setIsFolded] = useState(false);

    useEffect(() => {
        const debounce = setTimeout(() => {
            evaluateExpressions();
        }, 500);
        return () => clearTimeout(debounce);
    }, [expressions, evaluateExpressions]);

    return (
        <div style={{ ...panelStyle, transform: isFolded ? 'translateX(-100%)' : 'translateX(0)' }}>
            <button style={toggleButtonStyle} onClick={() => setIsFolded(!isFolded)}>
                {isFolded ? '>' : '<'}
            </button>
            <h3 style={{ margin: '15px', paddingBottom: '10px', borderBottom: '1px solid #444', fontSize: '16px' }}>
                Expression Script
            </h3>
            <textarea
                style={textareaStyle}
                value={expressions}
                onChange={(e) => updateExpression(e.target.value)}
                placeholder="a = [1, 2, 0]&#10;b = a * 2"
            />
            {Array.from(expressionErrors.entries()).map(([lineId, error]) => (
                <p key={lineId} style={errorTextStyle}>{`Error on ${lineId}: ${error}`}</p>
            ))}
        </div>
    );
};