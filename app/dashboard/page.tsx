'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Pets,
    LocalDrink,
    AttachMoney,
    Add,
    Edit,
    Grass,
    MedicalServices,
    DeleteOutline,
    PointOfSale,
} from '@mui/icons-material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function DashboardPage() {
    const [tabValue, setTabValue] = useState(0);
    const [cattle, setCattle] = useState<any[]>([]);
    const [milk, setMilk] = useState<any[]>([]);
    const [feed, setFeed] = useState<any[]>([]);
    const [medicine, setMedicine] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [cattleRes, milkRes, feedRes, medicineRes, expensesRes, salesRes] = await Promise.all([
                fetch('/api/cattle'),
                fetch('/api/milk'),
                fetch('/api/feed'),
                fetch('/api/medicine'),
                fetch('/api/expenses'),
                fetch('/api/sales'),
            ]);

            const cattleData = await cattleRes.json();
            const milkData = await milkRes.json();
            const feedData = await feedRes.json();
            const medicineData = await medicineRes.json();
            const expensesData = await expensesRes.json();
            const salesData = await salesRes.json();

            setCattle(cattleData.data || []);
            setMilk(milkData.data || []);
            setFeed(feedData.data || []);
            setMedicine(medicineData.data || []);
            setExpenses(expensesData.data || []);
            setSales(salesData.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            const response = await fetch(`/api/${type}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchAllData();
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    // Calculate stats
    const totalMilkToday = milk
        .filter(m => m.date === new Date().toISOString().split('T')[0])
        .reduce((sum, m) => sum + m.quantity, 0);

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <Box className="max-w-7xl mx-auto">
                {/* Header */}
                <Box className="mb-8">
                    <Typography
                        variant="h3"
                        className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                    >
                        Dairy Farm Dashboard
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Manage your farm operations
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} className="mb-6">
                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            elevation={3}
                            sx={{
                                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                borderRadius: '16px',
                            }}
                        >
                            <CardContent>
                                <Box className="flex items-center justify-between">
                                    <Box>
                                        <Typography variant="body2" className="text-gray-600 mb-1">
                                            Total Cattle
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-blue-600">
                                            {cattle.length}
                                        </Typography>
                                    </Box>
                                    <Pets sx={{ fontSize: 48, color: '#3b82f6', opacity: 0.7 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            elevation={3}
                            sx={{
                                background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                                borderRadius: '16px',
                            }}
                        >
                            <CardContent>
                                <Box className="flex items-center justify-between">
                                    <Box>
                                        <Typography variant="body2" className="text-gray-600 mb-1">
                                            Milk Today (L)
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-purple-600">
                                            {totalMilkToday.toFixed(1)}
                                        </Typography>
                                    </Box>
                                    <LocalDrink sx={{ fontSize: 48, color: '#8b5cf6', opacity: 0.7 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            elevation={3}
                            sx={{
                                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                borderRadius: '16px',
                            }}
                        >
                            <CardContent>
                                <Box className="flex items-center justify-between">
                                    <Box>
                                        <Typography variant="body2" className="text-gray-600 mb-1">
                                            Revenue (₹)
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-green-600">
                                            {totalRevenue.toFixed(0)}
                                        </Typography>
                                    </Box>
                                    <AttachMoney sx={{ fontSize: 48, color: '#10b981', opacity: 0.7 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            elevation={3}
                            sx={{
                                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                borderRadius: '16px',
                            }}
                        >
                            <CardContent>
                                <Box className="flex items-center justify-between">
                                    <Box>
                                        <Typography variant="body2" className="text-gray-600 mb-1">
                                            Expenses (₹)
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-yellow-600">
                                            {totalExpenses.toFixed(0)}
                                        </Typography>
                                    </Box>
                                    <AttachMoney sx={{ fontSize: 48, color: '#f59e0b', opacity: 0.7 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs for different sections */}
                <Paper elevation={3} className="rounded-2xl">
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="farm sections">
                            <Tab label="Cattle" />
                            <Tab label="Milk Records" />
                            <Tab label="Feed" />
                            <Tab label="Medicine" />
                            <Tab label="Expenses" />
                            <Tab label="Sales" />
                        </Tabs>
                    </Box>

                    {/* Cattle Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6">Cattle Management</Typography>
                            <Link href="/cattle/add">
                                <Button variant="contained" startIcon={<Add />} color="primary">
                                    Add Cattle
                                </Button>
                            </Link>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Breed</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cattle.map((c: any) => (
                                        <TableRow key={c._id} hover>
                                            <TableCell>{c.cattleId}</TableCell>
                                            <TableCell>{c.name}</TableCell>
                                            <TableCell>
                                                <Chip label={c.category} size="small" color="primary" variant="outlined" />
                                            </TableCell>
                                            <TableCell>{c.breed}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={c.status}
                                                    size="small"
                                                    color={c.status === 'active' ? 'success' : 'warning'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/cattle/${c._id}/update`}>
                                                    <IconButton size="small" color="primary">
                                                        <Edit />
                                                    </IconButton>
                                                </Link>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete('cattle', c._id)}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Milk Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6">Milk Records</Typography>
                            <Button variant="contained" startIcon={<Add />} color="primary">
                                Add Milk Record
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Cattle ID</TableCell>
                                        <TableCell>Session</TableCell>
                                        <TableCell>Quantity (L)</TableCell>
                                        <TableCell>Price/L</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {milk.map((m: any) => (
                                        <TableRow key={m._id} hover>
                                            <TableCell>{m.date}</TableCell>
                                            <TableCell>{m.cattleId}</TableCell>
                                            <TableCell>
                                                <Chip label={m.milkingSession} size="small" />
                                            </TableCell>
                                            <TableCell>{m.quantity}</TableCell>
                                            <TableCell>₹{m.pricePerLiter}</TableCell>
                                            <TableCell>₹{m.totalAmount}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary">
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete('milk', m._id)}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Feed Tab */}
                    <TabPanel value={tabValue} index={2}>
                        <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6">Feed Inventory</Typography>
                            <Button variant="contained" startIcon={<Add />} color="primary">
                                Add Feed
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Current Stock</TableCell>
                                        <TableCell>Min Stock</TableCell>
                                        <TableCell>Price/Unit</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {feed.map((f: any) => (
                                        <TableRow key={f._id} hover>
                                            <TableCell>{f.name}</TableCell>
                                            <TableCell>
                                                <Chip label={f.feedType} size="small" color="secondary" variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                {f.currentStock} {f.unitOfMeasure}
                                            </TableCell>
                                            <TableCell>{f.minimumStock}</TableCell>
                                            <TableCell>₹{f.pricePerUnit}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary">
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete('feed', f._id)}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Medicine Tab */}
                    <TabPanel value={tabValue} index={3}>
                        <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6">Medicine Inventory</Typography>
                            <Button variant="contained" startIcon={<Add />} color="primary">
                                Add Medicine
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Stock</TableCell>
                                        <TableCell>Expiry Date</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {medicine.map((m: any) => (
                                        <TableRow key={m._id} hover>
                                            <TableCell>{m.medicineName}</TableCell>
                                            <TableCell>
                                                <Chip label={m.medicineType} size="small" color="info" variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                {m.currentStock} {m.unitOfMeasure}
                                            </TableCell>
                                            <TableCell>{m.expiryDate}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary">
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete('medicine', m._id)}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Expenses Tab */}
                    <TabPanel value={tabValue} index={4}>
                        <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6">Expenses</Typography>
                            <Button variant="contained" startIcon={<Add />} color="primary">
                                Add Expense
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Payment Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {expenses.map((e: any) => (
                                        <TableRow key={e._id} hover>
                                            <TableCell>{e.date}</TableCell>
                                            <TableCell>
                                                <Chip label={e.expenseCategory} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell>{e.description}</TableCell>
                                            <TableCell>₹{e.amount}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={e.paymentStatus}
                                                    size="small"
                                                    color={e.paymentStatus === 'paid' ? 'success' : 'warning'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary">
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete('expenses', e._id)}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Sales Tab */}
                    <TabPanel value={tabValue} index={5}>
                        <Box className="flex justify-between items-center mb-4">
                            <Typography variant="h6">Sales Records</Typography>
                            <Button variant="contained" startIcon={<Add />} color="primary">
                                Add Sale
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Client</TableCell>
                                        <TableCell>Quantity (L)</TableCell>
                                        <TableCell>Price/L</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Payment Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sales.map((s: any) => (
                                        <TableRow key={s._id} hover>
                                            <TableCell>{s.date}</TableCell>
                                            <TableCell>{s.clientName}</TableCell>
                                            <TableCell>{s.quantityInLiters}</TableCell>
                                            <TableCell>₹{s.pricePerLiter}</TableCell>
                                            <TableCell>₹{s.totalAmount}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={s.paymentStatus}
                                                    size="small"
                                                    color={s.paymentStatus === 'paid' ? 'success' : 'warning'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary">
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete('sales', s._id)}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                </Paper>
            </Box>
        </Box>
    );
}
