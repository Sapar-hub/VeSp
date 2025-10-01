import React, { useState, useEffect } from 'react';
import useStore from '../../store/mainStore';

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

export const BasisPanel: React.FC = () => {
    const { mode, multiSelection, setBasis, setMode } = useStore();
    const [selectedVectors, setSelectedVectors] = useState<string[]>([]);

    useEffect(() => {
        if (mode === 'changeBasis') {
            setSelectedVectors(multiSelection);
        }
    }, [multiSelection, mode]);

    if (mode !== 'changeBasis') {
        return null;
    }

    const handleSetBasis = () => {
        if (selectedVectors.length >= 2 && selectedVectors.length <= 3) {
            setBasis(selectedVectors);
            setMode('select');
        }
    };

    return (
        <div style={panelStyle}>
            <h4 style={{ margin: '0 0 10px 0' }}>Change Basis Mode</h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ccc' }}>
                Select 2 or 3 vectors from the scene to form a new basis.
            </p>
            <div style={{ background: '#2a2a2a', padding: '8px', borderRadius: '4px', minHeight: '24px' }}>
                Selected: {selectedVectors.join(', ') || 'None'}
            </div>
            <button 
                style={{...buttonStyle, background: (selectedVectors.length < 2 || selectedVectors.length > 3) ? '#6c757d' : '#007bff'}}
                onClick={handleSetBasis}
                disabled={selectedVectors.length < 2 || selectedVectors.length > 3}
            >
                Set as New Basis
            </button>
        </div>
    );
};