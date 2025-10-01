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
};

export const ProjectionModeToggle: React.FC = () => {
    const { isProjectionExplorerActive, toggleProjectionExplorer } = useStore(state => ({
        isProjectionExplorerActive: state.isProjectionExplorerActive,
        toggleProjectionExplorer: state.toggleProjectionExplorer,
    }));

    const getButtonStyle = () => ({
        ...buttonStyle,
        background: isProjectionExplorerActive ? '#007bff' : 'transparent',
        color: isProjectionExplorerActive ? '#ffffff' : '#e0e0e0',
    });

    return (
        <button style={getButtonStyle()} onClick={toggleProjectionExplorer} title="Toggle Projection Explorer">
            Proj
        </button>
    );
};