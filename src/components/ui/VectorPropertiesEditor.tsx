import React from 'react';
import useStore, { Vector } from '../../store/mainStore';
import { MathEngine } from '../../math/MathEngine';
import { commonStyles } from '../../styles/theme';

interface VectorPropertiesEditorProps {
    selectedVector: Vector;
}

const inputStyle: React.CSSProperties = {
    ...commonStyles.input,
};

const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '500',
    color: '#aaa',
};

const vectorCoordGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
}

export const VectorPropertiesEditor: React.FC<VectorPropertiesEditorProps> = ({ selectedVector }) => {
    const { updateObject, basisVectorIds, objects } = useStore();
    
    const basisVectors = React.useMemo(() => {
        return basisVectorIds.map(id => objects.get(id)).filter((v): v is Vector => v?.type === 'vector');
    }, [basisVectorIds, objects]);

    const basisCoordinates = React.useMemo(() => {
        if (basisVectors.length < 2) return null;
        
        // Only show 2D basis coords if we have exactly 2 basis vectors, or 3D if we have 3
        const result = MathEngine.getVectorCoordinatesInBasis(selectedVector, basisVectors);
        if (result.status === 'Success' && result.payload) {
            return result.payload;
        }
        return null;
    }, [selectedVector, basisVectors]);

    const handleVectorCoordChange = (coord: 'start' | 'end', index: number, value: string) => {
        const newCoords: [number, number, number] = [...selectedVector[coord]];
        newCoords[index] = parseFloat(value) || 0;
        updateObject(selectedVector.id, { [coord]: newCoords });
    };

    return (
        <>
            <div style={vectorCoordGroupStyle}>
                <label style={{ ...labelStyle, width: '50px' }}>Start:</label>
                <input style={inputStyle} type="number" value={selectedVector.start[0]} onChange={e => handleVectorCoordChange('start', 0, e.target.value)} />
                <input style={inputStyle} type="number" value={selectedVector.start[1]} onChange={e => handleVectorCoordChange('start', 1, e.target.value)} />
                <input style={inputStyle} type="number" value={selectedVector.start[2]} onChange={e => handleVectorCoordChange('start', 2, e.target.value)} />
            </div>
            <div style={vectorCoordGroupStyle}>
                <label style={{ ...labelStyle, width: '50px' }}>End:</label>
                <input style={inputStyle} type="number" value={selectedVector.end[0]} onChange={e => handleVectorCoordChange('end', 0, e.target.value)} />
                <input style={inputStyle} type="number" value={selectedVector.end[1]} onChange={e => handleVectorCoordChange('end', 1, e.target.value)} />
                <input style={inputStyle} type="number" value={selectedVector.end[2]} onChange={e => handleVectorCoordChange('end', 2, e.target.value)} />
            </div>
            <div style={vectorCoordGroupStyle}>
                <label style={{ ...labelStyle, width: '80px' }}>Components:</label>
                <span style={{ ...inputStyle, background: '#1a1a1a' }}>{selectedVector.components.map(c => c.toFixed(2)).join(', ')}</span>
            </div>
            {basisCoordinates && (
                 <div style={vectorCoordGroupStyle}>
                    <label style={{ ...labelStyle, width: '80px', color: '#00ff00' }}>In Basis:</label>
                    <span style={{ ...inputStyle, background: '#1a1a1a', color: '#00ff00' }}>[{basisCoordinates.map(c => c.toFixed(2)).join(', ')}]</span>
                </div>
            )}
        </>
    );
};