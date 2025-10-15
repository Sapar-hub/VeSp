import React from 'react';
import useStore from '../../store/mainStore';

interface MultiSelectionPanelProps {
    selectedObjectIds: string[];
}

const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    background: '#555',
    border: '1px solid #777',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    marginTop: '5px',
};

const listStyle: React.CSSProperties = {
    maxHeight: '150px',
    overflowY: 'auto',
    background: '#2a2a2a',
    borderRadius: '4px',
    padding: '5px',
    border: '1px solid #555',
};

const listItemStyle: React.CSSProperties = {
    padding: '4px 8px',
    borderBottom: '1px solid #444',
    fontSize: '12px',
};

export const MultiSelectionPanel: React.FC<MultiSelectionPanelProps> = ({ selectedObjectIds }) => {
    const { objects, deleteObject, updateObject } = useStore();

    const handleBatchDelete = () => {
        selectedObjectIds.forEach(id => deleteObject(id));
    };

    const handleBatchUpdate = (updates: Partial<{ visible: boolean }>) => {
        selectedObjectIds.forEach(id => {
            updateObject(id, updates);
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, paddingBottom: '10px', borderBottom: '1px solid #444', fontSize: '16px' }}>
                {selectedObjectIds.length} Objects Selected
            </h3>

            <div style={listStyle}>
                {selectedObjectIds.map(id => {
                    const obj = objects.get(id);
                    return <div key={id} style={listItemStyle}>{obj?.name || 'Unnamed Object'}</div>;
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                <button style={{...buttonStyle, background: '#27ae60'}} onClick={() => handleBatchUpdate({ visible: true })}>Show All</button>
                <button style={{...buttonStyle, background: '#f39c12'}} onClick={() => handleBatchUpdate({ visible: false })}>Hide All</button>
            </div>
            <button style={{...buttonStyle, background: '#c0392b'}} onClick={handleBatchDelete}>
                Delete Selected
            </button>
        </div>
    );
};