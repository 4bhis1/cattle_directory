'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    TextField,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
    InputAdornment,
    Box,
    Fade,
    Zoom,
    Typography,
    Paper,
    Divider,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Breadcrumbs,
    Link,
    IconButton,
} from '@mui/material';
import {
    CalendarMonth,
    AttachMoney,
    Category,
    Description,
    ArrowBack,
    NavigateNext,
    Save,
} from '@mui/icons-material';
import StickyFooter from '../../components/ui/StickyFooter';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

const expenseCategories = [
    'Feed Purchase',
    'Medicine',
    'Veterinary Services',
    'Equipment',
    'Labor',
    'Utilities',
    'Maintenance',
    'Transportation',
    'Other',
];

const paymentMethods = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card'];

export default function ExpenseForm() {
    const router = useRouter();
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        date: getTodayDate(),
        expenseCategory: '',
        description: '',
        amount: '',
        paymentMethod: '',
        paymentStatus: 'paid',
        vendorName: '',
        invoiceNumber: '',
        notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: SnackbarSeverity;
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!formData.date || !formData.expenseCategory || !formData.amount) {
            setSnackbar({
                open: true,
                message: 'Please fill in all required fields',
                severity: 'error',
            });
            return;
        }

        setLoading(true);

        try {
            const expenseRecord = {
                date: formData.date,
                expenseCategory: formData.expenseCategory,
                description: formData.description,
                amount: parseFloat(formData.amount),
                paymentMethod: formData.paymentMethod,
                paymentStatus: formData.paymentStatus,
                vendorName: formData.vendorName,
                invoiceNumber: formData.invoiceNumber,
                notes: formData.notes,
                recordedBy: 'Admin',
            };

            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseRecord),
            });

            const data = await response.json();

            if (data.success) {
                setSnackbar({
                    open: true,
                    message: '💰 Expense record saved successfully!',
                    severity: 'success',
                });

                // Reset form
                setTimeout(() => {
                    setFormData({
                        date: getTodayDate(),
                        expenseCategory: '',
                        description: '',
                        amount: '',
                        paymentMethod: '',
                        paymentStatus: 'paid',
                        vendorName: '',
                        invoiceNumber: '',
                        notes: '',
                    });
                }, 1500);
            } else {
                throw new Error(data.message || 'Failed to save expense');
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save expense. Please try again.',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="min-h-screen bg-gray-50 pb-32">
            {/* Sticky Header */}
            <Paper
                elevation={1}
                sx={{ position: 'sticky', top: 0, zIndex: 1100 }}
                className="bg-white border-b border-gray-200"
            >
                <Box className="max-w-4xl mx-auto px-4 py-3">
                    <Box className="flex items-center justify-between">
                        <Box className="flex items-center">
                            <IconButton onClick={() => router.back()} size="small" className="mr-2">
                                <ArrowBack />
                            </IconButton>
                            <Box>
                                <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" sx={{ '& .MuiBreadcrumbs-li': { fontSize: '0.8rem' } }}>
                                    <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer">
                                        Dashboard
                                    </Link>
                                    <Typography color="text.primary" sx={{ fontSize: '0.8rem' }}>Expenses</Typography>
                                </Breadcrumbs>
                                <Typography variant="h6" className="font-bold text-gray-800 leading-none mt-1">
                                    Add Expense
                                </Typography>
                            </Box>
                        </Box>

                        <Paper className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg flex items-center">
                            <CalendarMonth className="text-blue-600 mr-2" fontSize="small" />
                            <TextField
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                                sx={{ '& input': { fontSize: '0.9rem', fontWeight: 600, color: '#1e40af' } }}
                            />
                        </Paper>
                    </Box>
                </Box>
            </Paper>

            <Box className="max-w-4xl mx-auto px-4 py-6">
                <Fade in={true} timeout={800}>
                    <Box>
                        {/* Category Section */}
                        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                            <Paper elevation={0} className="p-6 mb-6 bg-white rounded-xl border border-gray-200">
                                <Box className="flex items-center mb-4">
                                    <Category sx={{ fontSize: 24, color: '#3b82f6', mr: 2 }} />
                                    <Typography variant="h6" className="font-bold text-gray-800">
                                        Category & Amount
                                    </Typography>
                                </Box>
                                <Divider className="mb-6" />

                                <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormControl fullWidth required>
                                        <InputLabel>Expense Category</InputLabel>
                                        <Select
                                            value={formData.expenseCategory}
                                            onChange={(e) => handleChange('expenseCategory', e.target.value)}
                                            label="Expense Category"
                                        >
                                            {expenseCategories.map((category) => (
                                                <MenuItem key={category} value={category}>
                                                    {category}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => handleChange('amount', e.target.value)}
                                        required
                                        fullWidth
                                        inputProps={{ min: 0, step: 0.01 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">₹</InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Payment Section */}
                        <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                            <Paper elevation={0} className="p-6 mb-6 bg-white rounded-xl border border-gray-200">
                                <Box className="flex items-center mb-4">
                                    <AttachMoney sx={{ fontSize: 24, color: '#10b981', mr: 2 }} />
                                    <Typography variant="h6" className="font-bold text-gray-800">
                                        Payment Details
                                    </Typography>
                                </Box>
                                <Divider className="mb-6" />

                                <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormControl fullWidth>
                                        <InputLabel>Payment Method</InputLabel>
                                        <Select
                                            value={formData.paymentMethod}
                                            onChange={(e) => handleChange('paymentMethod', e.target.value)}
                                            label="Payment Method"
                                        >
                                            {paymentMethods.map((method) => (
                                                <MenuItem key={method} value={method}>
                                                    {method}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Vendor Name"
                                        value={formData.vendorName}
                                        onChange={(e) => handleChange('vendorName', e.target.value)}
                                        fullWidth
                                    />

                                    <TextField
                                        label="Invoice Number"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                                        fullWidth
                                    />
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Description Section */}
                        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                            <Paper elevation={0} className="p-6 mb-6 bg-white rounded-xl border border-gray-200">
                                <Box className="flex items-center mb-4">
                                    <Description sx={{ fontSize: 24, color: '#8b5cf6', mr: 2 }} />
                                    <Typography variant="h6" className="font-bold text-gray-800">
                                        Additional Details
                                    </Typography>
                                </Box>
                                <Divider className="mb-6" />

                                <Box className="space-y-6">
                                    <TextField
                                        label="Description"
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Brief description of the expense"
                                    />

                                    <TextField
                                        label="Notes"
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Additional notes or remarks"
                                    />
                                </Box>
                            </Paper>
                        </Zoom>
                    </Box>
                </Fade>
            </Box>

            {/* Sticky Bottom Bar */}
            {/* Sticky Bottom Bar */}
            <StickyFooter
                stats={[
                    { label: 'Total Amount', value: `₹${formData.amount || '0'}`, valueColor: 'text-green-600' }
                ]}
                submitButton={{
                    text: 'Save Record',
                    onClick: () => handleSubmit(),
                    loading: loading,
                    disabled: loading
                }}
            />

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ bottom: { xs: 100, sm: 100 } }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
