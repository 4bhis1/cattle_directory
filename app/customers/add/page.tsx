'use client';
import React, { useState } from 'react';
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
} from '@mui/material';
import {
    Person,
    Phone,
    Home,
    Email,
    CalendarMonth,
} from '@mui/icons-material';

export default function AddCustomerPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        email: '',
        status: 'active',
    });

    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setSnackbar({
                    open: true,
                    message: 'Customer added successfully!',
                    severity: 'success',
                });
                setFormData({
                    name: '',
                    phone: '',
                    address: '',
                    email: '',
                    status: 'active',
                });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to add customer',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <Fade in={true} timeout={800}>
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <Box className="text-center mb-8">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Add New Customer
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Register a new customer for milk sales
                        </p>
                    </Box>

                    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                        <Paper elevation={3} className="p-8 mb-6 bg-white rounded-2xl">
                            <Box className="flex items-center mb-4">
                                <Person sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
                                <Typography variant="h5" className="font-bold text-gray-800">
                                    Customer Details
                                </Typography>
                            </Box>
                            <Divider className="mb-6" />

                            <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextField
                                    label="Customer Name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: '#3b82f6',
                                                borderWidth: '2px',
                                            },
                                        },
                                    }}
                                />

                                <TextField
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    required
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: '#3b82f6',
                                                borderWidth: '2px',
                                            },
                                        },
                                    }}
                                />

                                <TextField
                                    label="Email (Optional)"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: '#3b82f6',
                                                borderWidth: '2px',
                                            },
                                        },
                                    }}
                                />

                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Address"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    className="md:col-span-2"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Home />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: '#3b82f6',
                                                borderWidth: '2px',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Zoom>

                    <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                        <Paper elevation={3} className="p-8 bg-white rounded-2xl">
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={loading}
                                size="large"
                                fullWidth
                                sx={{
                                    py: 2,
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    borderRadius: '12px',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'SAVE CUSTOMER'}
                            </Button>
                        </Paper>
                    </Zoom>
                </form>
            </Fade>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
