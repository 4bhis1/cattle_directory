'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Fade,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import {
    ArrowBack,
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';

export default function ProfitAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [financialData, setFinancialData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
    });

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        try {
            setLoading(true);
            const [salesRes, milkRes, expensesRes] = await Promise.all([
                fetch('/api/sales'),
                fetch('/api/milk'),
                fetch('/api/expenses')
            ]);

            const salesData = await salesRes.json();
            const milkData = await milkRes.json();
            const expensesData = await expensesRes.json();

            if (salesData.success && milkData.success && expensesData.success) {
                // Combine sales and milk revenue
                const revenue = [
                    ...salesData.data.map((s: any) => ({ date: s.date, amount: s.totalAmount, type: 'sales' })),
                    ...milkData.data.map((m: any) => ({ date: m.date, amount: m.totalAmount, type: 'milk' }))
                ];

                const expenses = expensesData.data.map((e: any) => ({ date: e.date, amount: e.amount, type: 'expense' }));

                // Aggregate by month
                const monthlyStats: Record<string, { revenue: number; expense: number }> = {};

                [...revenue, ...expenses].forEach((item: any) => {
                    const month = new Date(item.date).toLocaleString('default', { month: 'short', year: 'numeric' });
                    if (!monthlyStats[month]) {
                        monthlyStats[month] = { revenue: 0, expense: 0 };
                    }
                    if (item.type === 'expense') {
                        monthlyStats[month].expense += item.amount;
                    } else {
                        monthlyStats[month].revenue += item.amount;
                    }
                });

                const chartData = Object.entries(monthlyStats).map(([name, val]) => ({
                    name,
                    revenue: val.revenue,
                    expense: val.expense,
                    profit: val.revenue - val.expense,
                }));

                setFinancialData(chartData);

                const totalRev = revenue.reduce((sum: number, r: any) => sum + r.amount, 0);
                const totalExp = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

                setStats({
                    totalRevenue: totalRev,
                    totalExpenses: totalExp,
                    netProfit: totalRev - totalExp,
                    profitMargin: totalRev > 0 ? ((totalRev - totalExp) / totalRev) * 100 : 0,
                });
            }
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <Fade in={true} timeout={800}>
                <Box className="max-w-7xl mx-auto">
                    {/* Breadcrumbs & Back Button */}
                    <Box className="mb-6 flex items-center justify-between">
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => window.history.back()}
                            sx={{ color: '#6b7280', '&:hover': { color: '#111827', bgcolor: 'transparent' } }}
                        >
                            Back to Dashboard
                        </Button>
                        <Typography variant="body2" className="text-gray-500">
                            Dashboard &gt; Analytics &gt; <span className="text-blue-600 font-medium">Profit & Loss</span>
                        </Typography>
                    </Box>

                    {/* Header */}
                    <Box className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            📈 Profit & Loss Analysis
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Financial health overview of the farm
                        </p>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3} className="mb-6">
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={3} sx={{ borderRadius: '16px', background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' }}>
                                <CardContent>
                                    <Typography variant="body2" className="text-gray-600 mb-1">Total Revenue</Typography>
                                    <Typography variant="h4" className="font-bold text-green-600">₹{stats.totalRevenue.toFixed(0)}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={3} sx={{ borderRadius: '16px', background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
                                <CardContent>
                                    <Typography variant="body2" className="text-gray-600 mb-1">Total Expenses</Typography>
                                    <Typography variant="h4" className="font-bold text-red-600">₹{stats.totalExpenses.toFixed(0)}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={3} sx={{ borderRadius: '16px', background: stats.netProfit >= 0 ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
                                <CardContent>
                                    <Typography variant="body2" className="text-gray-600 mb-1">Net Profit</Typography>
                                    <Typography variant="h4" className={`font-bold ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        ₹{stats.netProfit.toFixed(0)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={3} sx={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)' }}>
                                <CardContent>
                                    <Typography variant="body2" className="text-gray-600 mb-1">Profit Margin</Typography>
                                    <Typography variant="h4" className="font-bold text-purple-600">{stats.profitMargin.toFixed(1)}%</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Charts */}
                    <Grid container spacing={3} className="mb-6">
                        <Grid item xs={12}>
                            <Paper elevation={3} className="p-8 bg-white rounded-2xl">
                                <Typography variant="h6" className="font-bold mb-4 text-gray-800">Financial Overview (Revenue vs Expenses)</Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart data={financialData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                        <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper elevation={3} className="p-8 bg-white rounded-2xl">
                                <Typography variant="h6" className="font-bold mb-4 text-gray-800">Net Profit Trend</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={financialData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="profit" fill="#3b82f6" name="Net Profit" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
        </Box>
    );
}
