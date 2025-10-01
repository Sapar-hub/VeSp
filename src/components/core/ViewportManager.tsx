import React from 'react';
import useStore from '../../store/mainStore';
import { KonvaCanvas } from './KonvaCanvas';
import { ThreeCanvas } from './ThreeCanvas';

export const ViewportManager: React.FC = () => {
    const viewMode = useStore(state => state.viewMode);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {viewMode === '2d' ? <KonvaCanvas /> : <ThreeCanvas />}
        </div>
    );
};