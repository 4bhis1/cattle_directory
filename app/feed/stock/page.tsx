'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    MenuItem,
    LinearProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    Fade,
    Zoom,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import {
    ArrowBack,
    Add,
    Inventory2,
    History,
    TrendingUp,
    Storefront,
    Edit,
    Delete,
    Close,
    Search,
    CalendarMonth,
    AttachMoney,
    Scale,
    LocalShipping
} from '@mui/icons-material';

// Types
interface FeedType {
    _id: string;
    name: string;
    unit: string;
    loading?: boolean;
}

interface StockTransaction {
    _id: string;
    date: string;
    feedTypeId: string;
    feedName: string; // Denormalized for display or fetched
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalCost: number;
    vendor?: string;
    notes?: string;
    batchNumber?: string;
}

interface StockSummary {
    feedTypeId: string;
    feedName: string;
    currentStock: number;
    unit: string;
    avgCost: number;
    lastRestocked: string;
}

export default function FeedStockPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Data States
    const [feedTypes, setFeedTypes] = useState<FeedType[]>([]);
    const [transactions, setTransactions] = useState<StockTransaction[]>([]);
    const [inventory, setInventory] = useState<StockSummary[]>([]);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isNewTypeMode, setIsNewTypeMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        feedTypeId: '',
        newFeedName: '',
        newFeedUnit: 'kg',
        quantity: '',
        pricePerUnit: '',
        vendor: '',
        notes: ''
    });

    // Mock Data Loading (Replace with real API calls later)
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Simulating API fetch
                await new Promise(resolve => setTimeout(resolve, 800));

                const mockFeedTypes = [
                    { _id: '1', name: 'Cotton Seed Cake', unit: 'kg' },
                    { _id: '2', name: 'Corn Silage', unit: 'kg' },
                    { _id: '3', name: 'Wheat Bran', unit: 'kg' },
                    { _id: '4', name: 'Mineral Mixture', unit: 'kg' },
                ];
                setFeedTypes(mockFeedTypes);

                const mockInventory = [
                    { feedTypeId: '1', feedName: 'Cotton Seed Cake', currentStock: 450, unit: 'kg', avgCost: 32, lastRestocked: '2025-10-15' },
                    { feedTypeId: '2', feedName: 'Corn Silage', currentStock: 1200, unit: 'kg', avgCost: 6, lastRestocked: '2025-10-18' },
                    { feedTypeId: '3', feedName: 'Wheat Bran', currentStock: 80, unit: 'kg', avgCost: 24, lastRestocked: '2025-09-30' },
                ];
                setInventory(mockInventory);

                const mockTransactions = [
                    { _id: 't1', date: '2025-10-18', feedTypeId: '2', feedName: 'Corn Silage', quantity: 500, unit: 'kg', pricePerUnit: 6, totalCost: 3000, vendor: 'Green Farms', notes: 'Fresh stock' },
                    { _id: 't2', date: '2025-10-15', feedTypeId: '1', feedName: 'Cotton Seed Cake', quantity: 200, unit: 'kg', pricePerUnit: 32, totalCost: 6400, vendor: 'Agro Supplies', notes: '' },
                ];
                setTransactions(mockTransactions);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleOpenAddModal = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].slice(0, 5),
            feedTypeId: '',
            newFeedName: '',
            newFeedUnit: 'kg',
            quantity: '',
            pricePerUnit: '',
            vendor: '',
            notes: ''
        });
        setIsNewTypeMode(false);
        setIsAddModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.quantity || !formData.pricePerUnit || (!formData.feedTypeId && !formData.newFeedName)) return;

        setActionLoading(true);
        try {
            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Logic to update local state (Mock)
            const qty = parseFloat(formData.quantity);
            const price = parseFloat(formData.pricePerUnit);

            let feedName = '';
            let unit = 'kg';

            if (isNewTypeMode) {
                feedName = formData.newFeedName;
                unit = formData.newFeedUnit;
                // Add new type to list
                const newType = { _id: Date.now().toString(), name: feedName, unit };
                setFeedTypes(prev => [...prev, newType]);
            } else {
                const type = feedTypes.find(f => f._id === formData.feedTypeId);
                feedName = type?.name || 'Unknown';
                unit = type?.unit || 'kg';
            }

            // Add Transaction
            const newTx: StockTransaction = {
                _id: Date.now().toString(),
                date: formData.date,
                feedTypeId: isNewTypeMode ? 'new_id' : formData.feedTypeId,
                feedName,
                quantity: qty,
                unit,
                pricePerUnit: price,
                totalCost: qty * price,
                vendor: formData.vendor,
                notes: formData.notes
            };
            setTransactions(prev => [newTx, ...prev]);

            // Update Inventory (Mock Logic)
            setInventory(prev => {
                const existing = prev.find(i => i.feedName === feedName);
                if (existing) {
                    return prev.map(i => i.feedName === feedName ? {
                        ...i,
                        currentStock: i.currentStock + qty,
                        avgCost: ((i.avgCost * i.currentStock) + (price * qty)) / (i.currentStock + qty),
                        lastRestocked: formData.date
                    } : i);
                } else {
                    return [...prev, {
                        feedTypeId: newTx.feedTypeId,
                        feedName,
                        currentStock: qty,
                        unit,
                        avgCost: price,
                        lastRestocked: formData.date
                    }];
                }
            });

            setIsAddModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const stats = {
        totalValue: inventory.reduce((acc, i) => acc + (i.currentStock * i.avgCost), 0),
        lowStockItems: inventory.filter(i => i.currentStock < 100).length,
        totalItems: inventory.length
    };

    return (
        <Box className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <Paper elevation={0} className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <Box className="max-w-7xl mx-auto px-4 py-4">
                    <Box className="flex items-center justify-between">
                        <Box className="flex items-center">
                            <IconButton onClick={() => window.history.back()} className="mr-3">
                                <ArrowBack />
                            </IconButton>
                            <Box>
                                <Typography variant="h5" className="font-bold text-gray-900">
                                    Feed Inventory
                                </Typography>
                                <Typography variant="body2" className="text-gray-500">
                                    Manage stock, purchases, and consumption
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleOpenAddModal}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                px: 3
                            }}
                        >
                            Add Stock
                        </Button>
                    </Box>

                    {/* Quick Stats */}
                    {!loading && (
                        <Grid container spacing={3} className="mt-4 pb-2">
                            <Grid item xs={12} sm={4}>
                                <Paper className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                                    <Box>
                                        <Typography variant="caption" className="text-blue-600 font-bold uppercase tracking-wider">Total Inventory Value</Typography>
                                        <Typography variant="h5" className="font-bold text-gray-900 mt-1">₹{stats.totalValue.toLocaleString()}</Typography>
                                    </Box>
                                    <Box className="p-3 bg-white rounded-full text-blue-600">
                                        <AttachMoney />
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Paper className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between">
                                    <Box>
                                        <Typography variant="caption" className="text-orange-600 font-bold uppercase tracking-wider">Low Stock Items</Typography>
                                        <Typography variant="h5" className="font-bold text-gray-900 mt-1">{stats.lowStockItems}</Typography>
                                    </Box>
                                    <Box className="p-3 bg-white rounded-full text-orange-600">
                                        <Inventory2 />
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Paper className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                                    <Box>
                                        <Typography variant="caption" className="text-purple-600 font-bold uppercase tracking-wider">Feed Varieties</Typography>
                                        <Typography variant="h5" className="font-bold text-gray-900 mt-1">{stats.totalItems}</Typography>
                                    </Box>
                                    <Box className="p-3 bg-white rounded-full text-purple-600">
                                        <Storefront />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Paper>

            <Box className="max-w-7xl mx-auto px-4 py-6">
                {/* Tabs */}
                <Box className="flex border-b border-gray-200 mb-6">
                    <Box
                        className={`px-6 py-3 cursor-pointer font-medium text-sm transition-colors border-b-2 ${activeTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        Current Inventory
                    </Box>
                    <Box
                        className={`px-6 py-3 cursor-pointer font-medium text-sm transition-colors border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Purchase History
                    </Box>
                </Box>

                {/* Content */}
                {loading ? (
                    <Box className="flex justify-center p-12"><CircularProgress /></Box>
                ) : (
                    <Fade in={true}>
                        <Box>
                            {activeTab === 'inventory' && (
                                <Grid container spacing={3}>
                                    {inventory.map((item) => (
                                        <Grid item xs={12} md={6} lg={4} key={item.feedTypeId}>
                                            <Paper elevation={0} className="border border-gray-200 rounded-xl p-0 overflow-hidden hover:shadow-lg transition-shadow">
                                                <Box className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                                    <Box className="flex justify-between items-start">
                                                        <Box className="flex gap-3">
                                                            <Box className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                                                <Inventory2 fontSize="small" />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="h6" className="font-bold text-gray-800 leading-tight">{item.feedName}</Typography>
                                                                <Typography variant="caption" className="text-gray-500">Last restocked: {item.lastRestocked}</Typography>
                                                            </Box>
                                                        </Box>
                                                        {item.currentStock < 100 && (
                                                            <Chip label="Low Stock" size="small" color="warning" className="font-bold" />
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Box className="p-5">
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" className="text-gray-400 uppercase font-bold">In Stock</Typography>
                                                            <Typography variant="h5" className="font-bold text-gray-800">
                                                                {item.currentStock} <span className="text-sm text-gray-400 font-normal">{item.unit}</span>
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" className="text-gray-400 uppercase font-bold">Avg Cost</Typography>
                                                            <Typography variant="h5" className="font-bold text-gray-800">
                                                                ₹{item.avgCost.toFixed(1)} <span className="text-sm text-gray-400 font-normal">/{item.unit}</span>
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                    {inventory.length === 0 && (
                                        <Box className="w-full text-center py-12 text-gray-400">
                                            <Inventory2 sx={{ fontSize: 48, opacity: 0.2, mb: 2 }} />
                                            <Typography>No inventory records found. Add stock to get started.</Typography>
                                        </Box>
                                    )}
                                </Grid>
                            )}

                            {activeTab === 'history' && (
                                <Paper elevation={0} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <TableContainer>
                                        <Table>
                                            <TableHead className="bg-gray-50">
                                                <TableRow>
                                                    <TableCell className="font-bold">Date</TableCell>
                                                    <TableCell className="font-bold">Item</TableCell>
                                                    <TableCell className="font-bold">Vendor</TableCell>
                                                    <TableCell align="right" className="font-bold">Quantity</TableCell>
                                                    <TableCell align="right" className="font-bold">Rate</TableCell>
                                                    <TableCell align="right" className="font-bold">Total</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {transactions.map((tx) => (
                                                    <TableRow key={tx._id} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" className="font-semibold text-gray-700">{tx.date}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" className="font-bold text-gray-800">{tx.feedName}</Typography>
                                                            {tx.notes && <Typography variant="caption" className="text-gray-400 italic block">{tx.notes}</Typography>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" className="text-gray-600">{tx.vendor || '-'}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Chip label={`${tx.quantity} ${tx.unit}`} size="small" variant="outlined" />
                                                        </TableCell>
                                                        <TableCell align="right" className="text-gray-600">₹{tx.pricePerUnit}</TableCell>
                                                        <TableCell align="right" className="font-bold text-green-600">₹{tx.totalCost.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {transactions.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" className="py-8 text-gray-400">
                                                            No purchase history available.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            )}
                        </Box>
                    </Fade>
                )}
            </Box>

            {/* Add Stock Modal */}
            <Dialog
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: { borderRadius: 16 }
                }}
            >
                <DialogTitle className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <Typography variant="h6" className="font-bold text-gray-800">
                        Record Feed Purchase
                    </Typography>
                    <IconButton onClick={() => setIsAddModalOpen(false)} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent className="py-6">
                    <Grid container spacing={3} className="mt-1">
                        {/* Date & Time */}
                        <Grid item xs={6}>
                            <TextField
                                label="Date"
                                type="date"
                                fullWidth
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Time"
                                type="time"
                                fullWidth
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Feed Type Selection */}
                        <Grid item xs={12}>
                            {isNewTypeMode ? (
                                <Box className="flex gap-2 items-start">
                                    <TextField
                                        label="New Feed Name"
                                        fullWidth
                                        value={formData.newFeedName}
                                        onChange={(e) => setFormData({ ...formData, newFeedName: e.target.value })}
                                        placeholder="e.g. Groundnut Cake"
                                        autoFocus
                                    />
                                    <TextField
                                        label="Unit"
                                        select
                                        value={formData.newFeedUnit}
                                        onChange={(e) => setFormData({ ...formData, newFeedUnit: e.target.value })}
                                        sx={{ width: 100 }}
                                    >
                                        <MenuItem value="kg">kg</MenuItem>
                                        <MenuItem value="bag">bag</MenuItem>
                                        <MenuItem value="ton">ton</MenuItem>
                                    </TextField>
                                    <IconButton onClick={() => setIsNewTypeMode(false)} className="mt-2 text-gray-400">
                                        <Close />
                                    </IconButton>
                                </Box>
                            ) : (
                                <FormControl fullWidth>
                                    <InputLabel>Feed Type</InputLabel>
                                    <Select
                                        value={formData.feedTypeId}
                                        label="Feed Type"
                                        onChange={(e) => {
                                            if (e.target.value === 'new') {
                                                setIsNewTypeMode(true);
                                                setFormData({ ...formData, feedTypeId: '' });
                                            } else {
                                                setFormData({ ...formData, feedTypeId: e.target.value });
                                            }
                                        }}
                                    >
                                        {feedTypes.map(type => (
                                            <MenuItem key={type._id} value={type._id}>{type.name}</MenuItem>
                                        ))}
                                        <MenuItem value="new" className="text-blue-600 font-bold border-t border-gray-100 mt-1">
                                            + Add New Feed Type
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        </Grid>

                        {/* Quantity & Rate */}
                        <Grid item xs={6}>
                            <TextField
                                label="Quantity"
                                type="number"
                                fullWidth
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">{isNewTypeMode ? formData.newFeedUnit : (feedTypes.find(f => f._id === formData.feedTypeId)?.unit || 'kg')}</InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Price per Unit"
                                type="number"
                                fullWidth
                                value={formData.pricePerUnit}
                                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                }}
                            />
                        </Grid>

                        {/* Total Cost Preview */}
                        <Grid item xs={12}>
                            <Paper className="p-3 bg-gray-50 flex justify-between items-center border border-gray-200 rounded-lg">
                                <Typography variant="body2" className="text-gray-600 font-medium">Total Cost:</Typography>
                                <Typography variant="h6" className="text-green-600 font-bold">
                                    ₹{formData.quantity && formData.pricePerUnit ? (parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit)).toLocaleString() : '0'}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Vendor & Notes */}
                        <Grid item xs={12}>
                            <TextField
                                label="Vendor / Source"
                                fullWidth
                                value={formData.vendor}
                                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                placeholder="e.g. Local Market"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Notes"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional details..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className="p-4 border-t border-gray-100 bg-gray-50">
                    <Button onClick={() => setIsAddModalOpen(false)} className="text-gray-500">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={actionLoading}
                        sx={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
                            px: 4
                        }}
                    >
                        {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Record'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
