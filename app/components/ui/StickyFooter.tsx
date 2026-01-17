import React from 'react';
import { Paper, Box, Typography, Button, CircularProgress } from '@mui/material';
import { Save } from '@mui/icons-material';

export interface StatItem {
    label: string;
    value: string | number;
    unit?: string;
    containerStyle?: string;
    valueColor?: string; // e.g. 'text-blue-600'
}

export const SummaryData = ({ stats }: { stats: StatItem[];}) => {
    return (
        <div className="flex gap-8 overflow-x-auto w-full md:w-auto justify-center md:justify-start no-scrollbar">
            {stats.map((stat, index) => (
                <div key={index} className={`flex flex-col items-center md:items-start min-w-[80px] ${stat.containerStyle || ''}`}>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                        {stat.label}
                    </span>
                    <div className={`text-xl font-bold leading-none mt-1 ${stat.valueColor || 'text-slate-800 dark:text-white'}`}>
                        {stat.value}
                        {stat.unit && <span className="text-sm text-slate-400 dark:text-slate-500 ml-1 font-medium">{stat.unit}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

interface StickyFooterProps {
    children?: React.ReactNode;
    summary?: React.ReactNode;
    submitButton?: {
        text: string;
        onClick: () => void;
        loading?: boolean;
        disabled?: boolean;
    };
    buttonStyle?: string;
    buttonLabel?: string;
    buttonIcon?: React.ReactNode;
    parentStyle?: string;
}

export default function StickyFooter({ children, summary = <div />, submitButton, buttonStyle, buttonLabel, buttonIcon, parentStyle }: StickyFooterProps) {

    if(!children){
        children = <>
        {summary}
                <Button
                    variant="contained"
                    onClick={submitButton?.onClick}
                    disabled={submitButton?.disabled || submitButton?.loading}
                    startIcon={submitButton?.loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    className={`w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 ${buttonStyle || ''}`}
                    sx={{
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#1d4ed8',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                        }
                    }}
                >
                    {submitButton.loading ? 'Saving...' : submitButton.text}
                </Button>
        </>
    }


    return (
        <div className={`sticky bottom-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md`}>
            <div className={` flex-row mx-auto p-4 flex flex-col border-t border-slate-200 dark:border-slate-800 md:flex-row items-center justify-between gap-4 ${parentStyle || ''}`}>
                {children}
            </div>
        </div>
    );
}
