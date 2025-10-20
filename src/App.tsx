import React, { useEffect } from 'react';
import { URLSerializer } from './io/URLSerializer';
import { Toolbar } from './components/ui/Toolbar';
import { InspectorPanel } from './components/ui/InspectorPanel';
import { ViewportManager } from './components/core/ViewportManager';
import { BasisPanel } from './components/ui/BasisPanel';
import NotificationManager from './components/ui/NotificationManager';
import { ExpressionInputPanel } from './components/ui/ExpressionInputPanel';

function App() {
    const appStyle: React.CSSProperties = {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#111',
        overflow: 'hidden',
    };

    return (
        <div style={appStyle}>
            <ViewportManager />
            <Toolbar />
            <InspectorPanel />
            <ExpressionInputPanel />
            <BasisPanel />
            <NotificationManager />
        </div>
    );
}

export default App;