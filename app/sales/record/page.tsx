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
    LinearProgress,
    Breadcrumbs,
    Link,
    IconButton,
    Chip
} from '@mui/material';
import {
    CalendarMonth,
    ArrowBack,
    NavigateNext,
    Add,
    CheckCircle,
    Warning
} from '@mui/icons-material';
import StickyFooter, { SummaryData } from '../../components/ui/StickyFooter';
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

    const loadData = async () => {
        setFetchingCustomers(true);
        fetchProductionStats();

        try {
            const [custRes, salesRes] = await Promise.all([
                fetch('/api/customers'),
                fetch(`/api/sales?date=${date}`)
            ]);

            const custData = await custRes.json();
            const salesDataResp = await salesRes.json();

            if (custData.success) {
                setCustomers(custData.data);

                const existingSales = salesDataResp.success && Array.isArray(salesDataResp.data) ? salesDataResp.data : [];

                // Filter sales for this customer and ensure date matches (safety check)
                const combined = custData.data.map((c: Customer) => {
                    const customerSales = existingSales.filter((s: any) => {
                        const saleDate = new Date(s.date).toISOString().split('T')[0];
                        return s.customerId === c._id && saleDate === date;
                    });

                    const morning = customerSales.find((s: any) => s.notes && s.notes.includes('Morning'));
                    const evening = customerSales.find((s: any) => s.notes && s.notes.includes('Evening'));

                    return {
                        _id: c._id,
                        customerId: c._id,
                        name: c.name,
                        morningQty: morning?.quantityInLiters || 0,
                        morningFat: morning?.fat || 4.5,
                        morningRate: morning?.pricePerLiter || 45,
                        eveningQty: evening?.quantityInLiters || 0,
                        eveningFat: evening?.fat || 4.5,
                        eveningRate: evening?.pricePerLiter || 45
                    };
                });
                setSalesData(combined);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setSnackbar({
                open: true,
                message: 'Failed to load data',
                severity: 'error',
            });
        } finally {
            setFetchingCustomers(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [date]);

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
                loadData();
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-0 transition-colors duration-300 flex flex-col relative">
            {/* Progress Bar */}
            <div className='sticky top-0 z-50 w-full'>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 6,
                        backgroundColor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }
                    }}
                />
            </div>

            <div className="w-full px-4 md:px-8 py-6 flex-grow">
                {/* Header */}
                <div className="mb-8">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="mb-4">
                        <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer text-slate-500 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                            Dashboard
                        </Link>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">Sales Record</span>
                    </Breadcrumbs>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center w-full md:w-auto">
                            <IconButton onClick={() => router.back()} className="mr-4 bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                                <ArrowBack />
                            </IconButton>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                                    Daily Sales Record
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Reconcile production with sales
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                            {!isReadOnly && (
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setIsCustomerModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all"
                                    sx={{ textTransform: 'none', borderRadius: '12px' }}
                                >
                                    Add Customer
                                </Button>
                            )}
                            <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center shadow-sm">
                                <CalendarMonth className="text-blue-600 dark:text-blue-400 mr-2" />
                                <TextField
                                    type="date"
                                    value={date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    disabled={isReadOnly}
                                    variant="standard"
                                    InputProps={{ disableUnderline: true, className: "text-slate-800 dark:text-white font-semibold" }}
                                    sx={{ '& input': { fontSize: '1rem', fontWeight: 600, color: 'inherit', cursor: 'pointer' } }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance / Reconciliation Card */}
                <div className="animate-fade-in-up mb-6">
                    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-wrap gap-6 items-center justify-between transition-colors">
                        <div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Production</span>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalProduced.toFixed(1)} L</div>
                        </div>
                        <div className="hidden md:block text-slate-300 dark:text-slate-700 mx-2 text-2xl">-</div>
                        <div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Sales</span>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalSaleQuantity.toFixed(1)} L</div>
                        </div>
                        <div className="hidden md:block text-slate-300 dark:text-slate-700 mx-2 text-2xl">-</div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Waste / Personal</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="w-24 p-1 bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-lg focus:outline-none focus:border-blue-500 transition-colors rounded-t"
                                    value={wasteQty}
                                    onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)}
                                    disabled={isReadOnly}
                                    min="0" step="0.1"
                                    placeholder="0"
                                />
                                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">L</span>
                            </div>
                        </div>
                        <div className="hidden md:block text-slate-300 dark:text-slate-700 mx-2 text-2xl">=</div>
                        <div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Balance</span>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isBalanced ? 'bg-green-100/50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100/50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                <span className="text-xl font-bold">
                                    {balance > 0 ? '+' : ''}{balance.toFixed(1)} L
                                </span>
                                {isBalanced ? <CheckCircle fontSize="small" /> : <Warning fontSize="small" />}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                        <th rowSpan={2} className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 w-[20%]">Customer</th>
                                        <th colSpan={4} className="py-2 px-4 text-center border-l border-r border-slate-200 dark:border-slate-800 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10">
                                            Morning Session
                                        </th>
                                        <th colSpan={4} className="py-2 px-4 text-center border-l border-r border-slate-200 dark:border-slate-800 font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-900/10">
                                            Evening Session
                                        </th>
                                        <th rowSpan={2} className="py-4 px-6 font-semibold text-right text-slate-700 dark:text-slate-300 w-[10%]">Total (₹)</th>
                                    </tr>
                                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        {/* Morning Headers */}
                                        <th className="py-2 px-2 text-center text-[10px] md:text-xs">Qty (L)</th>
                                        <th className="py-2 px-2 text-center text-[10px] md:text-xs">Fat (%)</th>
                                        <th className="py-2 px-2 text-center text-[10px] md:text-xs">Rate (₹)</th>
                                        <th className="py-2 px-2 text-center text-[10px] md:text-xs text-blue-600 dark:text-blue-400">Amt</th>

                                        {/* Evening Headers */}
                                        <th className="py-2 px-2 text-center text-[10px] md:text-xs">Qty (L)</th>
                                        <th className="py-2 px-2 text-center text-[10px] md:text-xs">Fat (%)</th>
                                        <th className="py-2 px-2 text-center text-[10px] md:text-xs">Rate (₹)</th>
                                        <th className="py-2 px-2 text-center text-[10px] md:text-xs text-purple-600 dark:text-purple-400">Amt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {fetchingCustomers ? (
                                        <tr>
                                            <td colSpan={10} className="py-12 text-center">
                                                <CircularProgress size={32} className="text-blue-600" />
                                            </td>
                                        </tr>
                                    ) : (
                                        salesData.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-white">{item.name}</td>

                                                {/* Morning Inputs */}
                                                <td className="p-2 border-l border-slate-100 dark:border-slate-800">
                                                    <input
                                                        disabled={isReadOnly}
                                                        type="number" min="0" step="0.1" placeholder="0"
                                                        className="w-full text-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 font-bold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                                        value={item.morningQty || ''}
                                                        onChange={(e) => handleInputChange(item.customerId, 'morningQty', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number" min="0" step="0.1"
                                                        className="w-full text-center p-1.5 bg-transparent text-slate-500 dark:text-slate-400 text-sm focus:text-slate-800 dark:focus:text-white outline-none"
                                                        value={item.morningFat}
                                                        onChange={(e) => handleInputChange(item.customerId, 'morningFat', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        disabled={isReadOnly}
                                                        type="number" min="0"
                                                        className="w-full text-center p-1.5 bg-transparent text-slate-500 dark:text-slate-400 text-sm focus:text-slate-800 dark:focus:text-white outline-none"
                                                        value={item.morningRate}
                                                        onChange={(e) => handleInputChange(item.customerId, 'morningRate', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2 text-center font-medium text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                                                    {(item.morningQty * item.morningRate).toFixed(0)}
                                                </td>

                                                {/* Evening Inputs */}
                                                <td className="p-2 border-l border-slate-100 dark:border-slate-800">
                                                    <input
                                                        type="number" min="0" step="0.1" placeholder="0"
                                                        className="w-full text-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-purple-600 dark:text-purple-400 font-bold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                                                        value={item.eveningQty || ''}
                                                        onChange={(e) => handleInputChange(item.customerId, 'eveningQty', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number" min="0" step="0.1"
                                                        className="w-full text-center p-1.5 bg-transparent text-slate-500 dark:text-slate-400 text-sm focus:text-slate-800 dark:focus:text-white outline-none"
                                                        value={item.eveningFat}
                                                        onChange={(e) => handleInputChange(item.customerId, 'eveningFat', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number" min="0"
                                                        className="w-full text-center p-1.5 bg-transparent text-slate-500 dark:text-slate-400 text-sm focus:text-slate-800 dark:focus:text-white outline-none"
                                                        value={item.eveningRate}
                                                        onChange={(e) => handleInputChange(item.customerId, 'eveningRate', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2 text-center font-medium text-slate-600 dark:text-slate-300">
                                                    {(item.eveningQty * item.eveningRate).toFixed(0)}
                                                </td>

                                                {/* Total */}
                                                <td className="py-3 px-6 text-right font-bold text-green-600 dark:text-green-400">
                                                    {(
                                                        (item.morningQty * item.morningRate) +
                                                        (item.eveningQty * item.eveningRate)
                                                    ).toFixed(0)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="block md:hidden pb-2 space-y-4">
                        {salesData.map((item) => (
                            <div key={item._id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="font-bold text-slate-800 dark:text-white text-base">{item.name}</h3>
                                    <Chip
                                        label={`₹${((item.morningQty * item.morningRate) + (item.eveningQty * item.eveningRate)).toFixed(0)}`}
                                        className="font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none"
                                        size="small"
                                    />
                                </div>

                                {/* Morning */}
                                <div className="mb-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                    <div className="flex items-center mb-2">
                                        <span className="text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center">
                                            ☀️ Morning
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <span className="text-blue-500 dark:text-blue-400 text-[10px] font-semibold block mb-1">QTY (L)</span>
                                            <input
                                                disabled={isReadOnly}
                                                type="number" step="0.1" placeholder="0"
                                                className="w-full p-2 border border-blue-200 dark:border-blue-800/50 rounded-lg text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 font-bold text-blue-900 dark:text-blue-100"
                                                value={item.morningQty || ''}
                                                onChange={(e) => handleInputChange(item.customerId, 'morningQty', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-blue-500 dark:text-blue-400 text-[10px] font-semibold block mb-1">FAT (%)</span>
                                            <input
                                                type="number" step="0.1"
                                                className="w-full p-2 border border-blue-200 dark:border-blue-800/50 rounded-lg text-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-blue-300 outline-none"
                                                value={item.morningFat}
                                                onChange={(e) => handleInputChange(item.customerId, 'morningFat', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-blue-500 dark:text-blue-400 text-[10px] font-semibold block mb-1">RATE</span>
                                            <input
                                                disabled={isReadOnly}
                                                type="number"
                                                className="w-full p-2 border border-blue-200 dark:border-blue-800/50 rounded-lg text-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-blue-300 outline-none"
                                                value={item.morningRate}
                                                onChange={(e) => handleInputChange(item.customerId, 'morningRate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Evening */}
                                <div className="bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-800/30">
                                    <div className="flex items-center mb-2">
                                        <span className="text-purple-800 dark:text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center">
                                            🌙 Evening
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <span className="text-purple-500 dark:text-purple-400 text-[10px] font-semibold block mb-1">QTY (L)</span>
                                            <input
                                                disabled={isReadOnly}
                                                type="number" step="0.1" placeholder="0"
                                                className="w-full p-2 border border-purple-200 dark:border-purple-800/50 rounded-lg text-center text-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-950 font-bold text-purple-900 dark:text-purple-100"
                                                value={item.eveningQty || ''}
                                                onChange={(e) => handleInputChange(item.customerId, 'eveningQty', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-purple-500 dark:text-purple-400 text-[10px] font-semibold block mb-1">FAT (%)</span>
                                            <input
                                                type="number" step="0.1"
                                                className="w-full p-2 border border-purple-200 dark:border-purple-800/50 rounded-lg text-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-purple-300 outline-none"
                                                value={item.eveningFat}
                                                onChange={(e) => handleInputChange(item.customerId, 'eveningFat', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-purple-500 dark:text-purple-400 text-[10px] font-semibold block mb-1">RATE</span>
                                            <input
                                                disabled={isReadOnly}
                                                type="number"
                                                className="w-full p-2 border border-purple-200 dark:border-purple-800/50 rounded-lg text-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-purple-300 outline-none"
                                                value={item.eveningRate}
                                                onChange={(e) => handleInputChange(item.customerId, 'eveningRate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <StickyFooter
                summary={<SummaryData stats={[
                    { label: 'Sales Qty', value: totalSaleQuantity.toFixed(1), unit: 'L', valueColor: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Waste', value: wasteQty.toFixed(1), unit: 'L', valueColor: 'text-red-500 dark:text-red-400' },
                    { label: 'Total Value', value: `₹${totalAmount.toFixed(0)}`, valueColor: 'text-green-600 dark:text-green-400' }
                ]} />}
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
        </div>
    );
}
