import React, { useEffect } from 'react';
import useStore, { Notification } from '../../store/mainStore';

import { theme } from '../../styles/theme';

const NotificationManager: React.FC = () => {
    const { notifications, removeNotification } = useStore(state => ({
        notifications: state.notifications,
        removeNotification: state.removeNotification
    }));

    useEffect(() => {
        const timers: number[] = [];

        notifications.forEach(notification => {
            const timer = window.setTimeout(() => {
                removeNotification(notification.id);
            }, 5000);
            timers.push(timer);
        });

        return () => {
            timers.forEach(timer => window.clearTimeout(timer));
        };
    }, [notifications, removeNotification]);

    const getNotificationStyle = (type: string): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            padding: '12px 16px',
            margin: '8px 0',
            borderRadius: '6px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease-out',
        };

        switch (type) {
            case 'success':
                return { ...baseStyle, background: '#28a745' };
            case 'error':
                return { ...baseStyle, background: theme.colors.error };
            case 'info':
            default:
                return { ...baseStyle, background: '#17a2b8' };
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '70px',
            right: '20px',
            zIndex: 1000,
            minWidth: '300px',
            maxWidth: '400px',
        }}>
            {notifications.map((notification: Notification) => (
                <div key={notification.id} style={getNotificationStyle(notification.type)}>
                    <span>{notification.message}</span>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '18px',
                            cursor: 'pointer',
                            marginLeft: '10px',
                            padding: '0',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default NotificationManager;