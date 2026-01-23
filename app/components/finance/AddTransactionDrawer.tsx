
import React, { useState } from 'react';
import { Drawer, IconButton, Tabs, Tab, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';

interface AddTransactionDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultDate?: string;
    editId?: string | null;
    editData?: any | null; 
}

const AddTransactionDrawer = ({ open, onClose, onSuccess, defaultDate, editId, editData }: AddTransactionDrawerProps) => {
    const [tabIndex, setTabIndex] = useState(0);

    // If editing, force correct tab based on type
    React.useEffect(() => {
        if (editData) {
            if (editData.recordType === 'income') setTabIndex(0);
            else if (editData.recordType === 'expense') setTabIndex(1);
        }
    }, [editData]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                className: "w-full md:w-[600px] p-0 bg-slate-50 dark:bg-slate-950 flex flex-col h-full"
            }}
        >
            <div className="flex-none p-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {editId ? 'Edit Transaction' : 'New Transaction'}
                        </h2>
                        <p className="text-sm text-slate-500">
                             {editId ? 'Update details' : 'Record money in or out'}
                        </p>
                    </div>
                    <IconButton onClick={onClose} className="bg-slate-100 dark:bg-slate-800">
                        <Close />
                    </IconButton>
                </div>
                
                <Tabs 
                    value={tabIndex} 
                    onChange={handleTabChange} 
                    className="w-full"
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': { fontWeight: 'bold' },
                        '& .Mui-selected': { color: '#2563eb' }
                    }}
                >
                    <Tab label="Income (Money In)" />
                    <Tab label="Expense (Money Out)" />
                </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <Box className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    {tabIndex === 0 && (
                        <IncomeForm 
                            onSuccess={onSuccess} 
                            onClose={onClose}
                            defaultDate={defaultDate}
                        />
                    )}
                    {tabIndex === 1 && (
                        <ExpenseForm 
                            onSuccess={onSuccess} 
                            onClose={onClose}
                            defaultDate={defaultDate} 
                        />
                    )}
                </Box>
            </div>
        </Drawer>
    );
};

export default AddTransactionDrawer;
