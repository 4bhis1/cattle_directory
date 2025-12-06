'use client';
import React, { useState, useEffect } from 'react';
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
    IconButton,
    LinearProgress,
    Breadcrumbs,
    Link,
} from '@mui/material';
import {
    CalendarMonth,
    AttachMoney,
    Person,
    LocalDrink,
    Phone,
    Add,
    ArrowBack,
    NavigateNext,
    Save,
} from '@mui/icons-material';
import AddCustomerModal from '../../components/forms/AddCustomerModal';
import StickyFooter from '../../components/ui/StickyFooter';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

const paymentMethods = ['Cash', 'Bank Transfer', 'UPI', 'Cheque'];
const paymentStatuses = ['paid', 'pending', 'partial'];

export default function SalesForm() {
    const router = useRouter();
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [customers, setCustomers] = useState<any[]>([]);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: getTodayDate(),
        customerId: '',
        clientName: '',
        clientContact: '',
        quantityInLiters: '',
        pricePerLiter: '45',
        paymentMethod: '',
        paymentStatus: 'paid',
        deliveryAddress: '',
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

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/customers');
            const data = await response.json();
            if (data.success) {
                setCustomers(data.data);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleCustomerAdded = (newCustomer: any) => {
        setCustomers((prev) => [...prev, newCustomer]);
        handleChange('customerId', newCustomer._id);
        setSnackbar({
            open: true,
            message: 'Customer added successfully!',
            severity: 'success',
        });
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };

            // Auto-fill customer details if customerId changes
            if (field === 'customerId') {
                const customer = customers.find(c => c._id === value);
                if (customer) {
                    newData.clientName = customer.name;
                    newData.clientContact = customer.phone;
                    newData.deliveryAddress = customer.address || '';
                } else {
                    newData.clientName = '';
                    newData.clientContact = '';
                    newData.deliveryAddress = '';
                }
            }

            return newData;
        });
    };

    const totalAmount = (parseFloat(formData.quantityInLiters) || 0) * (parseFloat(formData.pricePerLiter) || 0);

    // Calculate progress (simple field completion)
    const requiredFields = ['date', 'customerId', 'quantityInLiters', 'pricePerLiter'];
    const completedFields = requiredFields.filter(field => !!formData[field as keyof typeof formData]).length;
    const progress = (completedFields / requiredFields.length) * 100;

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!formData.date || !formData.customerId || !formData.quantityInLiters || !formData.pricePerLiter) {
            setSnackbar({
                open: true,
                message: 'Please fill in all required fields',
                severity: 'error',
            });
            return;
        }

        setLoading(true);

        try {
            const salesRecord = {
                ...formData,
                quantityInLiters: parseFloat(formData.quantityInLiters),
                pricePerLiter: parseFloat(formData.pricePerLiter),
                totalAmount: totalAmount,
                recordedBy: 'Admin',
            };

            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(salesRecord),
            });

            const data = await response.json();

            if (data.success) {
                setSnackbar({
                    open: true,
                    message: '💵 Sales record saved successfully!',
                    severity: 'success',
                });

                // Reset form
                setTimeout(() => {
                    setFormData({
                        date: getTodayDate(),
                        customerId: '',
                        clientName: '',
                        clientContact: '',
                        quantityInLiters: '',
                        pricePerLiter: '45',
                        paymentMethod: '',
                        paymentStatus: 'paid',
                        deliveryAddress: '',
                        notes: '',
                    });
                }, 1500);
            } else {
                throw new Error(data.message || 'Failed to save sale');
            }
        } catch (error) {
            console.error('Error saving sale:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save sale. Please try again.',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="min-h-screen bg-gray-50 pb-32">
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 6,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                    }
                }}
            />

            <Box className="max-w-4xl mx-auto px-4 py-6">
                {/* Breadcrumbs & Header */}
                <Box className="mb-8">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="mb-4">
                        <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer">
                            Dashboard
                        </Link>
                        <Typography color="text.primary">Record Sale</Typography>
                    </Breadcrumbs>

                    <Box className="flex items-center justify-between">
                        <Box className="flex items-center">
                            <IconButton onClick={() => router.back()} className="mr-4 bg-white shadow-sm hover:bg-gray-50">
                                <ArrowBack />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" className="font-bold text-gray-800">
                                    Record Milk Sale
                                </Typography>
                                <Typography variant="body1" className="text-gray-500">
                                    Track milk sales to customers
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Fade in={true} timeout={800}>
                    <form onSubmit={handleSubmit}>
                        {/* Date and Client Section */}
                        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                            <Paper elevation={0} className="p-8 mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <Box className="flex items-center justify-between mb-4">
                                    <Box className="flex items-center">
                                        <Person sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
                                        <Typography variant="h5" className="font-bold text-gray-800">
                                            Client Information
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Add />}
                                        onClick={() => setIsCustomerModalOpen(true)}
                                        sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                                    >
                                        New Customer
                                    </Button>
                                </Box>
                                <Divider className="mb-6" />

                                <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TextField
                                        label="Date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleChange('date', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        fullWidth
                                        inputProps={{ max: getTodayDate() }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarMonth />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <FormControl fullWidth required>
                                        <InputLabel>Select Customer</InputLabel>
                                        <Select
                                            value={formData.customerId}
                                            onChange={(e) => handleChange('customerId', e.target.value)}
                                            label="Select Customer"
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <Person />
                                                </InputAdornment>
                                            }
                                        >
                                            {customers.map((customer) => (
                                                <MenuItem key={customer._id} value={customer._id}>
                                                    {customer.name} ({customer.phone})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Client Contact"
                                        value={formData.clientContact}
                                        fullWidth
                                        placeholder="Phone number"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Phone />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        label="Delivery Address"
                                        value={formData.deliveryAddress}
                                        onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                                        fullWidth
                                        placeholder="Optional"
                                    />
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Quantity and Pricing Section */}
                        <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                            <Paper elevation={0} className="p-8 mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <Box className="flex items-center mb-4">
                                    <LocalDrink sx={{ fontSize: 32, color: '#10b981', mr: 2 }} />
                                    <Typography variant="h5" className="font-bold text-gray-800">
                                        Sale Details
                                    </Typography>
                                </Box>
                                <Divider className="mb-6" />

                                <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TextField
                                        label="Quantity (Liters)"
                                        type="number"
                                        value={formData.quantityInLiters}
                                        onChange={(e) => handleChange('quantityInLiters', e.target.value)}
                                        required
                                        fullWidth
                                        inputProps={{ min: 0, step: 0.1 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocalDrink />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">L</InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        label="Price per Liter"
                                        type="number"
                                        value={formData.pricePerLiter}
                                        onChange={(e) => handleChange('pricePerLiter', e.target.value)}
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
                        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                            <Paper elevation={0} className="p-8 mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <Box className="flex items-center mb-4">
                                    <AttachMoney sx={{ fontSize: 32, color: '#8b5cf6', mr: 2 }} />
                                    <Typography variant="h5" className="font-bold text-gray-800">
                                        Payment Information
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

                                    <FormControl fullWidth>
                                        <InputLabel>Payment Status</InputLabel>
                                        <Select
                                            value={formData.paymentStatus}
                                            onChange={(e) => handleChange('paymentStatus', e.target.value)}
                                            label="Payment Status"
                                        >
                                            {paymentStatuses.map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Notes"
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Additional notes"
                                        sx={{ gridColumn: '1 / -1' }}
                                    />
                                </Box>
                            </Paper>
                        </Zoom>
                    </form>
                </Fade>
            </Box>

            {/* Fixed Bottom Bar */}
            {/* Fixed Bottom Bar */}
            <StickyFooter
                stats={[
                    { label: 'Total Quantity', value: formData.quantityInLiters || 0, unit: 'L', valueColor: 'text-blue-600' },
                    { label: 'Total Amount', value: `₹${totalAmount.toFixed(0)}`, valueColor: 'text-green-600' }
                ]}
                submitButton={{
                    text: 'Save Record',
                    onClick: () => handleSubmit(),
                    loading: loading,
                    disabled: loading
                }}
            />

            <AddCustomerModal
                open={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                onCustomerAdded={handleCustomerAdded}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ bottom: { xs: 100, sm: 100 } }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
