import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';

interface AddCustomerModalProps {
    open: boolean;
    onClose: () => void;
    onCustomerAdded: (customer: any) => void;
}

export default function AddCustomerModal({ open, onClose, onCustomerAdded }: AddCustomerModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            setError('Name and Phone are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                onCustomerAdded(data.data);
                onClose();
                setFormData({ name: '', phone: '', address: '', email: '' });
            } else {
                setError(data.message || 'Failed to add customer');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box className="flex flex-col gap-4 mt-2">
                    <TextField
                        label="Customer Name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Address"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />
                    <TextField
                        label="Email (Optional)"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        fullWidth
                        type="email"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Add Customer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
