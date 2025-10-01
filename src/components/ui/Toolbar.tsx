import React from 'react';
import useStore from '../../store/mainStore';
import { ViewModeToggle } from './ViewModeToggle';
import { ProjectionModeToggle } from './ProjectionModeToggle';

const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '4px',
    background: 'rgba(30, 30, 30, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    display: 'flex',
    gap: '4px',
    zIndex: 100,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
};

const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: '#e0e0e0',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
};

const selectStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#2a2a2a',
    border: '1px solid #555',
    paddingRight: '28px',
    appearance: 'none',
};

const separatorStyle: React.CSSProperties = {
    width: '1px',
    height: '24px',
    background: 'rgba(255, 255, 255, 0.2)',
    margin: '0 6px',
};

export const Toolbar: React.FC = () => {
    const {
        createObject,
        setMode,
        mode,
        visualizationMode,
        setVisualizationMode
    } = useStore(state => ({
        createObject: state.createObject,
        setMode: state.setMode,
        mode: state.mode,
        visualizationMode: state.visualizationMode,
        setVisualizationMode: state.setVisualizationMode,
    }));

    const getButtonStyle = (buttonMode: typeof mode) => ({
        ...buttonStyle,
        background: mode === buttonMode ? '#007bff' : 'transparent',
        color: mode === buttonMode ? '#ffffff' : '#e0e0e0',
    });

    return (
        <div style={toolbarStyle}>
            <button style={buttonStyle} onMouseOver={e => e.currentTarget.style.background='#4a4a4a'} onMouseOut={e => e.currentTarget.style.background='transparent'} onClick={() => createObject('vector')}>
                + Vector
            </button>
            <button style={buttonStyle} onMouseOver={e => e.currentTarget.style.background='#4a4a4a'} onMouseOut={e => e.currentTarget.style.background='transparent'} onClick={() => createObject('matrix')}>
                + Matrix
            </button>
            <div style={separatorStyle}></div>
            <button style={getButtonStyle('select')} onClick={() => setMode('select')}>
                Select
            </button>
            <button style={getButtonStyle('transform')} onClick={() => setMode('transform')}>
                Transform
            </button>
            <button style={getButtonStyle('changeBasis')} onClick={() => setMode('changeBasis')}>
                Change Basis
            </button>
            <div style={separatorStyle}></div>
            <select style={selectStyle} value={visualizationMode} onChange={e => setVisualizationMode(e.target.value as any)}>
                <option value="none">Vis: None</option>
                <option value="tip-to-tail">Vis: Tip-to-Tail</option>
                <option value="parallelogram">Vis: Parallelogram</option>
            </select>
            <div style={separatorStyle}></div>
            <ProjectionModeToggle />
            <ViewModeToggle />
        </div>
    );
};