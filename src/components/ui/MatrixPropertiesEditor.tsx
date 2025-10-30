import React from 'react';
import useStore, { Matrix } from '../../store/mainStore';

interface MatrixPropertiesEditorProps {
    selectedMatrix: Matrix;
}

import { commonStyles } from '../../styles/theme';

interface MatrixPropertiesEditorProps {
    selectedMatrix: Matrix;
}

const inputStyle: React.CSSProperties = {
    ...commonStyles.input,
    textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
    ...commonStyles.button,
    width: '100%',
    marginTop: '10px',
};

export const MatrixPropertiesEditor: React.FC<MatrixPropertiesEditorProps> = ({ selectedMatrix }) => {
    const { updateObject, applySceneTransform } = useStore();

    const handleMatrixValueChange = (row: number, col: number, value: string) => {
        const newValues = selectedMatrix.values.map(r => [...r]);
        newValues[row][col] = parseFloat(value) || 0;
        updateObject(selectedMatrix.id, { values: newValues });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedMatrix.values[0].length}, 1fr)`, gap: '4px' }}>
                {selectedMatrix.values.map((row, rowIndex) => (
                    row.map((val, colIndex) => (
                        <input
                            key={`${rowIndex}-${colIndex}`}
                            style={inputStyle}
                            type="number"
                            value={val}
                            onChange={e => handleMatrixValueChange(rowIndex, colIndex, e.target.value)}
                        />
                    ))
                ))}
            </div>
            <button style={buttonStyle} onClick={() => applySceneTransform(selectedMatrix)}>
                Apply Transform
            </button>
        </div>
    );
};