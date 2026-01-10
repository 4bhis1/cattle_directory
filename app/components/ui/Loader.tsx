'use client';
import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

interface LoaderProps {
    text?: string;
    fullScreen?: boolean;
}

export default function Loader({ text = 'Loading...', fullScreen = false }: LoaderProps) {
    return (
        <Box
            className={`flex flex-col items-center justify-center gap-6 ${fullScreen ? 'fixed inset-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm' : 'w-full h-64'
                }`}
        >
            <div className="relative flex items-center justify-center">
                <CircularProgress
                    size={60}
                    thickness={4}
                    className="text-blue-600"
                    sx={{
                        animationDuration: '1.5s',
                    }}
                />
            </div>
            {text && (
                <Typography
                    variant="h6"
                    className="mt-4 text-slate-600 dark:text-slate-300 font-medium animate-pulse"
                >
                    {text}
                </Typography>
            )}
        </Box>
    );
}
