export const theme = {
    colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: 'rgba(30, 30, 30, 0.9)',
        text: '#e0e0e0',
        error: '#c0392b',
        selection: '#007bff',
        border: 'rgba(255, 255, 255, 0.1)',
        buttonHover: '#0056b3', // Darker shade of primary
        buttonDisabled: '#4e555b',
        inputBackground: 'rgba(0, 0, 0, 0.2)',
    },
    spacing: {
        panelPadding: '15px',
        sectionPadding: '10px',
        buttonMargin: '4px 2px',
        buttonPadding: '8px 12px',
        inputMargin: '8px',
    },
    visual: {
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
    },
    typography: {
        fontFamily: 'inherit', // Use parent font
        fontSize: '14px',
    }
};

export const commonStyles = {
    panel: {
        background: theme.colors.background,
        backdropFilter: theme.visual.backdropFilter,
        borderRadius: theme.visual.borderRadius,
        border: theme.visual.border,
        padding: theme.spacing.panelPadding,
        color: theme.colors.text,
        zIndex: theme.visual.zIndex,
    } as React.CSSProperties,
    
    button: {
        padding: theme.spacing.buttonPadding,
        margin: theme.spacing.buttonMargin,
        borderRadius: '4px', // Slightly smaller for buttons
        border: 'none',
        cursor: 'pointer',
        color: 'white',
        background: theme.colors.primary,
        transition: 'background 0.2s ease',
    } as React.CSSProperties,

    input: {
        padding: '6px',
        borderRadius: '4px',
        border: `1px solid ${theme.colors.border}`,
        background: 'rgba(0, 0, 0, 0.2)',
        color: theme.colors.text,
        width: '100%',
        marginBottom: theme.spacing.inputMargin,
    } as React.CSSProperties,
};
