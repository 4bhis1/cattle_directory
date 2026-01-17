'use client';

import React, { ReactNode } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface MUIProviderProps {
    children: ReactNode;
}

export const MUIProvider = ({ children }: MUIProviderProps) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {children}
        </LocalizationProvider>
    );
};
