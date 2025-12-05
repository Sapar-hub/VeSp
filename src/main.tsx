import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { enableMapSet } from 'immer';
import 'katex/dist/katex.min.css';
import './index.css';
import { AuthProvider } from './components/auth/AuthContext.tsx';

enableMapSet();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);