'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Fade,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    TablePagination,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    ArrowBack,
    Download,
    BarChart as BarChartIcon,
    FilterList,
    Close,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

interface Cattle {
    _id: string;
    name: string;
    cattleId: string;
}

export default function MilkAnalyticsPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCattle, setSelectedCattle] = useState('all');
    const [selectedSession, setSelectedSession] = useState('all');

    const [milkData, setMilkData] = useState<any[]>([]);
    const [cattleList, setCattleList] = useState<Cattle[]>([]);
    const [loading, setLoading] = useState(true);
    const [openChartModal, setOpenChartModal] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [stats, setStats] = useState({
        totalQuantity: 0,
        totalRevenue: 0,
        avgPerDay: 0,
        recordCount: 0,
    });

    useEffect(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);

        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [milkRes, cattleRes] = await Promise.all([
                fetch('/api/milk'),
                fetch('/api/cattle')
            ]);

            const milkData = await milkRes.json();
            const cattleData = await cattleRes.json();

            if (milkData.success) {
                setMilkData(milkData.data);
            }
            if (cattleData.success) {
                setCattleList(cattleData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filter Logic
    const filteredData = milkData.filter(record => {
        const dateMatch = (!startDate || record.date >= startDate) && (!endDate || record.date <= endDate);
        const cattleMatch = selectedCattle === 'all' || record.cattleId === selectedCattle;
        const sessionMatch = selectedSession === 'all' || record.milkingSession === selectedSession;
        return dateMatch && cattleMatch && sessionMatch;
    });

    // Update Stats based on filtered data
    useEffect(() => {
        const totalQty = filteredData.reduce((sum: number, m: any) => sum + m.quantity, 0);
        const totalRev = filteredData.reduce((sum: number, m: any) => sum + m.totalAmount, 0);
        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;

        setStats({
            totalQuantity: totalQty,
            totalRevenue: totalRev,
            avgPerDay: totalQty / days,
            recordCount: filteredData.length,
        });
    }, [filteredData, startDate, endDate]);

    // Chart Data
    const dailyData = filteredData.reduce((acc: any, record: any) => {
        const date = record.date;
        if (!acc[date]) {
            acc[date] = { date, quantity: 0, revenue: 0 };
        }
        acc[date].quantity += record.quantity;
        acc[date].revenue += record.totalAmount;
        return acc;
    }, {});

    const chartData = Object.values(dailyData).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const sessionData = filteredData.reduce((acc: any, record: any) => {
        const session = record.milkingSession;
        if (!acc[session]) {
            acc[session] = { name: session, value: 0 };
        }
        acc[session].value += record.quantity;
        return acc;
    }, {});
    const pieData = Object.values(sessionData);

    const exportData = () => {
        const csv = [
            ['Date', 'Cattle Name', 'Session', 'Quantity (L)', 'Price/L', 'Total Amount'],
            ...filteredData.map(m => [
                m.date,
                cattleList.find(c => c._id === m.cattleId)?.name || m.cattleId,
                m.milkingSession,
                m.quantity,
                m.pricePerLiter,
                m.totalAmount
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `milk-analytics-${startDate}-to-${endDate}.csv`;
        a.click();
    };

    return (
        <Box className="min-h-screen bg-gray-50 pb-32">
            {/* Sticky Header */}
            <Paper
                elevation={1}
                sx={{ position: 'sticky', top: 0, zIndex: 1100 }}
                className="bg-white border-b border-gray-200"
            >
                <Box className="max-w-7xl mx-auto px-4 py-2">
                    <Box className="flex items-center justify-between mb-2">
                        <Box className="flex items-center">
                            <IconButton onClick={() => window.history.back()} size="small" className="mr-2">
                                <ArrowBack />
                            </IconButton>
                            <Typography variant="h6" className="font-bold text-gray-800">
                                Milk Analytics
                            </Typography>
                        </Box>
                        <Box className="flex gap-2">
                            <Button
                                variant="outlined"
                                startIcon={<BarChartIcon />}
                                onClick={() => setOpenChartModal(true)}
                                size="small"
                            >
                                View Charts
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={exportData}
                                size="small"
                            >
                                Export
                            </Button>
                        </Box>
                    </Box>

                    {/* Filters Row */}
                    <Box className="flex flex-wrap gap-3 mt-3 pb-2 items-center">
                        <FilterList fontSize="small" className="text-gray-400" />

                        <TextField
                            type="date"
                            size="small"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            sx={{ width: 130, bgcolor: 'white' }}
                        />
                        <Typography variant="body2" className="text-gray-400">-</Typography>
                        <TextField
                            type="date"
                            size="small"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            sx={{ width: 130, bgcolor: 'white' }}
                        />

                        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
                            <InputLabel>Cattle</InputLabel>
                            <Select
                                value={selectedCattle}
                                label="Cattle"
                                onChange={(e) => setSelectedCattle(e.target.value)}
                            >
                                <MenuItem value="all">All Cattle</MenuItem>
                                {cattleList.map(c => (
                                    <MenuItem key={c._id} value={c._id}>{c.name} ({c.cattleId})</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
                            <InputLabel>Session</InputLabel>
                            <Select
                                value={selectedSession}
                                label="Session"
                                onChange={(e) => setSelectedSession(e.target.value)}
                            >
                                <MenuItem value="all">All Sessions</MenuItem>
                                <MenuItem value="morning">Morning</MenuItem>
                                <MenuItem value="evening">Evening</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Paper>

            <Box className="max-w-7xl mx-auto px-4 py-6">
                {/* Data Table */}
                <Paper elevation={0} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <TableContainer sx={{ maxHeight: '60vh' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Cattle</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Session</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="right">Quantity (L)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="right">Price/L</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((record: any) => (
                                        <TableRow key={record._id} hover>
                                            <TableCell>{record.date}</TableCell>
                                            <TableCell>{cattleList.find(c => c._id === record.cattleId)?.name || record.cattleId}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={record.milkingSession}
                                                    size="small"
                                                    color={record.milkingSession === 'morning' ? 'primary' : 'secondary'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">{record.quantity.toFixed(2)}</TableCell>
                                            <TableCell align="right">₹{record.pricePerLiter}</TableCell>
                                            <TableCell align="right" className="font-medium">₹{record.totalAmount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={filteredData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Box>

            {/* Sticky Summary Footer */}
            <Paper
                elevation={4}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    borderRadius: '24px 24px 0 0'
                }}
                className="bg-white border-t border-gray-200"
            >
                <Box className="max-w-7xl mx-auto px-6 py-4">
                    <Box className="flex justify-between items-center overflow-x-auto gap-8">
                        <Box>
                            <Typography variant="caption" className="text-gray-500 uppercase font-bold">Total Milk</Typography>
                            <Typography variant="h6" className="text-blue-600 font-bold">{stats.totalQuantity.toFixed(1)} L</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" className="text-gray-500 uppercase font-bold">Avg/Day</Typography>
                            <Typography variant="h6" className="text-purple-600 font-bold">{stats.avgPerDay.toFixed(1)} L</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" className="text-gray-500 uppercase font-bold">Revenue</Typography>
                            <Typography variant="h6" className="text-green-600 font-bold">₹{stats.totalRevenue.toFixed(0)}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" className="text-gray-500 uppercase font-bold">Records</Typography>
                            <Typography variant="h6" className="text-gray-700 font-bold">{stats.recordCount}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Charts Modal */}
            <Dialog
                open={openChartModal}
                onClose={() => setOpenChartModal(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle className="flex justify-between items-center">
                    Milk Production Analytics
                    <IconButton onClick={() => setOpenChartModal(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" className="mb-4">Production Trend</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData as any[]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="quantity" stroke="#3b82f6" strokeWidth={2} name="Quantity (L)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" className="mb-4">Session Split</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenChartModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
