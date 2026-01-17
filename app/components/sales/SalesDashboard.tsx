"use client";

import React, { useEffect, useState } from 'react';
import { 
    Card, CardContent, Typography, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { 
    AttachMoney, LocalDrink, TrendingUp, CalendarMonth, 
    ChevronRight, Add, ReceiptLong 
} from '@mui/icons-material';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/apiService';
import Loader from '../ui/Loader';
import dayjs from 'dayjs';

// --- Types ---
type SalesStat = {
    date: string;
    amount: number;
    volume: number;
}

type DailySummary = {
    date: string;
    totalAmount: number;
    totalVolume: number;
    recordCount: number;
    uniqueCustomers: number;
}

type DashboardData = {
    todayRevenue: number;
    todayVolume: number;
    monthRevenue: number;
    monthVolume: number;
    chartData: SalesStat[];
    dailySummaries: DailySummary[];
}

const SalesDashboard = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData>({
        todayRevenue: 0,
        todayVolume: 0,
        monthRevenue: 0,
        monthVolume: 0,
        chartData: [],
        dailySummaries: []
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const today = dayjs().format('YYYY-MM-DD');
                const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
                const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

                // 1. Fetch Today's Sales
                // Assuming /sales/daily returns { stats: { totalAmount, totalQuantity } } or list
                const todayRes = await apiService.get(`/sales/daily?date=${today}`);
                // Parse Today
                let todayRev = 0;
                let todayVol = 0;
                // Backend response structure variation handling:
                if (todayRes.data?.stats) {
                    todayRev = todayRes.data.stats.totalAmount || 0;
                    todayVol = todayRes.data.stats.produced || 0; // or totalSold
                } else if (Array.isArray(todayRes.data)) {
                     // sum manually if it returns array of records
                     todayRes.data.forEach((r: any) => {
                         todayRev += (r.totalAmount || 0);
                         todayVol += (r.totalQuantity || 0);
                     });
                }
                
                // 2. Fetch Month Data for Chart
                // Try fetching a range if supported, otherwise we might need a specific dashboard endpoint.
                // For now, I'll assume we can filter by date range on the main list
                // Or I'll fetch 'records' for the month.
                // Fallback: If no range support, we might only show Today/Recent. 
                // Let's try a hypothetical /sales/stats endpoint or just /sales with range
                const monthRes = await apiService.get(`/sales?startDate=${startOfMonth}&endDate=${endOfMonth}&limit=1000`);
                
                const monthRecords = Array.isArray(monthRes.data) ? monthRes.data : (monthRes.data?.data || []);
                
                let mRev = 0;
                let mVol = 0;
                const dailyMap = new Map<string, { amount: number, volume: number }>();

                // Initialize all days in month to 0
                const daysInMonth = dayjs().daysInMonth();
                for (let i = 1; i <= daysInMonth; i++) {
                    const d = dayjs().date(i).format('YYYY-MM-DD');
                    dailyMap.set(d, { amount: 0, volume: 0 });
                }

                monthRecords.forEach((r: any) => {
                    // Check if record has date field
                    const d = dayjs(r.date || r.createdAt).format('YYYY-MM-DD');
                    const amt = Number(r.totalAmount) || 0;
                    const vol = Number(r.quantityInLiters) || 0;
                    
                    mRev += amt;
                    mVol += vol;

                    if (dailyMap.has(d)) {
                        const existing = dailyMap.get(d)!;
                        dailyMap.set(d, { 
                            amount: existing.amount + amt, 
                            volume: existing.volume + vol 
                        });
                    }
                });

                const chartData = Array.from(dailyMap.entries()).map(([date, stats]) => ({
                    date: dayjs(date).format('DD MMM'),
                    amount: stats.amount,
                    volume: stats.volume
                }));

                // Group by Date for Summary Table
                const summaryMap = new Map<string, { amount: number, volume: number, count: number, customers: Set<string> }>();
                
                monthRecords.forEach((r: any) => {
                    const d = dayjs(r.date || r.createdAt).format('YYYY-MM-DD');
                    const amt = Number(r.totalAmount) || 0;
                    const vol = Number(r.quantityInLiters) || 0;
                    
                    if (!summaryMap.has(d)) {
                         summaryMap.set(d, { amount: 0, volume: 0, count: 0, customers: new Set() });
                    }
                    
                    const entry = summaryMap.get(d)!;
                    entry.amount += amt;
                    entry.volume += vol;
                    entry.count += 1;
                    if (r.customerId) entry.customers.add(r.customerId);
                });

                const dailySummaries: DailySummary[] = Array.from(summaryMap.entries()).map(([date, stats]) => ({
                    date: date,
                    totalAmount: stats.amount,
                    totalVolume: stats.volume,
                    recordCount: stats.count,
                    uniqueCustomers: stats.customers.size
                })).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

                setData({
                    todayRevenue: todayRev,
                    todayVolume: todayVol,
                    monthRevenue: mRev,
                    monthVolume: mVol,
                    chartData,
                    dailySummaries
                });

            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><Loader text="Loading Dashboard..." /></div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales Dashboard</h1>
                    <p className="text-slate-500 mt-1"> Overview of your dairy farm revenue.</p>
                </div>
                <div className="flex gap-3">
                     <Button 
                        variant="outlined" 
                        startIcon={<ReceiptLong />}
                        onClick={() => router.push('/sales/record')}
                        className="border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                    >
                        Daily Records
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={() => router.push('/sales/record')} // Or specific "New Sale" if distinct
                        startIcon={<Add />}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-blue-500/30"
                    >
                        Record Sales
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Revenue Today"
                    value={`₹${data.todayRevenue.toLocaleString()}`}
                    subtitle="Daily Income"
                    icon={<AttachMoney />}
                    trend="+12%" // Mock, calculate if possible
                    color="green"
                />
                <KPICard 
                    title="Milk Sold Today"
                    value={`${data.todayVolume.toFixed(1)} L`}
                    subtitle="Daily Volume"
                    icon={<LocalDrink />}
                    color="blue"
                />
                <KPICard 
                    title="Revenue (Month)"
                    value={`₹${data.monthRevenue.toLocaleString()}`}
                    subtitle="This Month"
                    icon={<CalendarMonth />}
                    color="purple"
                />
                 <KPICard 
                    title="Volume (Month)"
                    value={`${data.monthVolume.toFixed(0)} L`}
                    subtitle="Total Milk"
                    icon={<TrendingUp />}
                    color="orange"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Trend</h3>
                         <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm p-2 outline-none">
                             <option>This Month</option>
                             <option>Last Month</option>
                         </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fontSize: 12, fill: '#94a3b8' }} 
                                    minTickGap={30}
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fontSize: 12, fill: '#94a3b8' }} 
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#1e293b' }}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Area 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Sales History Table (Grouped) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Daily Sales History</h3>
                        <Button 
                            variant="text" 
                            size="small"
                            onClick={() => router.push('/sales/record')}
                        >
                            View All
                        </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <TableContainer>
                            <Table sx={{ minWidth: 500 }}>
                                <TableHead>
                                    <TableRow className="bg-slate-50 dark:bg-slate-950">
                                        <TableCell className="font-semibold text-slate-600 dark:text-slate-400 py-4 first:rounded-l-xl last:rounded-r-xl">Date</TableCell>
                                        <TableCell align="center" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Records</TableCell>
                                        <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Volume</TableCell>
                                        <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4 rounded-r-xl">Revenue</TableCell>
                                        <TableCell align="center" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.dailySummaries.length > 0 ? (
                                        data.dailySummaries.map((day) => (
                                            <TableRow 
                                                key={day.date}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <TableCell component="th" scope="row" className="border-b border-slate-100 dark:border-slate-800">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">
                                                            {dayjs(day.date).format('DD MMM, YYYY')}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {dayjs(day.date).format('dddd')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell align="center" className="border-b border-slate-100 dark:border-slate-800">
                                                     <div className="flex flex-col items-center">
                                                         <span className="font-medium text-slate-700 dark:text-slate-300">
                                                            {day.recordCount}
                                                         </span>
                                                         {day.uniqueCustomers > 0 && (
                                                             <span className="text-[10px] text-slate-400">
                                                                 {day.uniqueCustomers} clients
                                                             </span>
                                                         )}
                                                     </div>
                                                </TableCell>
                                                <TableCell align="right" className="border-b border-slate-100 dark:border-slate-800">
                                                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">
                                                        {day.totalVolume.toFixed(1)} L
                                                    </span>
                                                </TableCell>
                                                <TableCell align="right" className="border-b border-slate-100 dark:border-slate-800">
                                                    <span className="font-bold text-green-600">
                                                        ₹{day.totalAmount.toLocaleString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell align="center" className="border-b border-slate-100 dark:border-slate-800">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => router.push(`/sales/record?date=${day.date}`)}
                                                        className="text-slate-400 hover:text-blue-600"
                                                    >
                                                        <ChevronRight />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" className="py-8 text-slate-500">
                                                No sales data found for this month.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, subtitle, icon, color = "blue", trend }: any) => {
    const colorClasses: any = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600"
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
                    {React.cloneElement(icon, { fontSize: "medium" })}
                </div>
                {trend && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
            </div>
        </div>
    );
}

export default SalesDashboard;
