import React, { useEffect } from 'react';
import { URLSerializer } from './io/URLSerializer';
import { Toolbar } from './components/ui/Toolbar';
import { InspectorPanel } from './components/ui/InspectorPanel';
import { ViewportManager } from './components/core/ViewportManager';
import { BasisPanel } from './components/ui/BasisPanel';
import NotificationManager from './components/ui/NotificationManager';
import { ExpressionInputPanel } from './components/ui/ExpressionInputPanel';
import { ObjectInspector } from './components/ui/ObjectInspector';

function App() {
    return (
        <>
            <ViewportManager />
            <Toolbar />
            <InspectorPanel />
            <ExpressionInputPanel />
            <ObjectInspector />
        </>
    );
}

export default App;