import React, { useState, useEffect } from 'react';
import useStore from '../../store/mainStore';
import { MathEngine } from '../../math/MathEngine';

const panelStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '15px',
    background: 'rgba(30, 30, 30, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    color: 'white',
    zIndex: 100,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    width: '350px',
    textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    background: '#007bff',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '10px',
};

const vectorItemStyle: React.CSSProperties = {
    padding: '4px',
    margin: '2px',
    background: '#444',
    borderRadius: '4px',
    fontSize: '12px',
    textAlign: 'left'
};

export const BasisPanel: React.FC = () => {
    const { mode, multiSelection, setBasis, setMode, objects, addNotification } = useStore();
    const [selectedVectors, setSelectedVectors] = useState<string[]>([]);
    const [validityMessage, setValidityMessage] = useState('');

    useEffect(() => {
        if (mode === 'changeBasis') {
            setSelectedVectors(multiSelection);
        }
    }, [multiSelection, mode]);

    // Check validity of selected vectors as basis
    useEffect(() => {
        if (selectedVectors.length > 0) {
            const vectors = selectedVectors
                .map(id => objects.get(id))
                .filter(obj => obj?.type === 'vector')
                .map(obj => obj) as any[];

            if (vectors.length >= 2 && vectors.length <= 3) {
                const linearDependent = MathEngine.checkLinearDependency(vectors);
                if (linearDependent) {
                    setValidityMessage('Vectors are linearly dependent. Select linearly independent vectors for a valid basis.');
                } else {
                    setValidityMessage('Valid basis selection!');
                }
            } else {
                setValidityMessage('');
            }
        } else {
            setValidityMessage('');
        }
    }, [selectedVectors, objects]);

    if (mode !== 'changeBasis') {
        return null;
    }

    const handleSetBasis = () => {
        if (selectedVectors.length >= 2 && selectedVectors.length <= 3) {
            // Double-check linear independence before setting
            const vectors = selectedVectors
                .map(id => objects.get(id))
                .filter(obj => obj?.type === 'vector')
                .map(obj => obj) as any[];
            
            if (vectors.length > 0) {
                const linearDependent = MathEngine.checkLinearDependency(vectors);
                if (linearDependent) {
                    addNotification('Selected vectors are linearly dependent. Please select linearly independent vectors.', 'error');
                } else {
                    setBasis(selectedVectors);
                    addNotification(`New basis set with ${selectedVectors.length} vectors`, 'success');
                    setMode('select');
                }
            }
        }
    };

    const handleCancel = () => {
        setMode('select');
    };

    return (
        <div style={panelStyle}>
            <h4 style={{ margin: '0 0 10px 0' }}>Change Basis Mode</h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ccc' }}>
                Select 2 or 3 vectors from the scene to form a new basis.
            </p>
            
            <div style={{ background: '#2a2a2a', padding: '8px', borderRadius: '4px', minHeight: '60px', maxHeight: '120px', overflowY: 'auto' }}>
                {selectedVectors.length === 0 ? (
                    <div style={{ color: '#888', fontStyle: 'italic' }}>No vectors selected</div>
                ) : (
                    selectedVectors.map(id => {
                        const obj = objects.get(id);
                        return obj ? (
                            <div key={id} style={vectorItemStyle}>
                                {obj.name} ({id.substring(0, 6)}...)
                            </div>
                        ) : null;
                    })
                )}
            </div>
            
            {validityMessage && (
                <div 
                    style={{ 
                        margin: '8px 0', 
                        padding: '4px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: validityMessage.includes('linearly dependent') ? '#5a2a2a' : '#2a5a2a'
                    }}
                >
                    {validityMessage}
                </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <button 
                    style={{...buttonStyle, background: (selectedVectors.length < 2 || selectedVectors.length > 3 || validityMessage.includes('linearly dependent')) ? '#6c757d' : '#28a745'}}
                    onClick={handleSetBasis}
                    disabled={selectedVectors.length < 2 || selectedVectors.length > 3 || validityMessage.includes('linearly dependent')}
                >
                    Set as New Basis
                </button>
                <button 
                    style={{...buttonStyle, background: '#dc3545'}}
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};