"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  Box,
  Drawer,
  Tooltip,
} from "@mui/material";
import {
  AttachMoney,
  LocalDrink,
  TrendingUp,
  CalendarMonth,
  ChevronRight,
  Add,
  ReceiptLong,
  BarChart,
  Download,
  Close,
  FilterList,
  Settings,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/apiService";
import Loader from "../ui/Loader";
import dayjs from "dayjs";
import { TopHeader } from "@/app/components/ui/Header";
import { TableToolbar } from "@/app/components/Table/TableToolbar";
import { TablePagination } from "@/app/components/Table/TablePagination";
import ManageCustomersDrawer from "./ManageCustomersDrawer";

// --- Types ---
type SalesStat = {
  date: string;
  amount: number;
  volume: number;
};

type DailySummary = {
  date: string;
  totalAmount: number;
  totalVolume: number;
  recordCount: number;
  uniqueCustomers: number;
};

type DashboardData = {
  todayRevenue: number;
  todayVolume: number;
  monthRevenue: number;
  monthVolume: number;
  chartData: SalesStat[];
  dailySummaries: DailySummary[];
};

const SalesDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);


  // KPIs & Chart Data (Overview)
  const [data, setData] = useState<DashboardData>({
    todayRevenue: 0,
    todayVolume: 0,
    monthRevenue: 0,
    monthVolume: 0,
    chartData: [],
    dailySummaries: [],
  });

  // Analytics State
  const [filters, setFilters] = useState({
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
    customerId: "",
    groupBy: "day" as "day" | "week" | "month",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  const [customers, setCustomers] = useState<any[]>([]);

  // Load Customers
  useEffect(() => {
    apiService
      .get("/customers?limit=1000")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCustomers(list);
      })
      .catch((err) => console.error("Failed to load customers", err));
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
          limit: limit.toString(),
        });
        if (filters.customerId) query.append("customerId", filters.customerId);

        const res = await apiService.get(
          `/sales/analytics?${query.toString()}`,
        );
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
        const today = dayjs().format("YYYY-MM-DD");
        const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
        const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

        // 1. Fetch Today's Sales
        const todayRes = await apiService.get(`/sales/daily?date=${today}`);
        let todayRev = 0;
        let todayVol = 0;
        if (todayRes.data?.stats) {
          todayRev = todayRes.data.stats.totalAmount || 0;
          todayVol = todayRes.data.stats.produced || 0;
        } else if (Array.isArray(todayRes.data)) {
          todayRes.data.forEach((r: any) => {
            todayRev += r.totalAmount || 0;
            todayVol += r.totalQuantity || 0;
          });
        }

        // 2. Fetch Month Data for Chart
        const monthRes = await apiService.get(
          `/sales?startDate=${startOfMonth}&endDate=${endOfMonth}&limit=1000`,
        );
        const monthRecords = Array.isArray(monthRes.data)
          ? monthRes.data
          : monthRes.data?.data || [];

        let mRev = 0;
        let mVol = 0;
        const dailyMap = new Map<string, { amount: number; volume: number }>();

        // Initialize all days in month to 0
        const daysInMonth = dayjs().daysInMonth();
        for (let i = 1; i <= daysInMonth; i++) {
          const d = dayjs().date(i).format("YYYY-MM-DD");
          dailyMap.set(d, { amount: 0, volume: 0 });
        }

        monthRecords.forEach((r: any) => {
          const d = dayjs(r.date || r.createdAt).format("YYYY-MM-DD");
          const amt = Number(r.totalAmount) || 0;
          const vol = Number(r.quantityInLiters) || 0;

          mRev += amt;
          mVol += vol;

          if (dailyMap.has(d)) {
            const existing = dailyMap.get(d)!;
            dailyMap.set(d, {
              amount: existing.amount + amt,
              volume: existing.volume + vol,
            });
          }
        });

        const chartData = Array.from(dailyMap.entries()).map(
          ([date, stats]) => ({
            date: dayjs(date).format("DD MMM"),
            amount: stats.amount,
            volume: stats.volume,
          }),
        );

        setData({
          todayRevenue: todayRev,
          todayVolume: todayVol,
          monthRevenue: mRev,
          monthVolume: mVol,
          chartData,
          dailySummaries: [],
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

      const dataToExport = analyticsData.map((row: any) => ({
        Date: row.dateGroup
          ? filters.groupBy === "day"
            ? row.dateGroup
            : filters.groupBy === "week"
              ? `W${row.dateGroup.week}-${row.dateGroup.year}`
              : `${row.dateGroup.year}-${row.dateGroup.month}`
          : "N/A",
        Transactions: row.count,
        Volume: row.totalVolume,
        AvgRate: row.avgRate,
        Revenue: row.totalAmount,
      }));

      const headers = Object.keys(dataToExport[0]).join(",");
      const rows = dataToExport.map((row: any) => Object.values(row).join(","));
      const csvContent = [headers, ...rows].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `sales_analytics_${dayjs().format("YYYY-MM-DD")}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader text="Loading Dashboard..." />
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* 1. Header */}
      <TopHeader
        title="Sales Management"
        breadcrumbs={[
          { label: "Dashboard", href: "/home" },
          { label: "Sales", href: "#" },
        ]}
        actionButton={
          <div className="gap-2 flex">
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => setIsManageDrawerOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all"
              sx={{ textTransform: "none", borderRadius: "12px" }}
            >
              Clients
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push("/sales/record")}
              startIcon={<Add />}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-blue-500/30"
            >
              Record Sales
            </Button>
          </div>
        }
      />

      <div className="mx-auto px-4 md:px-8 py-8">
        {/* 2. Toolbar & Filters */}
        <TableToolbar
          searchQuery=""
          onSearchChange={() => {}}
          onClearFilters={() =>
            setFilters({ ...filters, customerId: "", groupBy: "day" })
          }
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<BarChart />}
                onClick={() => setDrawerOpen(true)}
                sx={{
                  textTransform: "none",
                  px: 2,
                  borderColor: "rgba(0,0,0,0.12)",
                }}
                className="hidden md:flex"
              >
                Analytics
              </Button>
              <Tooltip title="View Analytics">
                <IconButton
                  onClick={() => setDrawerOpen(true)}
                  className="md:hidden"
                >
                  <BarChart />
                </IconButton>
              </Tooltip>

              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExport}
                sx={{
                  textTransform: "none",
                  px: 2,
                  borderColor: "rgba(0,0,0,0.12)",
                }}
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
                  onChange={(e) =>
                    setFilters({ ...filters, groupBy: e.target.value as any })
                  }
                >
                  <MenuItem value="day">Daily</MenuItem>
                  <MenuItem value="week">Weekly</MenuItem>
                  <MenuItem value="month">Monthly</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="w-full">
              <FormControl size="small" fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  label="Customer"
                  value={filters.customerId}
                  onChange={(e) =>
                    setFilters({ ...filters, customerId: e.target.value })
                  }
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {customers.map((c: any) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
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
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />

            <TextField
              type="date"
              label="To"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
        </TableToolbar>

        {/* 3. Main Sorted Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader text="Loading sales data..." />
            </div>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                      <TableCell className="font-semibold text-slate-600 dark:text-slate-400 py-4 first:rounded-l-xl last:rounded-r-xl">
                        {filters.groupBy === "month"
                          ? "Month"
                          : filters.groupBy === "week"
                            ? "Week"
                            : "Date"}
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-semibold text-slate-600 dark:text-slate-400 py-4"
                      >
                        Transactions
                      </TableCell>
                      <TableCell
                        align="right"
                        className="font-semibold text-slate-600 dark:text-slate-400 py-4"
                      >
                        Volume
                      </TableCell>
                      <TableCell
                        align="right"
                        className="font-semibold text-slate-600 dark:text-slate-400 py-4"
                      >
                        Avg Rate
                      </TableCell>
                      <TableCell
                        align="right"
                        className="font-semibold text-slate-600 dark:text-slate-400 py-4"
                      >
                        Revenue
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-semibold text-slate-600 dark:text-slate-400 py-4"
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.length > 0 ? (
                      analyticsData.map((row: any, i) => {
                        let displayDate = row.dateGroup;
                        if (filters.groupBy === "week") {
                          displayDate = `Week ${row.dateGroup?.week}, ${row.dateGroup?.year}`;
                        } else if (filters.groupBy === "month") {
                          const dateObj = dayjs()
                            .year(row.dateGroup?.year)
                            .month(row.dateGroup?.month - 1);
                          displayDate = dateObj.format("MMMM YYYY");
                        } else {
                          displayDate = dayjs(row.dateGroup).format(
                            "DD MMM, YYYY",
                          );
                        }

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
                            <TableCell align="center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {row.count}
                                </span>
                                {row.uniqueCustomers > 0 && (
                                  <span className="text-[10px] text-slate-400">
                                    {row.uniqueCustomers} clients
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell align="right">
                              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">
                                {row.totalVolume.toFixed(1)} L
                              </span>
                            </TableCell>
                            <TableCell align="right">
                              <span className="text-slate-500 text-sm">
                                ₹{row.avgRate?.toFixed(1)}
                              </span>
                            </TableCell>
                            <TableCell align="right">
                              <span className="font-bold text-green-600">
                                ₹{row.totalAmount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  router.push(
                                    `/sales/record?date=${row.dateGroup}`,
                                  )
                                }
                                className="text-slate-400 hover:text-blue-600"
                              >
                                <ChevronRight />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          className="py-12 text-slate-500"
                        >
                          No data found for the selected period.
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
          className: "w-full md:w-[450px] p-6 bg-slate-50 dark:bg-slate-950",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Sales Analytics
          </h2>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            className="bg-white dark:bg-slate-900 shadow-sm"
          >
            <Close />
          </IconButton>
        </div>

        <div className="space-y-6 overflow-y-auto pb-10">
          <div className="grid grid-cols-2 gap-4">
            <KPICard
              title="Revenue Today"
              value={`₹${data.todayRevenue.toLocaleString()}`}
              subtitle="Daily Income"
              icon={<AttachMoney />}
              color="green"
            />
            <KPICard
              title="Volume Today"
              value={`${data.todayVolume.toFixed(1)} L`}
              subtitle="Daily Volume"
              icon={<LocalDrink />}
              color="blue"
            />
            <KPICard
              title="Month Revenue"
              value={`₹${data.monthRevenue.toLocaleString()}`}
              subtitle="Current"
              icon={<CalendarMonth />}
              color="purple"
            />
            <KPICard
              title="Month Volume"
              value={`${data.monthVolume.toFixed(0)} L`}
              subtitle="Current"
              icon={<TrendingUp />}
              color="orange"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Revenue Trend
              </h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl text-center">
            <p className="text-sm text-blue-700">
              Analytics overview based on current month/day snapshots. For
              detailed history, check the table.
            </p>
          </div>
        </div>
      </Drawer>
    </div>
          <ManageCustomersDrawer 
            open={isManageDrawerOpen}
            onClose={() => setIsManageDrawerOpen(false)}
            onUpdate={() => setRefreshKey(prev => prev + 1)}
          />
    
    </>
  );
};

const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  trend,
}: any) => {
  const colorClasses: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:-translate-y-1 duration-300">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}
        >
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
        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {value}
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

export default SalesDashboard;
