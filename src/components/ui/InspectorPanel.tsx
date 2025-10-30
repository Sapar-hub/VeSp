import React from 'react';
import useStore from '../../store/mainStore';
import { ObjectPropertiesPanel } from './ObjectPropertiesPanel';
import { VectorPropertiesEditor } from './VectorPropertiesEditor';
import { MatrixPropertiesEditor } from './MatrixPropertiesEditor';
import { MathOperationsPanel } from './MathOperationsPanel';
import { MultiSelectionPanel } from './MultiSelectionPanel';
import type { Vector, Matrix } from '../../store/mainStore';

import { theme, commonStyles } from '../../styles/theme';

const panelStyle: React.CSSProperties = {
    ...commonStyles.panel,
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '280px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
};

const buttonStyle: React.CSSProperties = {
    ...commonStyles.button,
    width: '100%',
    background: theme.colors.error,
    marginTop: '10px',
};

export const InspectorPanel: React.FC = () => {
    const {
        selectedObjectId,
        multiSelection,
        selectedObject,
        deleteObject,
        clearMultiSelection
    } = useStore(state => ({
        selectedObjectId: state.selectedObjectId,
        multiSelection: state.multiSelection,
        selectedObject: state.selectedObjectId ? state.objects.get(state.selectedObjectId) : null,
        deleteObject: state.deleteObject,
        clearMultiSelection: state.clearMultiSelection,
    }));

    if (multiSelection.length > 0) {
        return (
            <div style={panelStyle}>
                <MultiSelectionPanel selectedObjectIds={multiSelection} />
                <button style={{ ...buttonStyle, background: '#6c757d' }} onClick={clearMultiSelection}>
                    Clear Selection
                </button>
            </div>
        );
    }

    if (!selectedObject || !selectedObjectId) {
        return null;
    }

    return (
        <div style={panelStyle}>
            <ObjectPropertiesPanel selectedObject={selectedObject} />

            <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid #444' }}>
                {selectedObject.type === 'vector' && <VectorPropertiesEditor selectedVector={selectedObject as Vector} />}
                {selectedObject.type === 'matrix' && <MatrixPropertiesEditor selectedMatrix={selectedObject as Matrix} />}
            </div>

            <MathOperationsPanel selectedObject={selectedObject} />

            <button style={buttonStyle} onClick={() => deleteObject(selectedObjectId)}>
                Delete Object
            </button>
        </div>
    );
};