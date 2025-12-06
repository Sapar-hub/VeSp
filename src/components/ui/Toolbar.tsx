import React, { useState } from 'react';
import useStore from '../../store/mainStore';
import { ViewModeToggle } from './ViewModeToggle';
import { ProjectionModeToggle } from './ProjectionModeToggle';
import { useAuth } from '../auth/AuthContext';
import { LoginRegisterModal } from '../auth/LoginRegisterModal';
import { SceneManagementModal } from './SceneManagementModal';

import { theme, commonStyles } from '../../styles/theme';

const toolbarStyle: React.CSSProperties = {
    ...commonStyles.panel,
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '4px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
};

const authControlsStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
};

const buttonStyle: React.CSSProperties = {
    padding: theme.spacing.buttonPadding,
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: theme.colors.text,
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
};

const selectStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#2a2a2a',
    border: `1px solid ${theme.colors.secondary}`,
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
        setMode,
        mode,
        visualizationMode,
        setVisualizationMode,
        isDualSpaceVisible,
        toggleDualSpace
    } = useStore(state => ({
        setMode: state.setMode,
        mode: state.mode,
        visualizationMode: state.visualizationMode,
        setVisualizationMode: state.setVisualizationMode,
        isDualSpaceVisible: state.isDualSpaceVisible,
        toggleDualSpace: state.toggleDualSpace,
    }));

    const { isAuthenticated, user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);

    const getButtonStyle = (buttonMode: typeof mode) => ({
        ...buttonStyle,
        background: mode === buttonMode ? '#007bff' : 'transparent',
        color: mode === buttonMode ? '#ffffff' : '#e0e0e0',
    });

    const getDualSpaceButtonStyle = () => ({
        ...buttonStyle,
        background: isDualSpaceVisible ? '#007bff' : 'transparent',
        color: isDualSpaceVisible ? '#ffffff' : '#e0e0e0',
    });

    return (
        <>
            <div style={toolbarStyle}>
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
                <select style={selectStyle} value={visualizationMode} onChange={e => setVisualizationMode(e.target.value as 'none' | 'tip-to-tail' | 'parallelogram')}>
                    <option value="none">Vis: None</option>
                    <option value="tip-to-tail">Vis: Tip-to-Tail</option>
                    <option value="parallelogram">Vis: Parallelogram</option>
                </select>
                <div style={separatorStyle}></div>
                <ProjectionModeToggle />
                <button style={getDualSpaceButtonStyle()} onClick={toggleDualSpace} title="Show Dual Space (Covectors)">
                    Dual Space
                </button>
                <ViewModeToggle />
                {isAuthenticated && (
                    <>
                        <div style={separatorStyle}></div>
                        <button style={buttonStyle} onClick={() => setIsSceneModalOpen(true)}>Save / Load Scene</button>
                    </>
                )}
            </div>
            <div style={authControlsStyle}>
                {isAuthenticated ? (
                    <>
                        <span style={{ color: theme.colors.text }}>Hello, {user?.email}</span>
                        <button style={buttonStyle} onClick={logout}>Logout</button>
                    </>
                ) : (
                    <button style={buttonStyle} onClick={() => setIsAuthModalOpen(true)}>Login / Register</button>
                )}
            </div>
            <LoginRegisterModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <SceneManagementModal isOpen={isSceneModalOpen} onClose={() => setIsSceneModalOpen(false)} />
        </>
    );
};