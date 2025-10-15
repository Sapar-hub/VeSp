import React from 'react';
import useStore from '../../store/mainStore';

export const ObjectInspector: React.FC = () => {
    const objects = useStore(state => state.objects);

    return (
        <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            width: '300px',
            height: '200px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            zIndex: 200,
            overflowY: 'auto',
            padding: '10px',
            border: '1px solid white',
        }}>
            <h3 style={{ margin: 0 }}>Objects Inspector</h3>
            <pre>{JSON.stringify(Array.from(objects.entries()), null, 2)}</pre>
        </div>
    );
};