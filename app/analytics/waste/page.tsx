'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
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
    Grid,
} from '@mui/material';
import {
    ArrowBack,
    Download,
    BarChart as BarChartIcon,
    FilterList,
    Close,
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
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

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const wasteTypes = ['Manure', 'Urine', 'Bedding Waste', 'Feed Waste', 'Other'];

export default function WasteAnalyticsPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    const [wasteData, setWasteData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openChartModal, setOpenChartModal] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [stats, setStats] = useState({
        totalQuantity: 0,
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
            const response = await fetch('/api/waste');
            const data = await response.json();

            if (data.success) {
                setWasteData(data.data);
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
    const filteredData = wasteData.filter(record => {
        const dateMatch = (!startDate || record.date >= startDate) && (!endDate || record.date <= endDate);
        const typeMatch = selectedType === 'all' || record.wasteType === selectedType;
        return dateMatch && typeMatch;
    });

    // Update Stats
    useEffect(() => {
        const totalQty = filteredData.reduce((sum: number, w: any) => sum + w.quantity, 0);
        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;

        setStats({
            totalQuantity: totalQty,
            avgPerDay: totalQty / days,
            recordCount: filteredData.length,
        });
    }, [filteredData, startDate, endDate]);

    // Chart Data
    const typeData = filteredData.reduce((acc: any, record: any) => {
        const type = record.wasteType;
        if (!acc[type]) {
            acc[type] = { name: type, value: 0 };
        }
        acc[type].value += record.quantity;
        return acc;
    }, {});
    const pieData = Object.values(typeData);

    const dailyData = filteredData.reduce((acc: any, record: any) => {
        const date = record.date;
        if (!acc[date]) {
            acc[date] = { date, quantity: 0 };
        }
        acc[date].quantity += record.quantity;
        return acc;
    }, {});
    const chartData = Object.values(dailyData).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const exportData = () => {
        const csv = [
            ['Date', 'Type', 'Quantity (kg)', 'Source', 'Disposal Method'],
            ...filteredData.map(w => [
                w.date,
                w.wasteType,
                w.quantity,
                w.source || '',
                w.disposalMethod || ''
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `waste-analytics-${startDate}-to-${endDate}.csv`;
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
                                Waste Analytics
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
                            <InputLabel>Waste Type</InputLabel>
                            <Select
                                value={selectedType}
                                label="Waste Type"
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                {wasteTypes.map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
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
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="right">Quantity (kg)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Source</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Disposal</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((record: any) => (
                                        <TableRow key={record._id} hover>
                                            <TableCell>{record.date}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={record.wasteType}
                                                    size="small"
                                                    variant="outlined"
                                                    color="success"
                                                />
                                            </TableCell>
                                            <TableCell align="right" className="font-medium">{record.quantity.toFixed(1)}</TableCell>
                                            <TableCell>{record.source || '-'}</TableCell>
                                            <TableCell>{record.disposalMethod || '-'}</TableCell>
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
                            <Typography variant="caption" className="text-gray-500 uppercase font-bold">Total Collected</Typography>
                            <Typography variant="h6" className="text-green-600 font-bold">{stats.totalQuantity.toFixed(0)} kg</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" className="text-gray-500 uppercase font-bold">Avg/Day</Typography>
                            <Typography variant="h6" className="text-blue-600 font-bold">{stats.avgPerDay.toFixed(1)} kg</Typography>
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
                    Waste Collection Analytics
                    <IconButton onClick={() => setOpenChartModal(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" className="mb-4">Daily Collection</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData as any[]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="quantity" fill="#10b981" name="Quantity (kg)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" className="mb-4">By Type</Typography>
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
