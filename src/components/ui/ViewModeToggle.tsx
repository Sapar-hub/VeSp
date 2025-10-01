import React from 'react';
import useStore from '../../store/mainStore';

const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: '#e0e0e0',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
    minWidth: '50px',
};

export const ViewModeToggle: React.FC = () => {
    const { viewMode, setViewMode } = useStore(state => ({
        viewMode: state.viewMode,
        setViewMode: state.setViewMode,
    }));

    const toggleMode = () => {
        setViewMode(viewMode === '2d' ? '3d' : '2d');
    };

    return (
        <button 
            style={{...buttonStyle, background: '#4a4a4a'}} 
            onClick={toggleMode} 
            title={`Switch to ${viewMode === '2d' ? '3D' : '2D'} view`}
        >
            {viewMode.toUpperCase()}
        </button>
    );
};