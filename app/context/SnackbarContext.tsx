'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Snackbar, Alert, AlertColor, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface SnackbarContextType {
    showSnackbar: (message: string, severity?: AlertColor, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('success');
    const [duration, setDuration] = useState(4000);

    const showSnackbar = useCallback((msg: string, sev: AlertColor = 'success', dur: number = 4000) => {
        setMessage(msg);
        setSeverity(sev);
        setDuration(dur);
        setOpen(true);
    }, []);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={duration}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ top: { xs: 30, sm: 30 }, right: { xs: 30, sm: 50 } }}
            >
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    variant="filled"
                    sx={{ width: '100%', alignItems: 'center' }}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => setOpen(false)}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};
