import React from 'react';
import useStore, { SceneObjectUnion } from '../../store/mainStore';

interface ObjectPropertiesPanelProps {
    selectedObject: SceneObjectUnion;
}

import { commonStyles } from '../../styles/theme';

interface ObjectPropertiesPanelProps {
    selectedObject: SceneObjectUnion;
}

const inputStyle: React.CSSProperties = {
    ...commonStyles.input,
};

const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '500',
    color: '#aaa',
    marginBottom: '4px',
    display: 'block',
};

export const ObjectPropertiesPanel: React.FC<ObjectPropertiesPanelProps> = ({ selectedObject }) => {
    const { updateObject } = useStore();

    const handlePropertyChange = <T extends keyof SceneObjectUnion>(prop: T, value: SceneObjectUnion[T]) => {
        updateObject(selectedObject.id, { [prop]: value });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, paddingBottom: '10px', borderBottom: '1px solid #444', fontSize: '16px' }}>{selectedObject.name}</h3>
            <div>
                <label style={labelStyle}>Name</label>
                <input
                    style={inputStyle}
                    type="text"
                    value={selectedObject.name}
                    onChange={(e) => handlePropertyChange('name', e.target.value)}
                />
            </div>
            <div>
                <label style={labelStyle}>Color</label>
                <input
                    style={{ ...inputStyle, height: '30px', padding: '2px' }}
                    type="color"
                    value={selectedObject.color}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                />
            </div>
            <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        checked={selectedObject.visible}
                        onChange={(e) => handlePropertyChange('visible', e.target.checked)}
                    />
                    Visible
                </label>
            </div>
        </div>
    );
};