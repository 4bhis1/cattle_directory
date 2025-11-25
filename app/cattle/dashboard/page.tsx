'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Paper,
    Typography,
    Button,
    Fade,
    Avatar,
    Chip,
    IconButton,
    LinearProgress,
    Breadcrumbs,
    Link,
    Tooltip,
} from '@mui/material';
import {
    Pets,
    ArrowBack,
    NavigateNext,
    Add,
    LocalDrink,
    Restaurant,
    Medication,
    ChildCare,
    Edit,
    DeleteOutline,
} from '@mui/icons-material';

interface Cattle {
    _id: string;
    cattleId: string;
    name: string;
    breed: string;
    status: string;
    motherId?: string;
    children?: Cattle[];
    // Mock stats
    lastMilk?: number;
    lastFeed?: number;
    lastWaste?: number;
}

export default function CattleDashboard() {
    const router = useRouter();
    const [cattleList, setCattleList] = useState<Cattle[]>([]);
    const [loading, setLoading] = useState(true);
    // Mock Admin Status - In a real app, this would come from auth context
    const [isAdmin, setIsAdmin] = useState(true);

    useEffect(() => {
        fetchCattle();
    }, []);

    const fetchCattle = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/cattle');
            const data = await response.json();

            if (data.success) {
                const allCattle: Cattle[] = data.data;

                // Build Hierarchy
                const cattleMap = new Map<string, Cattle>();
                allCattle.forEach(c => {
                    c.children = [];
                    // Mock stats for demo
                    c.lastMilk = Math.floor(Math.random() * 15) + 5;
                    c.lastFeed = Math.floor(Math.random() * 10) + 10;
                    c.lastWaste = Math.floor(Math.random() * 5) + 2;
                    cattleMap.set(c._id, c);
                });

                const rootCattle: Cattle[] = [];
                allCattle.forEach(c => {
                    if (c.motherId && cattleMap.has(c.motherId)) {
                        cattleMap.get(c.motherId)!.children!.push(c);
                    } else {
                        rootCattle.push(c);
                    }
                });

                setCattleList(rootCattle);
            }
        } catch (error) {
            console.error('Error fetching cattle:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderCattleCard = (cow: Cattle, depth = 0) => {
        return (
            <React.Fragment key={cow._id}>
                <Paper
                    elevation={0}
                    className={`mb-4 border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md ${depth > 0 ? 'ml-8 border-l-4 border-l-blue-200 bg-gray-50' : 'bg-white'}`}
                >
                    <Box className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <Box className="flex items-center gap-4 flex-1">
                            {depth > 0 && <ChildCare className="text-gray-400" />}
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    bgcolor: depth > 0 ? '#e0f2fe' : '#f3e8ff',
                                    color: depth > 0 ? '#0284c7' : '#9333ea'
                                }}
                            >
                                <Pets />
                            </Avatar>
                            <Box>
                                <Box className="flex items-center gap-2">
                                    <Typography variant="h6" className="font-bold text-gray-800 leading-tight">
                                        {cow.name}
                                    </Typography>
                                    <Chip
                                        label={cow.status}
                                        size="small"
                                        color={cow.status === 'active' ? 'success' : 'warning'}
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                    />
                                </Box>
                                <Typography variant="caption" className="text-gray-500 block">
                                    ID: {cow.cattleId} • {cow.breed}
                                </Typography>

                                {/* Clickable Stats */}
                                <Box className="flex gap-4 mt-3 flex-wrap">
                                    <Box
                                        className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                                        onClick={() => router.push(`/form/mils_stats_form?cattleId=${cow._id}`)}
                                    >
                                        <LocalDrink sx={{ fontSize: 16, color: '#3b82f6' }} />
                                        <Typography variant="caption" className="font-medium text-gray-600">
                                            {cow.lastMilk}L (Today)
                                        </Typography>
                                    </Box>
                                    <Box
                                        className="flex items-center gap-1 cursor-pointer hover:bg-green-50 px-2 py-1 rounded-md transition-colors"
                                        onClick={() => router.push(`/feed/add?cattleId=${cow._id}`)}
                                    >
                                        <Restaurant sx={{ fontSize: 16, color: '#10b981' }} />
                                        <Typography variant="caption" className="font-medium text-gray-600">
                                            {cow.lastFeed}kg (Today)
                                        </Typography>
                                    </Box>
                                    <Box
                                        className="flex items-center gap-1 cursor-pointer hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                                        onClick={() => router.push(`/waste/add?cattleId=${cow._id}`)}
                                    >
                                        <DeleteOutline sx={{ fontSize: 16, color: '#ef4444' }} />
                                        <Typography variant="caption" className="font-medium text-gray-600">
                                            {cow.lastWaste}kg (Today)
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Quick Actions */}
                        <Box className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <Tooltip title="Record Milk">
                                <IconButton
                                    size="small"
                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                                    onClick={() => router.push(`/form/mils_stats_form?cattleId=${cow._id}`)}
                                >
                                    <LocalDrink fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Record Feed">
                                <IconButton
                                    size="small"
                                    className="bg-green-50 text-green-600 hover:bg-green-100"
                                    onClick={() => router.push(`/feed/add?cattleId=${cow._id}`)}
                                >
                                    <Restaurant fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Add Medicine">
                                <IconButton
                                    size="small"
                                    className="bg-red-50 text-red-600 hover:bg-red-100"
                                    onClick={() => router.push(`/medicine/add?cattleId=${cow._id}`)}
                                >
                                    <Medication fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Details">
                                <IconButton
                                    size="small"
                                    className="bg-gray-50 text-gray-600 hover:bg-gray-100"
                                    onClick={() => router.push(`/cattle/${cow._id}`)}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Paper>
                {cow.children && cow.children.map(child => renderCattleCard(child, depth + 1))}
            </React.Fragment>
        );
    };

    return (
        <Box className="min-h-screen bg-gray-50 pb-20">
            {/* Sticky Header */}
            <Paper
                elevation={1}
                sx={{ position: 'sticky', top: 0, zIndex: 1100 }}
                className="bg-white border-b border-gray-200"
            >
                {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }} />}
                <Box className="max-w-5xl mx-auto px-4 py-3">
                    <Box className="flex items-center justify-between">
                        <Box className="flex items-center">
                            <IconButton onClick={() => router.back()} size="small" className="mr-2">
                                <ArrowBack />
                            </IconButton>
                            <Box>
                                <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" sx={{ '& .MuiBreadcrumbs-li': { fontSize: '0.8rem' } }}>
                                    <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer">
                                        Dashboard
                                    </Link>
                                    <Typography color="text.primary" sx={{ fontSize: '0.8rem' }}>Cattle</Typography>
                                </Breadcrumbs>
                                <Typography variant="h6" className="font-bold text-gray-800 leading-none mt-1">
                                    Cattle Management
                                </Typography>
                            </Box>
                        </Box>

                        {isAdmin && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => router.push('/cattle/add')}
                                sx={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                Add Cattle
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

            <Box className="max-w-5xl mx-auto px-4 py-6">
                <Fade in={true}>
                    <Box>
                        {cattleList.map(cow => renderCattleCard(cow))}
                    </Box>
                </Fade>
            </Box>
        </Box>
    );
}
