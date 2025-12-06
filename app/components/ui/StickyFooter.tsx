import React from 'react';
import { Paper, Box, Typography, Button, CircularProgress } from '@mui/material';
import { Save } from '@mui/icons-material';

interface StatItem {
    label: string;
    value: string | number;
    unit?: string;
    valueColor?: string; // e.g. 'text-blue-600'
}

interface StickyFooterProps {
    stats: StatItem[];
    submitButton: {
        text: string;
        onClick: () => void;
        loading?: boolean;
        disabled?: boolean;
    };
}

export default function StickyFooter({ stats, submitButton }: StickyFooterProps) {
    return (
        <Paper
            elevation={4}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: { lg: '280px', xs: 0 },
                right: 0,
                zIndex: 1000,
                borderRadius: '16px 16px 0 0'
            }}
            className="bg-white/95 backdrop-blur-sm border-t border-gray-200"
        >
            <Box className="max-w-4xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                <Box className="flex gap-6 overflow-x-auto w-full md:w-auto justify-center md:justify-start no-scrollbar">
                    {stats.map((stat, index) => (
                        <Box key={index} className="flex flex-col items-center md:items-start">
                            <Typography variant="caption" className="text-gray-500 uppercase tracking-wider font-bold text-[0.65rem]">
                                {stat.label}
                            </Typography>
                            <Typography variant="body1" className={`font-bold leading-none ${stat.valueColor || 'text-gray-800'}`}>
                                {stat.value} {stat.unit && <span className="text-xs text-gray-400">{stat.unit}</span>}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Button
                    variant="contained"
                    size="medium"
                    onClick={submitButton.onClick}
                    disabled={submitButton.disabled || submitButton.loading}
                    startIcon={submitButton.loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    sx={{
                        py: 1,
                        px: 4,
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        minWidth: '200px',
                        width: { xs: '100%', md: 'auto' }
                    }}
                >
                    {submitButton.loading ? 'Saving...' : submitButton.text}
                </Button>
            </Box>
        </Paper>
    );
}
