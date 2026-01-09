'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Typography,
    Button,
    Fade,
    Avatar,
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
    FrontLoader,
} from '@mui/icons-material';
import { TopHeader } from '@/app/components/ui/Header';
import PageLoader from 'next/dist/client/page-loader';

interface Cattle {
    _id: string;
    cattleId: string;
    name: string;
    breed: string;
    status: string | { current: string; history: any[] };
    motherId?: string;
    children?: Cattle[];
    dateOfBirth?: string;
    expectedMilkProduction?: number;
    numberOfBirths?: number;
    // Mock stats
    lastMilk?: number;
    lastFeed?: number;
    lastWaste?: number;
    images?: string[];
}

const calculateAge = (dobString?: string) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) + ' yrs';
};

const renderCattleCard = ({ cow, depth = 0, router }: any) => {
    const currentStatus = typeof cow.status === 'object' ? (cow.status as any).current : cow.status;

    return (
        <React.Fragment key={cow._id}>
            <div
                className={`mb-4 group relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg
                    ${depth > 0 ? 'ml-8 border-l-4 border-l-blue-200 bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm'}`}
            >
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5 flex-1">
                        {depth > 0 && <ChildCare className="text-slate-400" />}
                        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner
                                ${depth > 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400'}`}>
                            {cow.images && cow.images.length > 0 ? (
                                <Avatar src={cow.images[cow.images.length - 1]} sx={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Pets fontSize="inherit" />
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                                    {cow.name}
                                </h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded textxs font-bold uppercase tracking-wide border
                                        ${currentStatus === 'active'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                        : currentStatus === 'pregnant'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                                    {currentStatus}
                                </span>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-slate-700 dark:text-slate-300">ID: {cow.cattleId}</span>
                                <span>•</span>
                                <span>{cow.breed}</span>
                                <span>•</span>
                                <span>{calculateAge(cow.dateOfBirth)}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex gap-3">
                                {cow.expectedMilkProduction && <span>Exp. Milk: {cow.expectedMilkProduction}L</span>}
                                {cow.numberOfBirths && <span>Births: {cow.numberOfBirths}</span>}
                            </div>

                            {/* Clickable Stats */}
                            <div className="flex gap-3 mt-4">
                                <div
                                    className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors group/stat"
                                    onClick={() => router.push(`/milk?cattleId=${cow._id}`)}
                                >
                                    <LocalDrink sx={{ fontSize: 16 }} className="text-blue-500 group-hover/stat:scale-110 transition-transform" />
                                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                        {cow.lastMilk}L Today
                                    </span>
                                </div>
                                <div
                                    className="flex items-center gap-2 cursor-pointer bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors group/stat"
                                    onClick={() => router.push(`/feed/add?cattleId=${cow._id}`)}
                                >
                                    <Restaurant sx={{ fontSize: 16 }} className="text-emerald-500 group-hover/stat:scale-110 transition-transform" />
                                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        {cow.lastFeed}kg Today
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0 mt-2 md:mt-0">
                        <Tooltip title="Record Milk">
                            <IconButton
                                size="small"
                                className="bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700"
                                onClick={() => router.push(`/milk?cattleId=${cow._id}`)}
                            >
                                <LocalDrink fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Record Feed">
                            <IconButton
                                size="small"
                                className="bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700"
                                onClick={() => router.push(`/feed/add?cattleId=${cow._id}`)}
                            >
                                <Restaurant fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Details">
                            <IconButton
                                size="small"
                                className="bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700"
                                onClick={() => router.push(`/cattle/${cow._id}`)}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </div>
            {cow.children && cow.children.map(child => renderCattleCard(child, depth + 1))}
        </React.Fragment>
    );
};

const useFetchCattle = () => {
    const [cattleList, setCattleList] = useState<Cattle[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchCattle = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/cattle');
            const data = await response.json();

            if (data.success) {
                const allCattle: Cattle[] = data.data;
                setCattleList(allCattle);
                setLoading(false);
            } else {
                console.error('Failed to fetch cattle:', data.message);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching cattle:', error);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCattle();
    }, []);
    return { cattleList, loading };
}


export default function CattleDashboard() {
    const router = useRouter();
    let { cattleList, loading } = useFetchCattle();
    const isAdmin = true;
    loading = true;

    const actionButton = isAdmin && (
        <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/cattle/add')}
            sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)',
                padding: '8px 24px'
            }}
        >
            Add Cattle
        </Button>
    )

    const routes = <div>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
            <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer text-slate-500 dark:text-slate-400 text-sm">
                Dashboard
            </Link>
            <Typography color="text.primary" className="text-slate-800 dark:text-white font-medium text-sm">Cattle</Typography>
        </Breadcrumbs>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mt-1">
            Cattle Management
        </h1>
    </div>

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
            <TopHeader actionButton={actionButton} routes={routes} />
            <div className="mx-auto px-4 md:px-8 py-8">
                {loading && <div className='text-white h-full w-full flex items-center justify-center flex-1'>
                Loading...
                </div>}
                {!loading && cattleList.length === 0 ? (
                    <div className="flex flex-col  items-center justify-center p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Pets sx={{ fontSize: 40 }} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            No Cattle Records Found
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                            Your farm inventory is empty. Get started by adding your first cattle to the system.
                        </p>
                        {isAdmin && (
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => router.push('/cattle/add')}
                                sx={{ textTransform: 'none', borderRadius: '10px' }}
                            >
                                Add First Cattle
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cattleList.map(cow => renderCattleCard({ cow, depth: 0, router }))}
                    </div>
                )}
            </div>
        </div>
    );
}
