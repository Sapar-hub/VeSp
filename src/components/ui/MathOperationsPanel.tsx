import React from 'react';
import useStore, { SceneObjectUnion } from '../../store/mainStore';

interface MathOperationsPanelProps {
    selectedObject: SceneObjectUnion;
}

export const MathOperationsPanel: React.FC<MathOperationsPanelProps> = ({ selectedObject }) => {
    // TODO: Implement math operations based on object type
    return (
        <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid #444' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ccc' }}>Math Operations</h4>
            <p style={{margin: 0, color: '#888', fontSize: '12px'}}>Select another object to perform operations.</p>
        </div>
    );
};