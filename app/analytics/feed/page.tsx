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
    Tabs,
    Tab,
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
    LineChart,
    Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

interface FeedItem {
    _id: string;
    name: string;
    feedType: string;
    currentStock: number;
    minimumStock: number;
    averageDailyConsumption: number;
    pricePerUnit: number;
}

interface ConsumptionRecord {
    _id: string;
    date: string;
    cattleId: string;
    feedType: string;
    quantity: number;
    cost: number;
    notes: string;
}

interface Cattle {
    _id: string;
    name: string;
    cattleId: string;
}

export default function FeedAnalyticsPage() {
    const [tabValue, setTabValue] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCattle, setSelectedCattle] = useState('all');
    const [selectedFeedType, setSelectedFeedType] = useState('all');

    const [feedInventory, setFeedInventory] = useState<FeedItem[]>([]);
    const [consumptionData, setConsumptionData] = useState<ConsumptionRecord[]>([]);
    const [cattleList, setCattleList] = useState<Cattle[]>([]);

    const [loading, setLoading] = useState(true);
    const [openChartModal, setOpenChartModal] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
            const [feedRes, cattleRes] = await Promise.all([
                fetch('/api/feed'),
                fetch('/api/cattle')
            ]);

            const feedData = await feedRes.json();
            const cattleData = await cattleRes.json();

            if (feedData.success) {
                setFeedInventory(feedData.data);
                // Mock consumption data since API might not return it fully yet
                // In a real app, we'd fetch /api/feed/consumption or similar
                // For now, I'll generate mock consumption based on inventory
                const mockConsumption = generateMockConsumption(feedData.data, cattleData.data);
                setConsumptionData(mockConsumption);
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

    const generateMockConsumption = (feeds: FeedItem[], cattle: Cattle[]) => {
        const records: ConsumptionRecord[] = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            cattle.forEach(cow => {
                if (Math.random() > 0.3) {
                    const feed = feeds[Math.floor(Math.random() * feeds.length)];
                    records.push({
                        _id: Math.random().toString(),
                        date: dateStr,
                        cattleId: cow._id,
                        feedType: feed.name,
                        quantity: Math.floor(Math.random() * 5) + 1,
                        cost: (Math.floor(Math.random() * 5) + 1) * feed.pricePerUnit,
                        notes: 'Morning feed'
                    });
                }
            });
        }
        return records;
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filters
    const filteredConsumption = consumptionData.filter(record => {
        const dateMatch = (!startDate || record.date >= startDate) && (!endDate || record.date <= endDate);
        const cattleMatch = selectedCattle === 'all' || record.cattleId === selectedCattle;
        const feedMatch = selectedFeedType === 'all' || record.feedType === selectedFeedType;
        return dateMatch && cattleMatch && feedMatch;
    });

    const filteredInventory = feedInventory.filter(item =>
        selectedFeedType === 'all' || item.name === selectedFeedType // Simplified, usually feedType is category
    );

    // Stats
    const totalStockVal = filteredInventory.reduce((sum, item) => sum + (item.currentStock * item.pricePerUnit), 0);
    const totalConsumptionQty = filteredConsumption.reduce((sum, item) => sum + item.quantity, 0);
    const totalConsumptionCost = filteredConsumption.reduce((sum, item) => sum + item.cost, 0);

    // Chart Data Preparation
    const stockChartData = filteredInventory.map(f => ({
        name: f.name,
        stock: f.currentStock,
        min: f.minimumStock
    }));

    const consumptionByCattle = filteredConsumption.reduce((acc: any, curr) => {
        const cowName = cattleList.find(c => c._id === curr.cattleId)?.name || 'Unknown';
        acc[cowName] = (acc[cowName] || 0) + curr.quantity;
        return acc;
    }, {});
    const consumptionPieData = Object.entries(consumptionByCattle).map(([name, value]) => ({ name, value }));

    const exportData = () => {
        const dataToExport = tabValue === 0 ? filteredInventory : filteredConsumption;
        const csvContent = "data:text/csv;charset=utf-8,"
            + Object.keys(dataToExport[0] || {}).join(",") + "\n"
            + dataToExport.map((row: any) => Object.values(row).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `feed_data_${tabValue === 0 ? 'inventory' : 'consumption'}.csv`);
        document.body.appendChild(link);
        link.click();
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
                                Feed Analytics
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

                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="feed tabs" sx={{ minHeight: 40 }}>
                        <Tab label="Inventory Stock" sx={{ py: 1 }} />
                        <Tab label="Consumption Log" sx={{ py: 1 }} />
                    </Tabs>

                    {/* Filters Row */}
                    <Box className="flex flex-wrap gap-3 mt-3 pb-2 items-center">
                        <FilterList fontSize="small" className="text-gray-400" />

                        {tabValue === 1 && (
                            <>
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
                            </>
                        )}

                        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
                            <InputLabel>Feed Type</InputLabel>
                            <Select
                                value={selectedFeedType}
                                label="Feed Type"
                                onChange={(e) => setSelectedFeedType(e.target.value)}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                {feedInventory.map(f => (
                                    <MenuItem key={f._id} value={f.name}>{f.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Paper>

            <Box className="max-w-7xl mx-auto px-4 py-6">
                {/* Content */}
                <Paper elevation={0} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <TableContainer sx={{ maxHeight: '60vh' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {tabValue === 0 ? (
                                        <>
                                            <TableCell className="font-bold bg-gray-50">Feed Name</TableCell>
                                            <TableCell className="font-bold bg-gray-50">Type</TableCell>
                                            <TableCell className="font-bold bg-gray-50" align="right">Stock (kg)</TableCell>
                                            <TableCell className="font-bold bg-gray-50" align="right">Price/Unit</TableCell>
                                            <TableCell className="font-bold bg-gray-50" align="right">Value</TableCell>
                                            <TableCell className="font-bold bg-gray-50">Status</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="font-bold bg-gray-50">Date</TableCell>
                                            <TableCell className="font-bold bg-gray-50">Cattle</TableCell>
                                            <TableCell className="font-bold bg-gray-50">Feed</TableCell>
                                            <TableCell className="font-bold bg-gray-50" align="right">Qty (kg)</TableCell>
                                            <TableCell className="font-bold bg-gray-50" align="right">Cost</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tabValue === 0 ? (
                                    filteredInventory
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => (
                                            <TableRow key={row._id} hover>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{row.feedType}</TableCell>
                                                <TableCell align="right">{row.currentStock}</TableCell>
                                                <TableCell align="right">₹{row.pricePerUnit}</TableCell>
                                                <TableCell align="right">₹{(row.currentStock * row.pricePerUnit).toFixed(0)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={row.currentStock < row.minimumStock ? 'Low' : 'OK'}
                                                        color={row.currentStock < row.minimumStock ? 'error' : 'success'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    filteredConsumption
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => (
                                            <TableRow key={row._id} hover>
                                                <TableCell>{row.date}</TableCell>
                                                <TableCell>{cattleList.find(c => c._id === row.cattleId)?.name || row.cattleId}</TableCell>
                                                <TableCell>{row.feedType}</TableCell>
                                                <TableCell align="right">{row.quantity}</TableCell>
                                                <TableCell align="right">₹{row.cost}</TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={tabValue === 0 ? filteredInventory.length : filteredConsumption.length}
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
                        {tabValue === 0 ? (
                            <>
                                <Box>
                                    <Typography variant="caption" className="text-gray-500 uppercase font-bold">Total Stock</Typography>
                                    <Typography variant="h6" className="text-blue-600 font-bold">
                                        {filteredInventory.reduce((sum, i) => sum + i.currentStock, 0)} kg
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" className="text-gray-500 uppercase font-bold">Total Value</Typography>
                                    <Typography variant="h6" className="text-green-600 font-bold">₹{totalStockVal.toFixed(0)}</Typography>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box>
                                    <Typography variant="caption" className="text-gray-500 uppercase font-bold">Total Consumed</Typography>
                                    <Typography variant="h6" className="text-blue-600 font-bold">{totalConsumptionQty} kg</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" className="text-gray-500 uppercase font-bold">Total Cost</Typography>
                                    <Typography variant="h6" className="text-green-600 font-bold">₹{totalConsumptionCost.toFixed(0)}</Typography>
                                </Box>
                            </>
                        )}
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
                    Analytics Charts
                    <IconButton onClick={() => setOpenChartModal(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" className="mb-4">Stock Levels</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stockChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="stock" fill="#3b82f6" name="Current Stock" />
                                    <Bar dataKey="min" fill="#ef4444" name="Min Required" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" className="mb-4">Consumption by Cattle</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={consumptionPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        {consumptionPieData.map((entry, index) => (
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
