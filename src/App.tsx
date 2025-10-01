import React, { useEffect } from 'react';
import { URLSerializer } from './io/URLSerializer';
import { Toolbar } from './components/ui/Toolbar';
import { InspectorPanel } from './components/ui/InspectorPanel';
import { ViewportManager } from './components/core/ViewportManager';
import { BasisPanel } from './components/ui/BasisPanel';
import NotificationManager from './components/ui/NotificationManager';

const App: React.FC = () => {
    useEffect(() => {
        URLSerializer.loadFromURL();
        const unsubscribe = URLSerializer.subscribeToStoreChanges();
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
            <Toolbar />
            <InspectorPanel />
            <BasisPanel />
            <ViewportManager />
            <NotificationManager />
        </div>
    );
};

export default App;