'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    InputAdornment,
} from '@mui/material';
import { Medication, AttachMoney, CalendarMonth, Note } from '@mui/icons-material';

export default function MedicineForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cattleIdParam = searchParams.get('cattleId');

    const [form, setForm] = useState({
        cattleId: cattleIdParam || '',
        medicineName: '',
        date: new Date().toISOString().split('T')[0],
        cost: '',
        notes: '',
    });

    const [cattleList, setCattleList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetch('/api/cattle')
            .then(res => res.json())
            .then(data => {
                if (data.success) setCattleList(data.data);
            })
            .catch(err => console.error('Error fetching cattle:', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSnackbar({ open: true, message: 'Medicine record added successfully!', severity: 'success' });
            setForm(prev => ({ ...prev, medicineName: '', cost: '', notes: '' }));
        }, 1000);
    };

    return (
        <Box className="min-h-screen bg-gray-50 p-4 pb-20">
            <Paper className="max-w-2xl mx-auto p-6 rounded-xl shadow-sm">
                <Box className="flex items-center mb-6">
                    <Medication className="text-red-500 mr-2" fontSize="large" />
                    <Typography variant="h5" className="font-bold text-gray-800">
                        Add Medicine Record
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormControl fullWidth required>
                        <InputLabel>Select Cattle</InputLabel>
                        <Select
                            value={form.cattleId}
                            label="Select Cattle"
                            onChange={(e) => setForm({ ...form, cattleId: e.target.value })}
                        >
                            {cattleList.map((cow) => (
                                <MenuItem key={cow._id} value={cow._id}>
                                    {cow.name} ({cow.cattleId})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Medicine Name"
                        required
                        value={form.medicineName}
                        onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Medication /></InputAdornment>,
                        }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            required
                            InputLabelProps={{ shrink: true }}
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><CalendarMonth /></InputAdornment>,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Cost"
                            type="number"
                            required
                            value={form.cost}
                            onChange={(e) => setForm({ ...form, cost: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                            }}
                        />
                    </div>

                    <TextField
                        fullWidth
                        label="Notes / Dosage"
                        multiline
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ mt: 1 }}><Note /></InputAdornment>,
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading}
                        sx={{
                            bgcolor: '#ef4444',
                            '&:hover': { bgcolor: '#dc2626' },
                            py: 1.5
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Record'}
                    </Button>
                </form>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
