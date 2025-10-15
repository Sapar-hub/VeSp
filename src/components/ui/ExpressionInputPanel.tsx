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

const expressionRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 15px',
};

const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
};

const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px',
    background: '#2a2a2a',
    border: '1px solid #555',
    borderRadius: '4px',
    color: 'white',
    fontFamily: 'monospace',
};

const errorInputStyle: React.CSSProperties = {
    ...inputStyle,
    border: '1px solid #c0392b',
};

const errorTextStyle: React.CSSProperties = {
    color: '#c0392b',
    fontSize: '12px',
    margin: 0,
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

const objectListStyle: React.CSSProperties = {
    padding: '0 15px',
    flex: 1,
    overflowY: 'auto',
};

const objectItemStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '4px 0',
    borderBottom: '1px solid #444',
};

export const ExpressionInputPanel: React.FC = () => {
    const { expressions, expressionErrors, objects, addExpression, updateExpression, removeExpression, evaluateExpressions } = useStore();
    const [isFolded, setIsFolded] = useState(false);

    useEffect(() => {
        const debounce = setTimeout(() => {
            evaluateExpressions();
        }, 500);
        return () => clearTimeout(debounce);
    }, [expressions, evaluateExpressions]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string, index: number) => {
        if (e.key === 'Enter' && index === expressions.length - 1) {
            addExpression();
        }
    };

    return (
        <div style={{ ...panelStyle, transform: isFolded ? 'translateX(-100%)' : 'translateX(0)' }}>
            <button style={toggleButtonStyle} onClick={() => setIsFolded(!isFolded)}>
                {isFolded ? '>' : '<'}
            </button>
            <h3 style={{ margin: '15px', paddingBottom: '10px', borderBottom: '1px solid #444', fontSize: '16px' }}>
                Expressions
            </h3>
            {expressions.map((expr, index) => {
                const error = expressionErrors.get(expr.id);
                return (
                    <div key={expr.id} style={expressionRowStyle}>
                        <div style={inputRowStyle}>
                            <input
                                type="text"
                                style={error ? errorInputStyle : inputStyle}
                                value={expr.value}
                                onChange={(e) => updateExpression(expr.id, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, expr.id, index)}
                                placeholder={`Expression ${index + 1}`}
                            />
                            <button style={{...buttonStyle, background: '#c0392b'}} onClick={() => removeExpression(expr.id)}>
                                X
                            </button>
                        </div>
                        {error && <p style={errorTextStyle}>{error}</p>}
                    </div>
                );
            })}
            <h3 style={{ margin: '15px', paddingBottom: '10px', borderBottom: '1px solid #444', fontSize: '16px' }}>
                Objects
            </h3>
            <div style={objectListStyle}>
                {Array.from(objects.values()).map(obj => (
                    <div key={obj.id} style={objectItemStyle}>
                        {obj.name} = {JSON.stringify(obj.type === 'vector' ? (obj as any).components : (obj as any).values)}
                    </div>
                ))}
            </div>
        </div>
    );
};