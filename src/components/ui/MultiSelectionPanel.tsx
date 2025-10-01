import React from 'react';
import useStore from '../../store/mainStore';

interface MultiSelectionPanelProps {
    selectedObjectIds: string[];
}

export const MultiSelectionPanel: React.FC<MultiSelectionPanelProps> = ({ selectedObjectIds }) => {
    const { objects } = useStore();
    // TODO: Implement multi-select operations
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <h3 style={{ margin: 0, paddingBottom: '10px', borderBottom: '1px solid #444', fontSize: '16px' }}>
                {selectedObjectIds.length} Objects Selected
            </h3>
            <p style={{margin: 0, color: '#888', fontSize: '12px'}}>Multi-selection operations will be available here.</p>
        </div>
    );
};