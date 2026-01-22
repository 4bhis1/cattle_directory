"use client";

import React, { useEffect, useState } from 'react';
import { 
    Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Pagination, Select, MenuItem, FormControl, InputLabel, TextField, 
    Drawer, Tooltip, Chip
} from '@mui/material';
import { 
    AttachMoney, TrendingUp, TrendingDown, AccountBalanceWallet,
    ChevronRight, Add, BarChart, Download, Close
} from '@mui/icons-material';
import { 
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '@/lib/apiService';
import Loader from '../ui/Loader';
import dayjs from 'dayjs';
import { TopHeader } from '@/app/components/ui/Header';
import { TableToolbar } from '@/app/components/Table/TableToolbar';
import { TablePagination } from '@/app/components/Table/TablePagination';
import AddTransactionDrawer from './AddTransactionDrawer';

// --- Types ---
type ProfitLossStat = {
    dateGroup: string | any;
    income: number;
    expense: number;
    otherIncome: number;
    milkIncome: number;
    txCount: number;
}

type DashboardData = {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    chartData: any[]; // Formatted for recharts
}

const ProfitLossDashboard = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    
    // KPIs & Chart Data
    const [data, setData] = useState<DashboardData>({
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        chartData: []
    });

    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');

    // Analytics State
    const [filters, setFilters] = useState({
        startDate: dateParam ? dateParam : dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dateParam ? dateParam : dayjs().endOf('month').format('YYYY-MM-DD'),
        groupBy: 'day' as 'day' | 'week' | 'month'
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [analyticsData, setAnalyticsData] = useState<ProfitLossStat[]>([]);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [addTransactionOpen, setAddTransactionOpen] = useState(false);

    // Load Analytics Data
    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const query = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate,
                groupBy: filters.groupBy,
                page: page.toString(),
                limit: limit.toString()
            });

            const res = await apiService.get(`/finance/analytics?${query.toString()}`);
            const list = res.data || [];
            setAnalyticsData(list);
            setTotalPages(res.totalPages || 1);
            setTotalItems(res.total || 0);
            
            // Set Summary if available (backend sets this)
            if (res.summary) {
                setData(prev => ({
                    ...prev,
                    totalIncome: res.summary.totalIncome,
                    totalExpense: res.summary.totalExpense,
                    netProfit: res.summary.netProfit
                }));
            }

            // Ideally we'd have a separate chart endpoint or use this list but list is paginated.
            // For correct "Chart" for the whole period, we need ALL data for the period.
            // Let's fetch chart data separately without pagination
            fetchChartData();

        } catch (err) {
            console.error("Analytics fetch failed", err);
        } finally {
            setAnalyticsLoading(false);
            setLoading(false);
        }
    };

    const fetchChartData = async () => {
        try {
             const query = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate,
                groupBy: filters.groupBy,
                limit: '1000' // Get all for chart
            });
            const res = await apiService.get(`/finance/analytics?${query.toString()}`);
            const chartRecords = res.data || [];
            
            const formattedChart = chartRecords.map((r: any) => {
                 let dateLabel = r.dateGroup;
                 if (filters.groupBy === 'week') {
                     dateLabel = `W${r.dateGroup?.week}`;
                 } else if (filters.groupBy === 'month') {
                     dateLabel = dayjs().month(r.dateGroup?.month - 1).format('MMM YY');
                 } else {
                     dateLabel = dayjs(r.dateGroup).format('DD MMM');
                 }
                 return {
                     date: dateLabel,
                     income: r.income,
                     expense: r.expense,
                     net: r.income - r.expense
                 };
            }).reverse(); // API sorts desc, we want asc for chart usually

            setData(prev => ({ ...prev, chartData: formattedChart }));
        } catch (err) {
            console.error("Chart fetch failed", err);
        }
    }

    useEffect(() => {
        fetchAnalytics();
    }, [filters, page, limit]);

    const handleExport = () => {
        try {
            if (!analyticsData || analyticsData.length === 0) {
                console.warn("No data to export");
                return;
            }

            const dataToExport = analyticsData.map((row: any) => ({
                 Date: row.dateGroup ? (
                     filters.groupBy === 'day' ? row.dateGroup : 
                     filters.groupBy === 'week' ? `W${row.dateGroup.week}-${row.dateGroup.year}` : 
                     `${row.dateGroup.year}-${row.dateGroup.month}`
                 ) : 'N/A',
                 Income: row.income,
                 Expense: row.expense,
                 NetProfit: row.income - row.expense,
                 MilkIncome: row.milkIncome || 0,
                 OtherIncome: row.otherIncome || 0
            }));

            const headers = Object.keys(dataToExport[0]).join(",");
            const rows = dataToExport.map((row: any) => Object.values(row).join(","));
            const csvContent = [headers, ...rows].join("\n");
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `profit_loss_${dayjs().format('YYYY-MM-DD')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed", error);
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><Loader text="Loading Finance Data..." /></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
            {/* 1. Header */}
            <TopHeader
                title="Profit & Loss"
                breadcrumbs={[
                  { label: "Dashboard", href: "/home" },
                  { label: "Finance", href: "#" },
                ]}
                actionButton={
                    <Button 
                        variant="contained" 
                        onClick={() => setAddTransactionOpen(true)}
                        startIcon={<Add />}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-blue-500/30"
                    >
                        New Transaction
                    </Button>
                }
            />

            <div className="mx-auto px-4 md:px-8 py-8">
                {/* 2. Toolbar & Filters */}
                <TableToolbar
                    searchQuery="" 
                    onSearchChange={() => {}} 
                    onClearFilters={() => setFilters({ ...filters, groupBy: 'day' })}
                    actions={
                        <>
                             <Button
                                variant="outlined"
                                startIcon={<BarChart />}
                                onClick={() => setDrawerOpen(true)}
                                sx={{ textTransform: 'none', px: 2, borderColor: 'rgba(0,0,0,0.12)' }}
                                className="hidden md:flex"
                            >
                                Analytics
                            </Button>
                            <Tooltip title="View Analytics">
                                <IconButton onClick={() => setDrawerOpen(true)} className="md:hidden">
                                    <BarChart />
                                </IconButton>
                            </Tooltip>
                            
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={handleExport}
                                sx={{ textTransform: 'none', px: 2, borderColor: 'rgba(0,0,0,0.12)' }}
                            >
                                Export
                            </Button>
                        </>
                    }
                >
                    {/* Collapsible Filter Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                         <div className="w-full">
                            <FormControl size="small" fullWidth>
                                <InputLabel>Group By</InputLabel>
                                <Select
                                    label="Group By"
                                    value={filters.groupBy}
                                    onChange={(e) => setFilters({ ...filters, groupBy: e.target.value as any })}
                                >
                                    <MenuItem value="day">Daily</MenuItem>
                                    <MenuItem value="week">Weekly</MenuItem>
                                    <MenuItem value="month">Monthly</MenuItem>
                                </Select>
                            </FormControl>
                         </div>

                         <TextField
                            type="date"
                            label="From"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                        
                        <TextField
                            type="date"
                            label="To"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                </TableToolbar>

                {/* 3. Main Sorted Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
                     {analyticsLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader text="Loading data..." />
                        </div>
                    ) : (
                        <>
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                            <TableCell className="font-semibold text-slate-600 dark:text-slate-400 py-4 first:rounded-l-xl last:rounded-r-xl">
                                                {filters.groupBy === 'month' ? 'Month' : filters.groupBy === 'week' ? 'Week' : 'Date'}
                                            </TableCell>
                                            <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Income</TableCell>
                                            <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Expense</TableCell>
                                            <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Net Profit</TableCell>
                                            <TableCell align="center" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {analyticsData.length > 0 ? (
                                            analyticsData.map((row: any, i) => {
                                                let displayDate = row.dateGroup;
                                                if (filters.groupBy === 'week') {
                                                    displayDate = `Week ${row.dateGroup?.week}, ${row.dateGroup?.year}`;
                                                } else if (filters.groupBy === 'month') {
                                                    const dateObj = dayjs().year(row.dateGroup?.year).month(row.dateGroup?.month - 1);
                                                    displayDate = dateObj.format('MMMM YYYY');
                                                } else {
                                                    displayDate = dayjs(row.dateGroup).format('DD MMM, YYYY');
                                                }

                                                const net = row.income - row.expense;

                                                return (
                                                    <TableRow 
                                                        key={i}
                                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-900 last:border-0"
                                                    >
                                                        <TableCell component="th" scope="row">
                                                            <span className="font-bold text-slate-700 dark:text-slate-200">
                                                                {displayDate}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg text-sm">
                                                                ₹{row.income.toLocaleString()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg text-sm">
                                                                ₹{row.expense.toLocaleString()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <span className={`font-bold ${net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                                                {net >= 0 ? '+' : ''}₹{net.toLocaleString()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip 
                                                                label={net >= 0 ? 'Profit' : 'Loss'} 
                                                                size="small"
                                                                color={net >= 0 ? 'success' : 'warning'}
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" className="py-12 text-slate-500">
                                                    No records found for the selected period.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                             
                             <TablePagination 
                                page={page} 
                                count={totalPages} 
                                limit={limit} 
                                onPageChange={setPage} 
                                onLimitChange={setLimit}
                                totalItems={totalItems} 
                             />
                        </>
                    )}
                </div>
            </div>

            {/* 5. Analytics Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    className: "w-full md:w-[450px] p-6 bg-slate-50 dark:bg-slate-950"
                }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Analytics</h2>
                    <IconButton onClick={() => setDrawerOpen(false)} className="bg-white dark:bg-slate-900 shadow-sm">
                        <Close />
                    </IconButton>
                </div>
                
                <div className="space-y-6 overflow-y-auto pb-10">
                    <div className="grid grid-cols-2 gap-4">
                         <KPICard 
                            title="Total Income"
                            value={`₹${data.totalIncome.toLocaleString()}`}
                            subtitle="Selected Period"
                            icon={<TrendingUp />}
                            color="green"
                        />
                         <KPICard 
                            title="Total Expenses"
                            value={`₹${data.totalExpense.toLocaleString()}`}
                            subtitle="Selected Period"
                            icon={<TrendingDown />}
                            color="red"
                        />
                         <KPICard 
                            title="Net Profit"
                            value={`₹${data.netProfit.toLocaleString()}`}
                            subtitle="Selected Period"
                            icon={<AccountBalanceWallet />}
                            color={data.netProfit >= 0 ? "blue" : "orange"}
                        />
                         <KPICard 
                            title="Net Margin"
                            value={`${data.totalIncome > 0 ? ((data.netProfit / data.totalIncome) * 100).toFixed(1) : 0}%`}
                            subtitle="Profitability"
                            icon={<AttachMoney />}
                            color="purple"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-bold text-slate-800 dark:text-white">P&L Trend</h3>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{fontSize: 10}} />
                                    <YAxis tick={{fontSize: 10}} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </Drawer>

            <AddTransactionDrawer 
                open={addTransactionOpen} 
                onClose={() => setAddTransactionOpen(false)} 
                onSuccess={() => {
                    fetchAnalytics();
                    setAddTransactionOpen(false);
                }}
                defaultDate={filters.groupBy === 'day' ? filters.startDate : undefined}
            />
        </div>
    );
};

const KPICard = ({ title, value, subtitle, icon, color = "blue" }: any) => {
    const colorClasses: any = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        red: "bg-red-50 text-red-600"
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
                    {React.cloneElement(icon, { fontSize: "medium" })}
                </div>
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight break-all">{value}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
            </div>
        </div>
    );
}

export default ProfitLossDashboard;
