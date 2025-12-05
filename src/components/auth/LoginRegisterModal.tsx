// src/components/auth/LoginRegisterModal.tsx
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { theme, commonStyles } from '../../styles/theme';

interface LoginRegisterModalProps {
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
  width: '350px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  position: 'relative',
};

const inputStyle: React.CSSProperties = {
  ...commonStyles.input, // Use common styles as base
  padding: '10px',
  width: '100%',
  boxSizing: 'border-box',
  color: theme.colors.text, // Ensure text color is explicitly set for readability
  marginBottom: '0', // Reset if commonStyles.input has a default margin
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 15px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'background-color 0.2s',
  flexGrow: 1,
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

export const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({ isOpen, onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, register, loading } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    let response;
    if (isLoginMode) {
      response = await login(email, password);
    } else {
      response = await register(email, password);
    }

    if (!response.success) {
      setError(response.message || 'An unexpected error occurred.');
    } else {
      onClose(); // Close modal on successful auth
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
        <h2>{isLoginMode ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            disabled={loading}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              style={primaryButtonStyle}
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLoginMode ? 'Login' : 'Register')}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => setIsLoginMode(!isLoginMode)}
              disabled={loading}
            >
              Switch to {isLoginMode ? 'Register' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};