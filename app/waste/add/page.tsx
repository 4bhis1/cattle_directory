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
    DeleteOutline,
    Recycling,
    ArrowBack,
    NavigateNext,
    Save,
    Description,
} from '@mui/icons-material';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

const wasteTypes = ['Manure', 'Urine', 'Bedding Waste', 'Feed Waste', 'Other'];
const disposalMethods = ['Biogas Plant', 'Compost Pit', 'Sold', 'Discarded', 'Field Application'];
const sources = ['Shed 1', 'Shed 2', 'Calf Pen', 'Milking Parlor', 'General'];

export default function WasteForm() {
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
        wasteType: '',
        quantity: '',
        source: '',
        disposalMethod: '',
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

        if (!formData.date || !formData.wasteType || !formData.quantity) {
            setSnackbar({
                open: true,
                message: 'Please fill in all required fields',
                severity: 'error',
            });
            return;
        }

        setLoading(true);

        try {
            const wasteRecord = {
                date: formData.date,
                wasteType: formData.wasteType,
                quantity: parseFloat(formData.quantity),
                source: formData.source,
                disposalMethod: formData.disposalMethod,
                notes: formData.notes,
                recordedBy: 'Admin',
            };

            const response = await fetch('/api/waste', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wasteRecord),
            });

            const data = await response.json();

            if (data.success) {
                setSnackbar({
                    open: true,
                    message: '♻️ Waste record saved successfully!',
                    severity: 'success',
                });

                // Reset form
                setTimeout(() => {
                    setFormData({
                        date: getTodayDate(),
                        wasteType: '',
                        quantity: '',
                        source: '',
                        disposalMethod: '',
                        notes: '',
                    });
                }, 1500);
            } else {
                throw new Error(data.message || 'Failed to save waste record');
            }
        } catch (error) {
            console.error('Error saving waste record:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save record. Please try again.',
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
                                    <Typography color="text.primary" sx={{ fontSize: '0.8rem' }}>Waste</Typography>
                                </Breadcrumbs>
                                <Typography variant="h6" className="font-bold text-gray-800 leading-none mt-1">
                                    Record Waste
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
                        {/* Waste Details Section */}
                        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                            <Paper elevation={0} className="p-6 mb-6 bg-white rounded-xl border border-gray-200">
                                <Box className="flex items-center mb-4">
                                    <DeleteOutline sx={{ fontSize: 24, color: '#ef4444', mr: 2 }} />
                                    <Typography variant="h6" className="font-bold text-gray-800">
                                        Waste Details
                                    </Typography>
                                </Box>
                                <Divider className="mb-6" />

                                <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormControl fullWidth required>
                                        <InputLabel>Waste Type</InputLabel>
                                        <Select
                                            value={formData.wasteType}
                                            onChange={(e) => handleChange('wasteType', e.target.value)}
                                            label="Waste Type"
                                        >
                                            {wasteTypes.map((type) => (
                                                <MenuItem key={type} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => handleChange('quantity', e.target.value)}
                                        required
                                        fullWidth
                                        inputProps={{ min: 0, step: 0.1 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">kg</InputAdornment>
                                            ),
                                        }}
                                    />

                                    <FormControl fullWidth>
                                        <InputLabel>Source</InputLabel>
                                        <Select
                                            value={formData.source}
                                            onChange={(e) => handleChange('source', e.target.value)}
                                            label="Source"
                                        >
                                            {sources.map((source) => (
                                                <MenuItem key={source} value={source}>
                                                    {source}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Disposal Section */}
                        <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                            <Paper elevation={0} className="p-6 mb-6 bg-white rounded-xl border border-gray-200">
                                <Box className="flex items-center mb-4">
                                    <Recycling sx={{ fontSize: 24, color: '#10b981', mr: 2 }} />
                                    <Typography variant="h6" className="font-bold text-gray-800">
                                        Disposal & Notes
                                    </Typography>
                                </Box>
                                <Divider className="mb-6" />

                                <Box className="grid grid-cols-1 gap-6">
                                    <FormControl fullWidth>
                                        <InputLabel>Disposal Method</InputLabel>
                                        <Select
                                            value={formData.disposalMethod}
                                            onChange={(e) => handleChange('disposalMethod', e.target.value)}
                                            label="Disposal Method"
                                        >
                                            {disposalMethods.map((method) => (
                                                <MenuItem key={method} value={method}>
                                                    {method}
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
                                        rows={3}
                                        placeholder="Additional notes..."
                                    />
                                </Box>
                            </Paper>
                        </Zoom>
                    </Box>
                </Fade>
            </Box>

            {/* Sticky Bottom Bar */}
            <Paper
                elevation={4}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    borderRadius: '24px 24px 0 0'
                }}
                className="bg-white border-t border-gray-200"
            >
                <Box className="max-w-4xl mx-auto px-6 py-4">
                    <Box className="flex items-center justify-between mb-4">
                        <Box>
                            <Typography variant="caption" className="text-gray-500 uppercase font-bold">Total Quantity</Typography>
                            <Typography variant="h5" className="text-gray-800 font-bold">
                                {formData.quantity || '0'} kg
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => handleSubmit()}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        sx={{
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Waste Record'}
                    </Button>
                </Box>
            </Paper>

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
