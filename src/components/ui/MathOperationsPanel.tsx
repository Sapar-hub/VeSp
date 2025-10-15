import React, { useState } from 'react';
import useStore, { SceneObjectUnion, Vector, Matrix } from '../../store/mainStore';
import { MathEngine } from '../../math/MathEngine';

interface MathOperationsPanelProps {
    selectedObject: SceneObjectUnion;
}

const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px',
    background: '#2a2a2a',
    border: '1px solid #555',
    borderRadius: '4px',
    color: 'white',
    boxSizing: 'border-box',
    marginBottom: '10px',
};

const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    background: '#007bff',
    border: '1px solid #0056b3',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    marginTop: '5px',
};

const resultStyle: React.CSSProperties = {
    marginTop: '10px',
    padding: '10px',
    background: '#2a2a2a',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    wordBreak: 'break-all',
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
                if (result.status === 'Success') {
                    setOperationResult(`Dot Product: ${result.payload.toFixed(3)}`);
                }
                break;
            case 'cross':
                result = MathEngine.crossProduct(selectedObject as Vector, targetObject as Vector);
                if (result.status === 'Success') {
                    const crossVector = {
                        start: [0,0,0],
                        end: result.payload,
                        name: 'Cross Product'
                    };
                    createObject('vector', crossVector as any);
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
                if (result.status === 'Success') {
                    const { eigenvalues, eigenvectors } = result.payload;
                    setOperationResult(`Eigenvalues: [${eigenvalues.map(v => v.toFixed(2)).join(', ')}]`);
                    eigenvectors.forEach((vec, i) => {
                        createObject('vector', { start: [0,0,0], end: [vec[0], vec[1], vec[2] || 0], name: `EigenVec ${i+1}` });
                    });
                    addNotification('Eigenvectors created', 'success');
                }
                break;
            case 'kernel':
                result = MathEngine.findKernel(selectedObject as Matrix);
                if (result.status === 'Success') {
                    result.payload.forEach(vec => createObject('vector', vec));
                    addNotification(`${result.payload.length} Kernel vectors created`, 'success');
                }
                break;
            case 'image':
                result = MathEngine.findImage(selectedObject as Matrix);
                if (result.status === 'Success') {
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
                    <p style={{margin: 0}}>{operationResult}</p>
                    <button onClick={() => setOperationResult(null)} style={{...buttonStyle, width: 'auto', padding: '4px 8px', fontSize: '10px', float: 'right'}}>Clear</button>
                </div>
            )}
        </div>
    );
};