"use client";

import React, { useEffect, useState } from 'react';
import { 
    Card, CardContent, Typography, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
    Pagination, Select, MenuItem, FormControl, InputLabel, TextField, Grid, Box,
    Drawer, Tooltip
} from '@mui/material';
import { 
    LocalDrink, TrendingUp, CalendarMonth, WaterDrop,
    ChevronRight, Add, ReceiptLong, BarChart, Download, Close, FilterList
} from '@mui/icons-material';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/apiService';
import Loader from '../ui/Loader';
import dayjs from 'dayjs';
import { TopHeader } from '@/app/components/ui/Header';
import { TableToolbar } from '@/app/components/Table/TableToolbar';
import { TablePagination } from '@/app/components/Table/TablePagination';

// --- Types ---
type MilkStat = {
    date: string;
    volume: number;
}

type DashboardData = {
    todayVolume: number;
    monthVolume: number;
    avgFat: number;
    chartData: MilkStat[];
}

const MilkDashboard = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    
    // KPIs & Chart Data (Overview)
    const [data, setData] = useState<DashboardData>({
        todayVolume: 0,
        monthVolume: 0,
        avgFat: 0,
        chartData: []
    });

    // Analytics State
    const [filters, setFilters] = useState({
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
        cattleId: '',
        breed: '',
        cattleType: '',
        groupBy: 'day' as 'day' | 'week' | 'month' | 'year' | 'cattle' | 'breed' | 'cattleType'
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    
    const [cattleList, setCattleList] = useState<any[]>([]);

    // Derived lists
    const breeds = Array.from(new Set(cattleList.map((c: any) => c.breed))).filter(Boolean);
    const types = Array.from(new Set(cattleList.map((c: any) => c.cattleType || 'Cow'))).filter(Boolean); // default fallback

    // Load Cattle
    useEffect(() => {
        apiService.get('/cattle?limit=1000').then((res) => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setCattleList(list);
        }).catch(err => console.error("Failed to load cattle", err));
    }, []);

    // Load Analytics Table Data
    useEffect(() => {
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
                if (filters.cattleId) query.append('cattleId', filters.cattleId);
                if (filters.breed) query.append('breed', filters.breed);
                if (filters.cattleType) query.append('cattleType', filters.cattleType);
                
                // Use the new report API for granular data
                const res = await apiService.get(`/milk/report?${query.toString()}`);
                setAnalyticsData(res.data || []);
                setTotalPages(res.totalPages || 1);
                setTotalItems(res.total || 0);
            } catch (err) {
                console.error("Analytics fetch failed", err);
            } finally {
                setAnalyticsLoading(false);
            }
        };
        fetchAnalytics();
    }, [filters, page, limit]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const today = dayjs().format('YYYY-MM-DD');
                const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
                const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

                // 1. Fetch Today's Milk
                const todayRes = await apiService.get(`/milk/daily?date=${today}`);
                let todayVol = 0;
                // todayRes.data is array of cattle with morningMilk/eveningMilk
                // Or check structure. Assuming based on milk.controller.ts: { results: N, data: [...] }
                const todayCattle = todayRes.data || []; 
                if (Array.isArray(todayCattle)) {
                    todayCattle.forEach((c: any) => {
                        todayVol += (c.morningMilk || 0) + (c.eveningMilk || 0);
                    });
                }
                
                // 2. Fetch Month Data for Chart
                // Use regular milk list endpoint with date range to aggregate for chart if analytics not enough?
                // Actually, the analytics endpoint can give us chart data too if we query it for the whole month grouped by day.
                // Let's use the analytics endpoint for the chart data to be consistent.
                const chartRes = await apiService.get(`/milk/analytics?startDate=${startOfMonth}&endDate=${endOfMonth}&groupBy=day&limit=1000`);
                
                let mVol = 0;
                let totalFat = 0;
                let fatCount = 0;
                const dailyMap = new Map<string, { volume: number }>();

                // Initialize all days in month to 0
                const daysInMonth = dayjs().daysInMonth();
                for (let i = 1; i <= daysInMonth; i++) {
                    const d = dayjs().date(i).format('YYYY-MM-DD');
                    dailyMap.set(d, { volume: 0 });
                }

                const chartRecords = chartRes.data || [];
                chartRecords.forEach((r: any) => {
                     // r.dateGroup is YYYY-MM-DD
                     const d = r.dateGroup;
                     const vol = r.totalVolume || 0;
                     mVol += vol;
                     if (r.avgFat) {
                         totalFat += r.avgFat * r.count; // Weighted avg approximation or just use avgFat if simpler
                         fatCount += r.count;
                     }

                     if (dailyMap.has(d)) {
                         dailyMap.set(d, { volume: vol });
                     }
                });

                const chartData = Array.from(dailyMap.entries()).map(([date, stats]) => ({
                    date: dayjs(date).format('DD MMM'),
                    volume: stats.volume
                }));

                setData({
                    todayVolume: todayVol,
                    monthVolume: mVol,
                    avgFat: fatCount > 0 ? (totalFat / fatCount) : 0, // Roughly
                    chartData
                });

            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleExport = () => {
        try {
            if (!analyticsData || analyticsData.length === 0) {
                console.warn("No data to export");
                return;
            }

            const dataToExport = analyticsData.map((row: any) => {
                 let groupLabel = 'N/A';
                 const g = row.group;
                 
                 if (['year', 'month', 'week', 'day'].includes(filters.groupBy)) {
                     if (filters.groupBy === 'year') groupLabel = `${g?.year}`;
                     else if (filters.groupBy === 'week') groupLabel = `W${g?.week}-${g?.year}`;
                     else if (filters.groupBy === 'month') groupLabel = `${g?.year}-${g?.month}`;
                     else groupLabel = g; // day
                 } else {
                     if (filters.groupBy === 'cattle') groupLabel = g?.name || 'Unknown';
                     else groupLabel = g || 'N/A';
                 }

                 return {
                     Group: groupLabel,
                     'Morning Milk': row.morningVolume || 0,
                     'Morning Fat': row.morningFat || 0,
                     'Afternoon Milk': row.eveningVolume || 0, // 'Afternoon' as requested, though data is evening
                     'Afternoon Fat': row.eveningFat || 0,
                     'Total Volume': row.totalVolume,
                     'Avg Fat': row.avgFat,
                 };
            });

            const headers = Object.keys(dataToExport[0]).join(",");
            const rows = dataToExport.map((row: any) => Object.values(row).join(","));
            const csvContent = [headers, ...rows].join("\n");
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `milk_analytics_${dayjs().format('YYYY-MM-DD')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed", error);
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><Loader text="Loading Dashboard..." /></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
            {/* 1. Header */}
            <TopHeader
                title="Milk Production"
                breadcrumbs={[
                  { label: "Dashboard", href: "/home" },
                  { label: "Milk", href: "#" },
                ]}
                actionButton={
                    <Button 
                        variant="contained" 
                        onClick={() => router.push('/milk/record')}
                        startIcon={<Add />}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-blue-500/30"
                    >
                        Record Milk
                    </Button>
                }
            />

            <div className="mx-auto px-4 md:px-8 py-8">
                {/* 2. Toolbar & Filters */}
                <TableToolbar
                    searchQuery="" 
                    onSearchChange={() => {}} 
                    onClearFilters={() => setFilters({ ...filters, cattleId: '', breed: '', cattleType: '', groupBy: 'day' })}
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
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
                                    <MenuItem value="year">Yearly</MenuItem>
                                    <MenuItem value="cattle">By Cattle</MenuItem>
                                    <MenuItem value="breed">By Breed</MenuItem>
                                    <MenuItem value="cattleType">By Type</MenuItem>
                                </Select>
                            </FormControl>
                         </div>

                         <div className="w-full">
                            <FormControl size="small" fullWidth>
                                <InputLabel>Cattle</InputLabel>
                                <Select
                                    label="Cattle"
                                    value={filters.cattleId}
                                    onChange={(e) => setFilters({ ...filters, cattleId: e.target.value })}
                                >
                                    <MenuItem value="">All Cattle</MenuItem>
                                    {cattleList.map((c: any) => (
                                        <MenuItem key={c._id} value={c._id}>{c.name} ({c.tag || 'No Tag'})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                         </div>

                         <div className="w-full">
                            <FormControl size="small" fullWidth>
                                <InputLabel>Breed</InputLabel>
                                <Select
                                    label="Breed"
                                    value={filters.breed}
                                    onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
                                >
                                    <MenuItem value="">All Breeds</MenuItem>
                                    {breeds.map((b: any) => (
                                        <MenuItem key={b} value={b}>{b}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                         </div>

                         <div className="w-full">
                            <FormControl size="small" fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    label="Type"
                                    value={filters.cattleType}
                                    onChange={(e) => setFilters({ ...filters, cattleType: e.target.value })}
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    {types.map((t: any) => (
                                        <MenuItem key={t} value={t}>{t}</MenuItem>
                                    ))}
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
                            <Loader text="Loading milk data..." />
                        </div>
                    ) : (
                        <>
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                            <TableCell className="font-semibold text-slate-600 dark:text-slate-400 py-4 first:rounded-l-xl last:rounded-r-xl">
                                                {['year', 'month', 'week', 'day'].includes(filters.groupBy) ? (
                                                    filters.groupBy === 'year' ? 'Year' :
                                                    filters.groupBy === 'month' ? 'Month' : 
                                                    filters.groupBy === 'week' ? 'Week' : 'Date'
                                                ) : (
                                                    filters.groupBy === 'breed' ? 'Breed' :
                                                    filters.groupBy === 'cattleType' ? 'Cattle Type' : 'Cattle'
                                                )}
                                            </TableCell>
                                            <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Morning</TableCell>
                                            <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">M. Fat</TableCell>
                                            <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Afternoon</TableCell>
                                            <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">A. Fat</TableCell>
                                            <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Prod. Milk</TableCell>
                                            <TableCell align="right" className="font-semibold text-slate-600 dark:text-slate-400 py-4">Total Fat</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {analyticsData.length > 0 ? (
                                            analyticsData.map((row: any, i) => {
                                                let displayGroup = '';
                                                let isDateGroup = ['year', 'month', 'week', 'day'].includes(filters.groupBy);

                                                if (isDateGroup) {
                                                    if (filters.groupBy === 'year') {
                                                        displayGroup = `${row.group?.year}`;
                                                    } else if (filters.groupBy === 'week') {
                                                        displayGroup = `Week ${row.group?.week}, ${row.group?.year}`;
                                                    } else if (filters.groupBy === 'month') {
                                                        const dateObj = dayjs().year(row.group?.year).month(row.group?.month - 1);
                                                        displayGroup = dateObj.format('MMMM YYYY');
                                                    } else {
                                                        displayGroup = dayjs(row.group).format('DD MMM, YYYY');
                                                    }
                                                } else {
                                                    // Non-date grouping
                                                    if (filters.groupBy === 'cattle') {
                                                        displayGroup = row.group?.name || 'Unknown Cattle';
                                                    } else {
                                                        displayGroup = row.group || 'N/A';
                                                    }
                                                }

                                                const isNavigable = isDateGroup && filters.groupBy === 'day';

                                                return (
                                                    <TableRow 
                                                        key={i}
                                                        onClick={() => {
                                                            if (isNavigable) {
                                                                router.push(`/milk/record?date=${row.group}`);
                                                            }
                                                        }}
                                                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-900 last:border-0 ${isNavigable ? 'cursor-pointer' : ''}`}
                                                    >
                                                        <TableCell component="th" scope="row">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                                                    {displayGroup}
                                                                </span>
                                                                {filters.groupBy === 'cattle' && row.group?.tag && (
                                                                    <span className="text-xs text-slate-400">Tag: {row.group.tag}</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        
                                                        {/* Morning */}
                                                        <TableCell align="right">
                                                            <span className="text-slate-600 dark:text-slate-400 font-medium">
                                                                {row.morningVolume ? `${row.morningVolume.toFixed(1)} L` : '-'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <span className="text-slate-500 text-sm">
                                                                {row.morningFat ? `${row.morningFat.toFixed(1)}%` : '-'}
                                                            </span>
                                                        </TableCell>

                                                        {/* Afternoon */}
                                                        <TableCell align="right">
                                                            <span className="text-slate-600 dark:text-slate-400 font-medium">
                                                                {row.eveningVolume ? `${row.eveningVolume.toFixed(1)} L` : '-'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <span className="text-slate-500 text-sm">
                                                                {row.eveningFat ? `${row.eveningFat.toFixed(1)}%` : '-'}
                                                            </span>
                                                        </TableCell>

                                                        {/* Totals */}
                                                        <TableCell align="right">
                                                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">
                                                                {row.totalVolume.toFixed(1)} L
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <span className="text-slate-500 text-sm font-semibold">
                                                                {row.avgFat?.toFixed(1)}%
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" className="py-12 text-slate-500">
                                                    No milk records found for the selected period.
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
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Milk Analytics</h2>
                    <IconButton onClick={() => setDrawerOpen(false)} className="bg-white dark:bg-slate-900 shadow-sm">
                        <Close />
                    </IconButton>
                </div>
                
                <div className="space-y-6 overflow-y-auto pb-10">
                    <div className="grid grid-cols-2 gap-4">
                         <KPICard 
                            title="Volume Today"
                            value={`${data.todayVolume.toFixed(1)} L`}
                            subtitle="Daily Production"
                            icon={<LocalDrink />}
                            color="blue"
                        />
                         <KPICard 
                            title="Month Volume"
                            value={`${data.monthVolume.toFixed(0)} L`}
                            subtitle="This Month"
                            icon={<CalendarMonth />}
                            color="purple"
                        />
                         <KPICard 
                            title="Avg Fat"
                            value={`${data.avgFat?.toFixed(1)}%`}
                            subtitle="Month Average"
                            icon={<WaterDrop />}
                            color="orange"
                        />
                         <KPICard 
                            title="Records"
                            value={totalItems}
                            subtitle="Total Entries"
                            icon={<ReceiptLong />}
                            color="green"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-bold text-slate-800 dark:text-white">Production Trend</h3>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" hide />
                                    <YAxis hide />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} fill="url(#colorVolume)" fillOpacity={1} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </Drawer>
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

export default MilkDashboard;
