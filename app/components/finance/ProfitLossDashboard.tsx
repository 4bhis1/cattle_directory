"use client";

import React, { useEffect, useState } from 'react';
import { 
    Button, Tabs, Tab, Box, Typography, Card, CardContent, Select, MenuItem
} from '@mui/material';
import { 
    Add, Download
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '@/lib/apiService';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { TopHeader } from '@/app/components/ui/Header';
import { TableToolbar } from '@/app/components/Table/TableToolbar';
import AddTransactionDrawer from './AddTransactionDrawer';
import FinanceTable from './FinanceTable';

dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

// --- Types ---
type SummaryStats = {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
}

const ProfitLossDashboard = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // UI State
    const initialTab = parseInt(searchParams.get('tab') || '0');
    const [activeTab, setActiveTab] = useState(initialTab);
    const [drawerOpen, setDrawerOpen] = useState(false); 
    
    // Edit State
    const [editId, setEditId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any | null>(null);

    const handleEdit = (transaction: any) => {
        setEditId(transaction._id);
        setEditData(transaction);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setEditId(null);
        setEditData(null);
    };
    
    // Grouping State
    // Default to 'day' as requested
    const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    // Data State
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]); 
    const [summary, setSummary] = useState<SummaryStats>({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
    
    const [filters, setFilters] = useState({
        startDate: searchParams.get('startDate') || dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: searchParams.get('endDate') || dayjs().endOf('month').format('YYYY-MM-DD'),
    });

    // Helper: Update URL
    const updateUrl = (newTab: number, newFilters: any) => {
        const params = new URLSearchParams();
        params.set('tab', newTab.toString());
        if (newFilters.startDate) params.set('startDate', newFilters.startDate);
        if (newFilters.endDate) params.set('endDate', newFilters.endDate);
        router.push(`/finance?${params.toString()}`);
    };

    // Fetch Analytics Data (Groups)
    const fetchData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate,
                groupBy: groupBy,
                limit: '1000' // Fetch all groups for the period
            });
            
            // Should respond with aggregated data for Day/Week/Month
            const res = await apiService.get(`/finance/analytics?${query.toString()}`);
            setAnalyticsData(res.data || []);
            
            if (res.summary) {
                setSummary(res.summary);
            }
        } catch (err) {
            console.error("Failed to fetch finance data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, groupBy]); // ActiveTab only filters UI

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        updateUrl(newValue, filters);
        setExpandedRows({}); // Collapse all when switching tabs to avoid confusion
    };

    const toggleRow = (rowKey: string) => {
        setExpandedRows(prev => ({ ...prev, [rowKey]: !prev[rowKey] }));
    };

    // Filter displayed groups based on Tab
    const filteredAnalytics = analyticsData.filter(row => {
        if (activeTab === 0) return true;
        // Keep structure, user can filter details inside
        return true;
    });

    const handleExport = () => {
         console.log("Exporting...");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
            <TopHeader
                title="Profit & Loss"
                breadcrumbs={[
                  { label: "Dashboard", href: "/home" },
                  { label: "Finance", href: "#" },
                ]}
                actionButton={
                    <Button 
                        variant="contained" 
                        onClick={() => setDrawerOpen(true)}
                        startIcon={<Add />}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-blue-500/30"
                    >
                        New Transaction
                    </Button>
                }
            />

            <div className="mx-auto px-4 md:px-8 py-8">
                <Box className="border-b border-slate-200 dark:border-slate-800 mb-6">
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        sx={{ '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem', textTransform: 'none' } }}
                    >
                        <Tab label="All Transactions" />
                        <Tab label="Money Coming" />
                        <Tab label="Money Going" />
                    </Tabs>
                </Box>
                
                {/* Summary Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <SummaryCard title="Total Income" value={summary.totalIncome} color="text-green-600" bg="bg-green-50" />
                    <SummaryCard title="Total Expense" value={summary.totalExpense} color="text-red-600" bg="bg-red-50" />
                    <SummaryCard title="Net Profit" value={summary.netProfit} color={summary.netProfit >= 0 ? "text-blue-600" : "text-orange-600"} bg={summary.netProfit >= 0 ? "bg-blue-50" : "bg-orange-50"} />
                </div>

                <TableToolbar
                    searchQuery=""
                    onSearchChange={() => {}}
                    onClearFilters={() => {}}
                    actions={
                        <>
                            <Select
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value as any)}
                                size="small"
                                sx={{ bgcolor: 'background.paper', borderRadius: 2, minWidth: 120 }}
                            >
                                <MenuItem value="day">Daily</MenuItem>
                                <MenuItem value="week">Weekly</MenuItem>
                                <MenuItem value="month">Monthly</MenuItem>
                            </Select>
                            <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>
                                Export
                            </Button>
                        </>
                    }
                >
                    <div className="flex gap-4 p-2 items-center">
                        <input 
                            type="date"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            value={filters.startDate}
                            onChange={(e) => {
                                const newFilters = { ...filters, startDate: e.target.value };
                                setFilters(newFilters);
                                updateUrl(activeTab, newFilters);
                            }}
                        />
                        <span className="text-slate-400">to</span>
                        <input 
                            type="date"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            value={filters.endDate}
                            onChange={(e) => {
                                const newFilters = { ...filters, endDate: e.target.value };
                                setFilters(newFilters);
                                updateUrl(activeTab, newFilters);
                            }}
                        />
                    </div>
                </TableToolbar>

                {/* Collapsible Table */}
                <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                    {loading ? (
                         <div className="p-10 text-center text-slate-500">Loading...</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-bold w-1/4">
                                        {groupBy === 'week' ? 'Week' : (groupBy === 'month' ? 'Month' : 'Date')}
                                    </th>
                                    {(activeTab === 0 || activeTab === 1) && <th className="px-6 py-4 font-bold text-right text-green-600">Income</th>}
                                    {(activeTab === 0 || activeTab === 2) && <th className="px-6 py-4 font-bold text-right text-red-600">Expense</th>}
                                    <th className="px-6 py-4 font-bold text-right">Net</th>
                                    <th className="px-4 py-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAnalytics.map((row: any, i) => {
                                    const rowKey = JSON.stringify(row.dateGroup);
                                    const isExpanded = !!expandedRows[rowKey];
                                    const dateLabel = formatDateGroup(row.dateGroup, groupBy);
                                    
                                    return (
                                        <React.Fragment key={i}>
                                            <tr 
                                                className="bg-white border-b dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 cursor-pointer"
                                                onClick={() => toggleRow(rowKey)}
                                            >
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                    {dateLabel}
                                                    <div className="text-xs text-slate-400 font-normal mt-0.5">{row.txCount} Records</div>
                                                </td>
                                                {(activeTab === 0 || activeTab === 1) && (
                                                    <td className="px-6 py-4 text-right font-bold text-green-600">
                                                        ₹{row.income.toLocaleString()}
                                                    </td>
                                                )}
                                                {(activeTab === 0 || activeTab === 2) && (
                                                    <td className="px-6 py-4 text-right font-bold text-red-600">
                                                        ₹{row.expense.toLocaleString()}
                                                    </td>
                                                )}
                                                <td className={`px-6 py-4 text-right font-bold ${row.income - row.expense >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                                                    ₹{(row.income - row.expense).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 text-center text-slate-400">
                                                    {isExpanded ? '▼' : '▶'}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={6} className="bg-slate-50/50 p-4 border-b border-slate-100 shadow-inner">
                                                        <GroupTransactions 
                                                            group={row.dateGroup} 
                                                            groupBy={groupBy} 
                                                            activeTab={activeTab}
                                                            onEdit={handleEdit}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                {filteredAnalytics.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            No data for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <AddTransactionDrawer 
                open={drawerOpen}
                onClose={handleDrawerClose}
                onSuccess={() => {
                    fetchData();
                    handleDrawerClose();
                }}
                editId={editId}
                editData={editData}
            />
        </div>
    );
};

// --- Sub-Component: Transactions inside Group ---
const GroupTransactions = ({ group, groupBy, activeTab, onEdit }: { group: any, groupBy: string, activeTab: number, onEdit: (t: any) => void }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTx = async () => {
            setLoading(true);
            try {
                // Calculate Start/End Date for this group
                let start = '', end = '';
                
                if (groupBy === 'day') {
                    start = group;
                    end = group;
                } else if (groupBy === 'month') {
                    // group = { year: 2025, month: 10 }
                    const d = dayjs().year(group.year).month(group.month - 1).startOf('month');
                    start = d.format('YYYY-MM-DD');
                    end = d.endOf('month').format('YYYY-MM-DD');
                } else if (groupBy === 'week') {
                     // group = { year: 2025, week: 5 }
                     const d = dayjs().year(group.year).week(group.week);
                     start = d.startOf('week').format('YYYY-MM-DD');
                     end = d.endOf('week').format('YYYY-MM-DD');
                }

                const res = await apiService.get(`/finance/transactions?startDate=${start}&endDate=${end}&limit=1000`);
                let data = res.data || [];
                
                // Client-side filtering ensures specific tab views only show relevant transactions
                if (activeTab === 1) data = data.filter((t: any) => t.type === 'income');
                if (activeTab === 2) data = data.filter((t: any) => t.type === 'expense');
                
                // Normalize for FinanceTable
                data = data.map((t: any) => ({
                    ...t,
                    recordType: t.type // Map backend 'type' to 'recordType'
                }));

                setTransactions(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (group) fetchTx();
    }, [group, groupBy, activeTab]);

    if (loading) return <div className="text-center py-2 text-xs text-slate-500">Loading details...</div>;
    
    if (transactions.length === 0) return <div className="text-center py-2 text-xs text-slate-500">No transactions found for this category.</div>;

    return (
        <FinanceTable 
            data={transactions} 
            loading={false} 
            onEdit={(id) => {
                const tx = transactions.find(t => t._id === id);
                if (tx) onEdit(tx);
            }}
        />
    );
};

// Date Formatter Helper
const formatDateGroup = (group: any, type: string) => {
    if (!group) return '-';
    if (type === 'week') return `Week ${group.week}, ${group.year}`;
    if (type === 'month') return dayjs().year(group.year).month(group.month - 1).format('MMMM YYYY');
    return dayjs(group).format('DD MMM, YYYY');
};

const SummaryCard = ({ title, value, color, bg }: { title: string, value: number, color: string, bg: string }) => (
    <Card className="rounded-xl shadow-sm border border-slate-100">
        <CardContent className="p-4 flex flex-col">
            <Typography variant="body2" className="text-slate-500 font-medium mb-1">{title}</Typography>
            <div className={`text-2xl font-bold ${color} self-start px-2 py-1 rounded-lg ${bg}`}>
                ₹{value.toLocaleString()}
            </div>
        </CardContent>
    </Card>
);

export default ProfitLossDashboard;
