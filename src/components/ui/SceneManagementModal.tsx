// src/components/ui/SceneManagementModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../../io/api';
import { Scene } from '../../types/types';
import { theme } from '../../styles/theme';
import useStore from '../../store/mainStore';

interface SceneManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: theme.colors.background,
  padding: '20px',
  borderRadius: '8px',
  width: '500px',
  maxHeight: '80vh',
  overflowY: 'auto',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  position: 'relative',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '4px',
  backgroundColor: theme.colors.inputBackground,
  color: theme.colors.text,
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'background-color 0.2s',
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: theme.colors.primary,
  color: '#ffffff',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: theme.colors.secondary,
  color: theme.colors.text,
};

const deleteButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: theme.colors.error,
    color: '#ffffff',
};

const sceneListItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '4px',
  marginBottom: '5px',
  backgroundColor: theme.colors.inputBackground,
};

const errorStyle: React.CSSProperties = {
  color: theme.colors.error,
  fontSize: '14px',
  textAlign: 'center',
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: theme.colors.text,
};

export const SceneManagementModal: React.FC<SceneManagementModalProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, token } = useAuth();
  const { getSceneAsJson, loadSceneFromJson } = useStore();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSceneName, setNewSceneName] = useState('');
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingSceneName, setEditingSceneName] = useState('');

  const fetchScenes = async () => {
    setLoading(true);
    setError(null);
    const response = await api.getScenes();
    if (response.success && response.data) {
      setScenes(response.data);
    } else {
      setError(response.message || 'Failed to fetch scenes.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchScenes();
    }
  }, [isOpen, isAuthenticated, token]);

  const handleSaveScene = async () => {
    if (!newSceneName.trim()) {
      setError('Scene name cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);
    const currentSceneData = getSceneAsJson();
    const response = await api.saveScene(newSceneName, currentSceneData);
    if (response.success) {
      setNewSceneName('');
      fetchScenes();
      onClose(); // Close after saving
    } else {
      setError(response.message || 'Failed to save scene.');
    }
    setLoading(false);
  };

  const handleLoadScene = async (sceneId: string) => {
    setLoading(true);
    setError(null);
    const response = await api.getSceneById(sceneId);
    if (response.success && response.data) {
      // Ensure data is an object, not a string
      const sceneData = typeof response.data.data === 'string' 
        ? JSON.parse(response.data.data) 
        : response.data.data;

      if (sceneData) {
        loadSceneFromJson(sceneData);
        onClose();
      } else {
        setError('Scene data is corrupted or empty.');
      }
    } else {
      setError(response.message || 'Failed to load scene.');
    }
    setLoading(false);
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!window.confirm('Are you sure you want to delete this scene?')) return;
    setLoading(true);
    setError(null);
    const response = await api.deleteScene(sceneId);
    if (response.success) {
      fetchScenes();
    } else {
      setError(response.message || 'Failed to delete scene.');
    }
    setLoading(false);
  };

  const handleEditSceneName = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setEditingSceneName(scene.name);
  };

  const handleUpdateSceneName = async (sceneId: string) => {
    if (!editingSceneName.trim()) {
      setError('Scene name cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);
    const sceneToUpdate = scenes.find(s => s.id === sceneId);
    if (sceneToUpdate) {
        const response = await api.updateScene(sceneId, editingSceneName, sceneToUpdate.data);
        if (response.success) {
            setEditingSceneId(null);
            setEditingSceneName('');
            fetchScenes();
        } else {
            setError(response.message || 'Failed to update scene name.');
        }
    }
    setLoading(false);
  };

  if (!isOpen) return null;
  if (!isAuthenticated) return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
        <h2>Access Denied</h2>
        <p style={{ color: theme.colors.text }}>Please log in to manage scenes.</p>
      </div>
    </div>
  );

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
        <h2>Manage Scenes</h2>

        {error && <p style={errorStyle}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="New scene name"
            value={newSceneName}
            onChange={(e) => setNewSceneName(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          <button
            style={primaryButtonStyle}
            onClick={handleSaveScene}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Current Scene'}
          </button>
        </div>

        <h3>Your Saved Scenes</h3>
        {loading && <p style={{ color: theme.colors.text }}>Loading scenes...</p>}
        {!loading && scenes.length === 0 && <p style={{ color: theme.colors.text }}>No scenes saved yet.</p>}
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {scenes.map((scene) => (
                <div key={scene.id} style={sceneListItemStyle}>
                {editingSceneId === scene.id ? (
                    <input
                    type="text"
                    value={editingSceneName}
                    onChange={(e) => setEditingSceneName(e.target.value)}
                    style={{ ...inputStyle, width: 'auto', flexGrow: 1 }}
                    />
                ) : (
                    <span style={{ color: theme.colors.text, flexGrow: 1 }}>{scene.name}</span>
                )}
                <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                    {editingSceneId === scene.id ? (
                        <button style={primaryButtonStyle} onClick={() => handleUpdateSceneName(scene.id)} disabled={loading}>
                            Update
                        </button>
                    ) : (
                        <button style={secondaryButtonStyle} onClick={() => handleEditSceneName(scene)} disabled={loading}>
                            Edit
                        </button>
                    )}
                    <button style={primaryButtonStyle} onClick={() => handleLoadScene(scene.id)} disabled={loading}>
                    Load
                    </button>
                    <button style={deleteButtonStyle} onClick={() => handleDeleteScene(scene.id)} disabled={loading}>
                    Delete
                    </button>
                </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
