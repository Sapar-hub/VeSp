import React, { useState } from 'react';
import useStore, { SceneObjectUnion, Vector, Matrix } from '../../store/mainStore';
import { MathEngine } from '../../math/MathEngine';

interface MathOperationsPanelProps {
    selectedObject: SceneObjectUnion;
}

import { theme, commonStyles } from '../../styles/theme';

interface MathOperationsPanelProps {
    selectedObject: SceneObjectUnion;
}

const selectStyle: React.CSSProperties = {
    ...commonStyles.input,
    marginBottom: '10px',
};

const buttonStyle: React.CSSProperties = {
    ...commonStyles.button,
    width: '100%',
    marginTop: '5px',
};

const resultStyle: React.CSSProperties = {
    marginTop: '10px',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    color: theme.colors.text,
    fontSize: '12px',
    wordBreak: 'break-all',
    border: `1px solid ${theme.colors.border}`,
};

export const MathOperationsPanel: React.FC<MathOperationsPanelProps> = ({ selectedObject }) => {
    const { objects, createObject, addNotification } = useStore();
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [operationResult, setOperationResult] = useState<string | null>(null);

    const handleVectorOperation = (operation: 'add' | 'subtract' | 'dot' | 'cross') => {
        if (!selectedTargetId || selectedObject.type !== 'vector') return;

        const targetObject = objects.get(selectedTargetId);
        if (!targetObject || targetObject.type !== 'vector') return;

        let result;
        switch (operation) {
            case 'add':
                result = MathEngine.addVectors(selectedObject as Vector, targetObject as Vector);
                if (result.status === 'Success') {
                    createObject('vector', { ...result.payload, name: 'Sum' });
                    addNotification('Sum vector created', 'success');
                }
                break;
            case 'subtract':
                result = MathEngine.subtractVectors(selectedObject as Vector, targetObject as Vector);
                if (result.status === 'Success') {
                    createObject('vector', { ...result.payload, name: 'Difference' });
                    addNotification('Difference vector created', 'success');
                }
                break;
            case 'dot':
                result = MathEngine.dotProduct(selectedObject as Vector, targetObject as Vector);
                if (result.status === 'Success' && result.payload !== null) {
                    setOperationResult(`Dot Product: ${result.payload.toFixed(3)}`);
                }
                break;
            case 'cross':
                result = MathEngine.crossProduct(selectedObject as Vector, targetObject as Vector);
                if (result.status === 'Success') {
                    const crossVector = {
                        start: [0, 0, 0],
                        end: result.payload,
                        name: 'Cross Product'
                    };
                    createObject('vector', crossVector as Partial<Vector>);
                    addNotification('Cross product vector created', 'success');
                }
                break;
        }
        if (result && result.status !== 'Success') {
            addNotification(`Operation failed: ${result.status}`, 'error');
        }
    };

    const handleMatrixOperation = (operation: 'invert' | 'eigen' | 'kernel' | 'image') => {
        if (selectedObject.type !== 'matrix') return;

        let result;
        switch (operation) {
            case 'invert':
                result = MathEngine.invertMatrix(selectedObject as Matrix);
                if (result.status === 'Success') {
                    createObject('matrix', { ...result.payload, name: 'Inverse' });
                    addNotification('Inverse matrix created', 'success');
                }
                break;
            case 'eigen':
                result = MathEngine.calculateEigen(selectedObject as Matrix);
                if (result.status === 'Success' && result.payload) {
                    const { eigenvalues, eigenvectors } = result.payload;
                    setOperationResult(`Eigenvalues: [${eigenvalues.map((v: number) => v.toFixed(2)).join(', ')}]`);
                    eigenvectors.forEach((vec: number[], i: number) => {
                        createObject('vector', { start: [0, 0, 0], end: [vec[0], vec[1], vec[2] || 0], name: `EigenVec ${i + 1}` } as Partial<Vector>);
                    });
                    addNotification('Eigenvectors created', 'success');
                }
                break;
            case 'kernel':
                result = MathEngine.findKernel(selectedObject as Matrix);
                if (result.status === 'Success' && result.payload) {
                    result.payload.forEach(vec => createObject('vector', vec));
                    addNotification(`${result.payload.length} Kernel vectors created`, 'success');
                }
                break;
            case 'image':
                result = MathEngine.findImage(selectedObject as Matrix);
                if (result.status === 'Success' && result.payload) {
                    result.payload.forEach(vec => createObject('vector', vec));
                    addNotification(`${result.payload.length} Image vectors created`, 'success');
                }
                break;
        }
        if (result && result.status !== 'Success') {
            addNotification(`Operation failed: ${result.status}`, 'error');
        }
    };

    const renderVectorOperations = () => {
        const otherVectors = Array.from(objects.values()).filter(obj => obj.type === 'vector' && obj.id !== selectedObject.id);
        return (
            <>
                <select
                    style={selectStyle}
                    value={selectedTargetId || ''}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                >
                    <option value="" disabled>Select a vector...</option>
                    {otherVectors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                    <button style={buttonStyle} onClick={() => handleVectorOperation('add')}>Add</button>
                    <button style={buttonStyle} onClick={() => handleVectorOperation('subtract')}>Subtract</button>
                    <button style={buttonStyle} onClick={() => handleVectorOperation('dot')}>Dot</button>
                    <button style={buttonStyle} onClick={() => handleVectorOperation('cross')}>Cross</button>
                </div>
            </>
        );
    };

    const renderMatrixOperations = () => {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                <button style={buttonStyle} onClick={() => handleMatrixOperation('invert')}>Invert</button>
                <button style={buttonStyle} onClick={() => handleMatrixOperation('eigen')}>Eigen</button>
                <button style={buttonStyle} onClick={() => handleMatrixOperation('kernel')}>Kernel</button>
                <button style={buttonStyle} onClick={() => handleMatrixOperation('image')}>Image</button>
            </div>
        );
    };

    return (
        <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid #444' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ccc' }}>Math Operations</h4>
            {selectedObject.type === 'vector' && renderVectorOperations()}
            {selectedObject.type === 'matrix' && renderMatrixOperations()}
            {operationResult && (
                <div style={resultStyle}>
                    <p style={{ margin: 0 }}>{operationResult}</p>
                    <button onClick={() => setOperationResult(null)} style={{ ...buttonStyle, width: 'auto', padding: '4px 8px', fontSize: '10px', float: 'right' }}>Clear</button>
                </div>
            )}
        </div>
    );
};