"use client";

import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    useTheme
} from '@mui/material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { AttachMoney, TrendingUp, TrendingDown, AccountBalanceWallet } from '@mui/icons-material';

interface AnalyticsProps {
    data: any[]; // Raw transactions
}

export default function FinanceAnalytics({ data }: AnalyticsProps) {
    // 1. Calculate KPIs
    const totalIncome = data
        .filter(t => t.recordType === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = data
        .filter(t => t.recordType === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // 2. Prepare Chart Data (Daily Trend)
    // Group by Date
    const dailyMap = new Map<string, { income: number; expense: number }>();
    data.forEach(t => {
        const date = t.date.split('T')[0]; // Simple YYYY-MM-DD
        if (!dailyMap.has(date)) dailyMap.set(date, { income: 0, expense: 0 });
        const entry = dailyMap.get(date)!;
        if (t.recordType === 'income') entry.income += t.amount;
        else entry.expense += t.amount;
    });

    // Convert map to sorted array
    const chartData = Array.from(dailyMap.entries())
        .map(([date, val]) => ({ date, ...val }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // 3. Prepare Category Data (Expenses)
    const categoryMap = new Map<string, number>();
    data.filter(t => t.recordType === 'expense').forEach(t => {
        const cat = t.expenseCategory || 'Other';
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.amount);
    });
    
    const pieData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <Box className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <KPICard 
                        title="Total Income" 
                        value={totalIncome} 
                        icon={<TrendingUp />} 
                        color="green" 
                    />
                </div>
                <div>
                     <KPICard 
                        title="Total Expenses" 
                        value={totalExpense} 
                        icon={<TrendingDown />} 
                        color="red" 
                    />
                </div>
                <div>
                     <KPICard 
                        title="Net Balance" 
                        value={netBalance} 
                        icon={<AccountBalanceWallet />} 
                        color={netBalance >= 0 ? "blue" : "orange"} 
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Income vs Expense Trend */}
                <div className="md:col-span-2">
                    <Paper className="p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
                        <Typography variant="h6" className="font-bold mb-4 text-slate-700">
                            Income vs Expense Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{fill: '#f1f5f9'}}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </div>

                {/* Expense Breakdown */}
                <div className="md:col-span-1">
                     <Paper className="p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
                        <Typography variant="h6" className="font-bold mb-4 text-slate-700">
                            Expense Breakdown
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '11px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </div>
            </div>
        </Box>
    );
}

const KPICard = ({ title, value, icon, color }: any) => {
    const colorClasses: any = {
        green: "text-green-600 bg-green-50",
        red: "text-red-600 bg-red-50",
        blue: "text-blue-600 bg-blue-50",
        orange: "text-orange-600 bg-orange-50",
    };

    return (
        <Paper className="p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <Typography variant="subtitle2" className="text-slate-500 font-bold mb-1">
                    {title}
                </Typography>
                <Typography variant="h4" className="font-black text-slate-800">
                    ₹{value.toLocaleString()}
                </Typography>
            </div>
            <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                {React.cloneElement(icon, { fontSize: "large" })}
            </div>
        </Paper>
    );
};
