
import React from 'react';
import { Drawer, IconButton, Typography, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import ExpenseForm from './ExpenseForm';

interface AddTransactionDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultDate?: string;
}

const AddTransactionDrawer = ({ open, onClose, onSuccess, defaultDate }: AddTransactionDrawerProps) => {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                className: "w-full md:w-[500px] p-6 bg-slate-50 dark:bg-slate-950"
            }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">New Transaction</h2>
                    <p className="text-sm text-slate-500">Record an income or expense</p>
                </div>
                <IconButton onClick={onClose} className="bg-white dark:bg-slate-900 shadow-sm">
                    <Close />
                </IconButton>
            </div>

            <Box className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <ExpenseForm 
                    onSuccess={onSuccess} 
                    onClose={onClose}
                    defaultDate={defaultDate} 
                />
            </Box>
        </Drawer>
    );
};

export default AddTransactionDrawer;
