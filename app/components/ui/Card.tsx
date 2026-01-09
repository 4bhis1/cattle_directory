import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, className, headerAction }) => {
    return (
        <Paper
            elevation={0}
            className={`border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm ${className || ''}`}
        >
            {(title || subtitle || headerAction) && (
                <Box className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <Box>
                        {title && <Typography variant="h6" className="font-bold text-gray-800">{title}</Typography>}
                        {subtitle && <Typography variant="body2" className="text-gray-500 mt-1">{subtitle}</Typography>}
                    </Box>
                    {headerAction && <Box>{headerAction}</Box>}
                </Box>
            )}
            <Box className="p-0">
                {children}
            </Box>
        </Paper>
    );
}
