'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Breadcrumbs,
    Link,
    IconButton,
    Chip
} from '@mui/material';
import {
    CalendarMonth,
    LocalDrink,
    AttachMoney,
    Person,
    ArrowBack,
    NavigateNext,
    Add,
    CheckCircle,
    Warning
} from '@mui/icons-material';
import StickyFooter from '../../components/ui/StickyFooter';
import AddCustomerModal from '../../components/forms/AddCustomerModal';

interface Customer {
    _id: string;
    name: string;
    phone: string;
    address?: string;
}

interface SalesData {
    _id: string;
    customerId: string;
    name: string;

    morningQty: number;
    morningFat: number;
    morningRate: number;

    eveningQty: number;
    eveningFat: number;
    eveningRate: number;
}

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export default function SalesRecordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read query params
    const urlDate = searchParams.get('date');
    const isReadOnly = searchParams.get('readonly') === 'true';

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [date, setDate] = useState(urlDate || getTodayDate());

    // Sync state if URL changes (e.g. back button)
    useEffect(() => {
        const currentUrlDate = searchParams.get('date');
        if (currentUrlDate && currentUrlDate !== date) {
            setDate(currentUrlDate);
        }
    }, [searchParams]);

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', newDate);
        router.push(`/sales/record?${params.toString()}`);
    };
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCustomers, setFetchingCustomers] = useState(true);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: SnackbarSeverity;
    }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const [productionData, setProductionData] = useState<{ total: number } | null>(null);
    const [wasteQty, setWasteQty] = useState(0);

    useEffect(() => {
        fetchCustomers();
        fetchProductionStats();
    }, [date]);

    const fetchProductionStats = async () => {
        try {
            // Assuming /api/milk supports ?date=YYYY-MM-DD
            const response = await fetch(`/api/milk?date=${date}`);
            const data = await response.json();
            if (data.success && data.data) {
                const total = data.data.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
                setProductionData({ total });
            } else {
                setProductionData({ total: 0 });
            }
        } catch (error) {
            console.error('Error fetching production:', error);
            setProductionData({ total: 0 });
        }
    };

    const fetchCustomers = async () => {
        try {
            setFetchingCustomers(true);
            const response = await fetch('/api/customers');
            const data = await response.json();

            if (data.success) {
                setCustomers(data.data);
                // Initialize sales data
                setSalesData(
                    data.data.map((c: Customer) => ({
                        _id: c._id,
                        customerId: c._id,
                        name: c.name,
                        morningQty: 0,
                        morningFat: 4.5,
                        morningRate: 45,
                        eveningQty: 0,
                        eveningFat: 4.5,
                        eveningRate: 45
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch customers',
                severity: 'error',
            });
        } finally {
            setFetchingCustomers(false);
        }
    };

    const handleCustomerAdded = (newCustomer: any) => {
        setCustomers(prev => [...prev, newCustomer]);
        setSalesData(prev => [
            ...prev,
            {
                _id: newCustomer._id,
                customerId: newCustomer._id,
                name: newCustomer.name,
                morningQty: 0,
                morningFat: 4.5,
                morningRate: 45,
                eveningQty: 0,
                eveningFat: 4.5,
                eveningRate: 45
            }
        ]);
        setSnackbar({
            open: true,
            message: 'Customer added successfully!',
            severity: 'success',
        });
    };

    const handleInputChange = (
        customerId: string,
        field: keyof SalesData,
        value: string
    ) => {
        const numValue = parseFloat(value);
        const val = isNaN(numValue) ? 0 : numValue;

        setSalesData((prev) =>
            prev.map((item) =>
                item.customerId === customerId ? { ...item, [field]: val } : item
            )
        );
    };

    const calculateTotal = () => {
        return salesData.reduce((acc, item) => {
            const morningVal = item.morningQty * item.morningRate;
            const eveningVal = item.eveningQty * item.eveningRate;
            return acc + morningVal + eveningVal;
        }, 0);
    };

    const totalSaleQuantity = salesData.reduce((acc, item) => acc + item.morningQty + item.eveningQty, 0);
    const totalAmount = calculateTotal();

    // Reconciliation
    const totalProduced = productionData?.total || 0;
    const balance = totalProduced - (totalSaleQuantity + wasteQty);
    const isBalanced = Math.abs(balance) < 0.1;

    // Progress
    const activeEntries = salesData.filter(s => s.morningQty > 0 || s.eveningQty > 0).length;
    const progress = customers.length > 0 ? (activeEntries / customers.length) * 100 : 0;

    const handleSubmit = async () => {
        if (!date) {
            setSnackbar({ open: true, message: 'Please select a date', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            const activeSales = salesData.filter(s => s.morningQty > 0 || s.eveningQty > 0);

            const promises = [];

            for (const sale of activeSales) {
                // Morning
                if (sale.morningQty > 0) {
                    promises.push(fetch('/api/sales', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            date,
                            customerId: sale.customerId,
                            clientName: sale.name,
                            quantityInLiters: sale.morningQty,
                            pricePerLiter: sale.morningRate,
                            fat: sale.morningFat,
                            totalAmount: sale.morningQty * sale.morningRate,
                            paymentStatus: 'pending',
                            notes: `Session: Morning, Fat: ${sale.morningFat}%`
                        })
                    }));
                }
                // Evening
                if (sale.eveningQty > 0) {
                    promises.push(fetch('/api/sales', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            date,
                            customerId: sale.customerId,
                            clientName: sale.name,
                            quantityInLiters: sale.eveningQty,
                            pricePerLiter: sale.eveningRate,
                            fat: sale.eveningFat,
                            totalAmount: sale.eveningQty * sale.eveningRate,
                            paymentStatus: 'pending',
                            notes: `Session: Evening, Fat: ${sale.eveningFat}%`
                        })
                    }));
                }
            }

            // Should also save waste record if needed, for now just UI validation

            await Promise.all(promises);

            setSnackbar({
                open: true,
                message: '💵 Sales records saved successfully!',
                severity: 'success',
            });

            // Reset quantities but keep customers/rates
            setTimeout(() => {
                fetchCustomers();
                setWasteQty(0);
            }, 1500);

        } catch (error) {
            console.error('Error saving sales:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save sales. Please try again.',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="min-h-screen bg-gray-50 pb-40">
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 6,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }
                }}
            />

            <Box className="max-w-[95%] mx-auto px-4 py-6">
                <Box className="mb-8">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="mb-4">
                        <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer">
                            Dashboard
                        </Link>
                        <Typography color="text.primary">Sales Record</Typography>
                    </Breadcrumbs>

                    <Box className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <Box className="flex items-center w-full md:w-auto">
                            <IconButton onClick={() => router.back()} className="mr-4 bg-white shadow-sm hover:bg-gray-50">
                                <ArrowBack />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" className="font-bold text-gray-800">
                                    Daily Sales Record
                                </Typography>
                                <Typography variant="body1" className="text-gray-500">
                                    Reconcile production with sales
                                </Typography>
                            </Box>
                        </Box>

                        <Box className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                            {!isReadOnly && (
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setIsCustomerModalOpen(true)}
                                    sx={{ bgcolor: '#3b82f6' }}
                                >
                                    Add Customer
                                </Button>
                            )}
                            <Paper className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center">
                                <CalendarMonth className="text-blue-600 mr-2" />
                                <TextField
                                    type="date"
                                    value={date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    disabled={isReadOnly}
                                    variant="standard"
                                    InputProps={{ disableUnderline: true }}
                                    sx={{ '& input': { fontSize: '1.1rem', fontWeight: 600, color: '#1e40af' } }}
                                />
                            </Paper>
                        </Box>
                    </Box>
                </Box>

                {/* Balance / Reconciliation Card */}
                <Fade in={true}>
                    <Paper elevation={0} className="mb-6 p-4 border border-gray-200 rounded-xl bg-white flex flex-wrap gap-6 items-center justify-between">
                        <Box>
                            <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Total Production</Typography>
                            <Typography variant="h5" className="font-bold text-blue-600">{totalProduced.toFixed(1)} L</Typography>
                        </Box>
                        <Box className="hidden md:block text-gray-300 mx-2 text-2xl">-</Box>
                        <Box>
                            <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Total Sales</Typography>
                            <Typography variant="h5" className="font-bold text-green-600">{totalSaleQuantity.toFixed(1)} L</Typography>
                        </Box>
                        <Box className="hidden md:block text-gray-300 mx-2 text-2xl">-</Box>
                        <Box className="flex flex-col">
                            <Typography variant="caption" className="text-gray-500 font-semibold uppercase mb-1">Waste / Personal</Typography>
                            <Box className="flex items-center gap-2">
                                <TextField
                                    type="number"
                                    size="small"
                                    value={wasteQty}
                                    onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)}
                                    disabled={isReadOnly}
                                    className="w-24"
                                    inputProps={{ min: 0, step: 0.1 }}
                                    placeholder="0"
                                />
                                <Typography variant="body2" className="text-gray-500">L</Typography>
                            </Box>
                        </Box>
                        <Box className="hidden md:block text-gray-300 mx-2 text-2xl">=</Box>
                        <Box>
                            <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Balance</Typography>
                            <Box className={`flex items-center gap-2 px-3 py-1 rounded-full ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <Typography variant="h6" className="font-bold">
                                    {balance > 0 ? '+' : ''}{balance.toFixed(1)} L
                                </Typography>
                                {isBalanced ? <CheckCircle fontSize="small" /> : <Warning fontSize="small" />}
                            </Box>
                        </Box>
                    </Paper>
                </Fade>

                <Fade in={true} timeout={800}>
                    <Box>
                        <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                            <Box>
                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                    <Paper elevation={0} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm text-sm">
                                        <TableContainer sx={{ maxHeight: '60vh' }}>
                                            <Table stickyHeader size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell rowSpan={2} className="font-bold bg-gray-50" width="15%">Customer</TableCell>
                                                        <TableCell colSpan={4} align="center" className="font-bold bg-blue-50 text-blue-800 border-l border-r border-blue-100">
                                                            Morning Session
                                                        </TableCell>
                                                        <TableCell colSpan={4} align="center" className="font-bold bg-purple-50 text-purple-800 border-l border-r border-purple-100">
                                                            Evening Session
                                                        </TableCell>
                                                        <TableCell rowSpan={2} align="right" className="font-bold bg-gray-50" width="10%">Total (₹)</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        {/* Morning Headers */}
                                                        <TableCell align="center" className="bg-blue-50 text-xs text-gray-500">Qty (L)</TableCell>
                                                        <TableCell align="center" className="bg-blue-50 text-xs text-gray-500">Fat (%)</TableCell>
                                                        <TableCell align="center" className="bg-blue-50 text-xs text-gray-500">Rate (₹)</TableCell>
                                                        <TableCell align="center" className="bg-blue-50 text-xs font-semibold text-blue-700">Amt</TableCell>

                                                        {/* Evening Headers */}
                                                        <TableCell align="center" className="bg-purple-50 text-xs text-gray-500">Qty (L)</TableCell>
                                                        <TableCell align="center" className="bg-purple-50 text-xs text-gray-500">Fat (%)</TableCell>
                                                        <TableCell align="center" className="bg-purple-50 text-xs text-gray-500">Rate (₹)</TableCell>
                                                        <TableCell align="center" className="bg-purple-50 text-xs font-semibold text-purple-700">Amt</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {fetchingCustomers ? (
                                                        <TableRow>
                                                            <TableCell colSpan={10} align="center" className="py-8">
                                                                <CircularProgress size={24} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        salesData.map((item) => (
                                                            <TableRow key={item._id} hover>
                                                                <TableCell className="font-semibold">{item.name}</TableCell>

                                                                {/* Morning Inputs */}
                                                                <TableCell className="border-l border-blue-50">
                                                                    <input
                                                                        disabled={isReadOnly}
                                                                        type="number"
                                                                        min="0" step="0.1"
                                                                        className="w-16 p-1 border rounded text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                                                        value={item.morningQty || ''}
                                                                        onChange={(e) => handleInputChange(item.customerId, 'morningQty', e.target.value)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <input
                                                                        type="number"
                                                                        min="0" step="0.1"
                                                                        className="w-12 p-1 border rounded text-right text-gray-500 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                                                        value={item.morningFat}
                                                                        onChange={(e) => handleInputChange(item.customerId, 'morningFat', e.target.value)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <input
                                                                        disabled={isReadOnly}
                                                                        type="number"
                                                                        min="0"
                                                                        className="w-14 p-1 border rounded text-right text-gray-500 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                                                        value={item.morningRate}
                                                                        onChange={(e) => handleInputChange(item.customerId, 'morningRate', e.target.value)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right" className="border-r border-blue-50 font-medium text-blue-700">
                                                                    {(item.morningQty * item.morningRate).toFixed(0)}
                                                                </TableCell>

                                                                {/* Evening Inputs */}
                                                                <TableCell className="border-l border-purple-50">
                                                                    <input
                                                                        type="number"
                                                                        min="0" step="0.1"
                                                                        className="w-16 p-1 border rounded text-right focus:ring-2 focus:ring-purple-500 outline-none"
                                                                        value={item.eveningQty || ''}
                                                                        onChange={(e) => handleInputChange(item.customerId, 'eveningQty', e.target.value)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <input
                                                                        type="number"
                                                                        min="0" step="0.1"
                                                                        className="w-12 p-1 border rounded text-right text-gray-500 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-purple-500 outline-none"
                                                                        value={item.eveningFat}
                                                                        onChange={(e) => handleInputChange(item.customerId, 'eveningFat', e.target.value)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        className="w-14 p-1 border rounded text-right text-gray-500 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-purple-500 outline-none"
                                                                        value={item.eveningRate}
                                                                        onChange={(e) => handleInputChange(item.customerId, 'eveningRate', e.target.value)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right" className="border-r border-purple-50 font-medium text-purple-700">
                                                                    {(item.eveningQty * item.eveningRate).toFixed(0)}
                                                                </TableCell>

                                                                {/* Total */}
                                                                <TableCell align="right" className="font-bold text-green-700 bg-green-50">
                                                                    {(
                                                                        (item.morningQty * item.morningRate) +
                                                                        (item.eveningQty * item.eveningRate)
                                                                    ).toFixed(0)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Box>

                                {/* Mobile View: Cards */}
                                <Box sx={{ display: { xs: 'block', md: 'none' }, pb: 2 }}>
                                    {salesData.map((item) => (
                                        <Paper key={item._id} elevation={0} className="mb-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                                            <Box className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                                <Typography variant="h6" className="font-bold text-gray-800 text-base">{item.name}</Typography>
                                                <Chip
                                                    label={`₹${((item.morningQty * item.morningRate) + (item.eveningQty * item.eveningRate)).toFixed(0)}`}
                                                    color="success"
                                                    size="small"
                                                    className="font-bold bg-green-100 text-green-800 border-none"
                                                />
                                            </Box>

                                            {/* Morning */}
                                            <Box className="mb-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                                <Box className="flex items-center mb-2">
                                                    <Typography variant="caption" className="text-blue-800 font-bold uppercase tracking-wider flex items-center">
                                                        ☀️ Morning
                                                    </Typography>
                                                </Box>
                                                <Box className="grid grid-cols-3 gap-2">
                                                    <Box>
                                                        <Typography variant="caption" className="text-blue-500 text-[10px] font-semibold">QTY (L)</Typography>
                                                        <input
                                                            disabled={isReadOnly}
                                                            type="number" step="0.1"
                                                            className="w-full p-2 border border-blue-200 rounded-lg text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-blue-900"
                                                            value={item.morningQty || ''}
                                                            onChange={(e) => handleInputChange(item.customerId, 'morningQty', e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" className="text-blue-500 text-[10px] font-semibold">FAT (%)</Typography>
                                                        <input
                                                            type="number" step="0.1"
                                                            className="w-full p-2 border border-blue-200 rounded-lg text-center text-gray-500 bg-white/50 focus:bg-white focus:ring-1 focus:ring-blue-300 outline-none"
                                                            value={item.morningFat}
                                                            onChange={(e) => handleInputChange(item.customerId, 'morningFat', e.target.value)}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" className="text-blue-500 text-[10px] font-semibold">RATE</Typography>
                                                        <input
                                                            disabled={isReadOnly}
                                                            type="number"
                                                            className="w-full p-2 border border-blue-200 rounded-lg text-center text-gray-500 bg-white/50 focus:bg-white focus:ring-1 focus:ring-blue-300 outline-none"
                                                            value={item.morningRate}
                                                            onChange={(e) => handleInputChange(item.customerId, 'morningRate', e.target.value)}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Evening */}
                                            <Box className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                                                <Box className="flex items-center mb-2">
                                                    <Typography variant="caption" className="text-purple-800 font-bold uppercase tracking-wider flex items-center">
                                                        🌙 Evening
                                                    </Typography>
                                                </Box>
                                                <Box className="grid grid-cols-3 gap-2">
                                                    <Box>
                                                        <Typography variant="caption" className="text-purple-500 text-[10px] font-semibold">QTY (L)</Typography>
                                                        <input
                                                            disabled={isReadOnly}
                                                            type="number" step="0.1"
                                                            className="w-full p-2 border border-purple-200 rounded-lg text-center text-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white font-bold text-purple-900"
                                                            value={item.eveningQty || ''}
                                                            onChange={(e) => handleInputChange(item.customerId, 'eveningQty', e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" className="text-purple-500 text-[10px] font-semibold">FAT (%)</Typography>
                                                        <input
                                                            type="number" step="0.1"
                                                            className="w-full p-2 border border-purple-200 rounded-lg text-center text-gray-500 bg-white/50 focus:bg-white focus:ring-1 focus:ring-purple-300 outline-none"
                                                            value={item.eveningFat}
                                                            onChange={(e) => handleInputChange(item.customerId, 'eveningFat', e.target.value)}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" className="text-purple-500 text-[10px] font-semibold">RATE</Typography>
                                                        <input
                                                            disabled={isReadOnly}
                                                            type="number"
                                                            className="w-full p-2 border border-purple-200 rounded-lg text-center text-gray-500 bg-white/50 focus:bg-white focus:ring-1 focus:ring-purple-300 outline-none"
                                                            value={item.eveningRate}
                                                            onChange={(e) => handleInputChange(item.customerId, 'eveningRate', e.target.value)}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            </Box>
                        </Zoom>
                    </Box>
                </Fade>

            </Box>

            <StickyFooter
                stats={[
                    { label: 'Sales Qty', value: totalSaleQuantity.toFixed(1), unit: 'L', valueColor: 'text-blue-600' },
                    { label: 'Waste', value: wasteQty.toFixed(1), unit: 'L', valueColor: 'text-red-500' },
                    { label: 'Total Value', value: `₹${totalAmount.toFixed(0)}`, valueColor: 'text-green-600' }
                ]}
                submitButton={{
                    text: 'Save Sales',
                    onClick: handleSubmit,
                    loading: loading,
                    disabled: loading || isReadOnly
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
