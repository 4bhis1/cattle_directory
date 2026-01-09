'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    TextField,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
    InputAdornment,
    IconButton,
    Chip,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Divider,
    Avatar,
    Breadcrumbs,
    Link,
    ImageList,
    ImageListItem,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import {
    CheckCircle,
    Error as ErrorIcon,
    CalendarMonth,
    AttachMoney,
    Pets,
    InfoOutlined,
    CloudUpload,
    ArrowBack,
    NavigateNext,
    FamilyRestroom,
    PhotoLibrary,
    Delete,
    MonitorWeight,
    Vaccines,
    HealthAndSafety,
    Science,
    WaterDrop,
} from '@mui/icons-material';

import StickyFooter, { SummaryData } from '../components/ui/StickyFooter';

interface Vaccination {
    vaccineName: string;
    administeredDate: string;
    nextDueDate: string;
}

interface WeightRecord {
    weight: number;
    measuredAt: string;
}

interface FormData {
    name: string;
    breed: string;
    cattleType: string;
    dateOfJoining: string;
    purchaseAmount: string;
    age: string;
    estimatedMilkProductionDaily: string;
    fatPercentage: string; // New Field
    expectedMilkProduction: string;
    motherId: string | null;
    gallery: string[];
    lastPhotoDate?: string;

    // Status
    status: 'active' | 'pregnant' | 'sick' | 'sold' | 'deceased' | 'dry';
    statusReason: string;
    semen: string;
    statusHistory: Array<{
        status: string;
        measuredAt: string;
        reason?: string;
        semen?: string;
    }>;

    // Weight
    currentWeight: string;
    weightHistory: WeightRecord[];

    // Health
    vaccinations: Vaccination[];

    // New Fields
    dateOfBirthInput: string;
    numberOfBirths: string;
}

interface FormErrors {
    [key: string]: string;
}

interface FormTouched {
    [key: string]: boolean;
}

interface Cattle {
    _id: string;
    name: string;
    cattleId: string;
    gender?: string;
    status?: string | { current: string };
    fatPercentage?: number;
}

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Pregnant', value: 'pregnant' },
    { label: 'Sick', value: 'sick' },
    { label: 'Sold', value: 'sold' },
    { label: 'Deceased', value: 'deceased' },
    { label: 'Dry', value: 'dry' },
];

export default function CattleFormNew() {
    const router = useRouter();
    const params = useParams();
    const cattleId = params?.id as string;
    const searchParams = useSearchParams();
    const initialDate = searchParams.get('date');

    const [form, setForm] = useState<FormData>({
        name: '',
        breed: '',
        cattleType: '',
        dateOfJoining: initialDate || new Date().toISOString().split('T')[0],
        purchaseAmount: '',
        age: '',
        estimatedMilkProductionDaily: '',
        fatPercentage: '',
        expectedMilkProduction: '',
        dateOfBirthInput: '',
        numberOfBirths: '',
        motherId: null,
        gallery: [],
        lastPhotoDate: '',

        status: 'active',
        statusReason: '',
        semen: '',
        statusHistory: [],
        currentWeight: '',
        weightHistory: [],
        vaccinations: []
    });

    const [newVaccine, setNewVaccine] = useState<Vaccination>({ vaccineName: '', administeredDate: '', nextDueDate: '' });
    const [newWeight, setNewWeight] = useState<string>('');

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<FormTouched>({});
    const [loading, setLoading] = useState(false);
    const [allCattle, setAllCattle] = useState<Cattle[]>([]);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: SnackbarSeverity;
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [showAllWeights, setShowAllWeights] = useState(false);
    const [showAllVaccinations, setShowAllVaccinations] = useState(false);
    const [showAllStatus, setShowAllStatus] = useState(false);

    useEffect(() => {
        fetchCattleList();
        if (cattleId && cattleId !== 'add') {
            fetchCattleDetails(cattleId);
        }
    }, [cattleId]);

    const fetchCattleList = async () => {
        try {
            const response = await fetch('/api/cattle');
            const data = await response.json();
            if (data.success) {
                const list = cattleId
                    ? data.data.filter((c: Cattle) => c._id !== cattleId)
                    : data.data;
                setAllCattle(list);
            }
        } catch (error) {
            console.error('Error fetching cattle list:', error);
        }
    };

    const fetchCattleDetails = async (id: string) => {
        try {
            const response = await fetch(`/api/cattle/${id}`);
            const data = await response.json();

            if (data.success && data.data) {
                const c = data.data;
                setForm(prev => ({
                    ...prev,
                    name: c.name,
                    breed: c.breed,
                    cattleType: c.category,
                    dateOfJoining: c.dateOfAcquisition ? c.dateOfAcquisition.split('T')[0] : '',
                    purchaseAmount: c.purchasePrice?.toString() || '',
                    age: calculateAge(c.dateOfBirth),
                    dateOfBirthInput: c.dateOfBirth ? c.dateOfBirth.split('T')[0] : '',
                    estimatedMilkProductionDaily: '0',
                    expectedMilkProduction: c.expectedMilkProduction?.toString() || '',
                    fatPercentage: c.fatPercentage?.toString() || '',
                    numberOfBirths: c.numberOfBirths?.toString() || '',
                    motherId: c.motherId || '',
                    gallery: c.images || [],

                    status: c.status?.current || 'active',
                    statusReason: c.status?.history?.length > 0 ? c.status.history[c.status.history.length - 1].reason : '',
                    semen: c.status?.history?.length > 0 ? c.status.history[c.status.history.length - 1].semen : '',
                    statusHistory: c.status?.history?.map((h: any) => ({
                        status: h.status,
                        measuredAt: h.measuredAt,
                        reason: h.reason,
                        semen: h.semen
                    })) || [],

                    currentWeight: c.weight?.current?.toString() || '',
                    weightHistory: c.weight?.history || [],
                    vaccinations: c.healthRecords?.vaccinations || []
                }));
            }
        } catch (error) {
            console.error('Error fetching cattle details:', error);
        }
    };

    const calculateAge = (dob: string) => {
        if (!dob) return '';
        const diff = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
    };

    const validateField = (name: string, value: any): string => {
        let error = '';
        if (name === 'name' && !value.trim()) error = 'Name is required';
        if (name === 'breed' && !value.trim()) error = 'Breed is required';
        if (name === 'dateOfJoining' && !value) error = 'Date is required';
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (touched[name]) {
            setErrors({ ...errors, [name]: validateField(name, value) });
        }
    };

    const handleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setForm(prev => ({
                        ...prev,
                        gallery: [...prev.gallery, reader.result as string],
                        lastPhotoDate: new Date().toISOString().split('T')[0]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeGalleryImage = (index: number) => {
        setForm(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validateField(name, value) });
    };

    const addVaccination = () => {
        if (newVaccine.vaccineName && newVaccine.administeredDate) {
            const updatedVaccines = [...form.vaccinations, newVaccine];
            setForm({ ...form, vaccinations: updatedVaccines });
            setNewVaccine({ vaccineName: '', administeredDate: '', nextDueDate: '' });
        }
    };

    const addWeightRecord = () => {
        if (newWeight) {
            const val = parseFloat(newWeight);
            if (!isNaN(val)) {
                const record: WeightRecord = {
                    weight: val,
                    measuredAt: new Date().toISOString()
                };
                setForm({
                    ...form,
                    currentWeight: newWeight,
                    weightHistory: [...form.weightHistory, record]
                });
                setNewWeight('');
            }
        }
    };

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const cleanForm = { ...form };
            if (!cleanForm.motherId || cleanForm.motherId === '') {
                (cleanForm as any).motherId = null;
            }
            if (cleanForm.purchaseAmount) (cleanForm as any).purchaseAmount = parseFloat(cleanForm.purchaseAmount.toString());
            if (cleanForm.age) (cleanForm as any).age = parseFloat(cleanForm.age.toString());

            const payload = {
                name: cleanForm.name,
                category: cleanForm.cattleType,
                gender: 'female',
                breed: cleanForm.breed,
                dateOfBirth: cleanForm.dateOfBirthInput ? new Date(cleanForm.dateOfBirthInput).toISOString() : new Date(new Date().getFullYear() - (cleanForm.age as any || 0), 0, 1).toISOString(),
                dateOfAcquisition: cleanForm.dateOfJoining ? new Date(cleanForm.dateOfJoining).toISOString() : new Date().toISOString(),
                acquisitionType: 'purchased',
                purchasePrice: cleanForm.purchaseAmount,
                expectedMilkProduction: parseFloat(cleanForm.expectedMilkProduction || '0'),
                fatPercentage: parseFloat(cleanForm.fatPercentage || '0'),
                numberOfBirths: parseFloat(cleanForm.numberOfBirths || '0'),

                weight: {
                    current: parseFloat(cleanForm.currentWeight || '0'),
                    history: cleanForm.weightHistory
                },

                status: {
                    current: cleanForm.status || 'active',
                    history: (() => {
                        const existingHistory = cleanForm.statusHistory || [];
                        const newEntry = {
                            status: cleanForm.status,
                            measuredAt: new Date(),
                            reason: cleanForm.statusReason,
                            semen: cleanForm.semen
                        };
                        if (existingHistory.length === 0) return [newEntry];
                        const last = existingHistory[existingHistory.length - 1];
                        if (last.status !== newEntry.status || last.reason !== newEntry.reason || last.semen !== newEntry.semen) {
                            return [...existingHistory, newEntry];
                        }
                        return existingHistory;
                    })()
                },

                healthRecords: {
                    lastCheckup: new Date(),
                    vaccinations: cleanForm.vaccinations
                },

                images: cleanForm.gallery,
                motherId: cleanForm.motherId,
                notes: ''
            };

            const method = cattleId ? 'PATCH' : 'POST';
            const url = cattleId ? `/api/cattle/${cattleId}` : '/api/cattle';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setSnackbar({
                    open: true,
                    message: cattleId ? '🐄 Cattle updated successfully!' : '🐄 Cattle added successfully!',
                    severity: 'success',
                });
                setTimeout(() => {
                    router.push('/cattle/dashboard');
                }, 1000);
            } else {
                throw new Error(data.message || data.error || 'Failed to save cattle');
            }
        } catch (error: any) {
            console.error('Error saving cattle:', error);
            setSnackbar({
                open: true,
                message: error.message || 'Failed to save cattle. Please try again.',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const getFieldStatus = (fieldName: string) => {
        if (!touched[fieldName]) return null;
        if (errors[fieldName]) return <ErrorIcon color="error" />;
        if (form[fieldName as keyof FormData] && typeof form[fieldName as keyof FormData] === 'string') return <CheckCircle color="success" />;
        return null;
    };

    const calculateProgress = (): number => {
        const fields = ['name', 'breed', 'dateOfJoining', 'purchaseAmount', 'age', 'status', 'currentWeight'];
        const filled = fields.filter((key) => form[key as keyof FormData]).length;
        return Math.round((filled / fields.length) * 100);
    };

    const profilePhoto = form.gallery.length > 0 ? form.gallery[form.gallery.length - 1] : '/placeholder-cow.png';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-0 transition-colors duration-300 flex flex-col relative">
            {/* STICKY TOP PROGRESS */}
            <div className='sticky top-0 z-50 w-full'>
                <LinearProgress
                    variant="determinate"
                    value={calculateProgress()}
                    sx={{
                        height: 6,
                        backgroundColor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }
                    }}
                />
            </div>

            <div className="w-full px-4 md:px-8 py-6 flex-grow">
                {/* Header */}
                <div className="mb-8">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="mb-4">
                        <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer text-slate-500 dark:text-slate-400 dark:hover:text-blue-400">
                            Dashboard
                        </Link>
                        <Link color="inherit" href="/cattle/dashboard" onClick={(e) => { e.preventDefault(); router.push('/cattle/dashboard'); }} className="no-underline hover:text-blue-600 cursor-pointer text-slate-500 dark:text-slate-400 dark:hover:text-blue-400">
                            Cattle
                        </Link>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{cattleId ? 'Edit Cattle' : 'Add Cattle'}</span>
                    </Breadcrumbs>

                    <div className="flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-10">
                            <IconButton onClick={() => router.back()} className="mr-4 bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                                <ArrowBack />
                            </IconButton>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                                    {cattleId ? `Edit Cattle` : 'Add New Cattle'}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {cattleId ? 'Update cattle details and records' : 'Register a new cattle to your farm'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            {/* Gallery Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                                        <PhotoLibrary className="mr-2 text-pink-500" /> Gallery
                                    </h3>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        size="small"
                                        startIcon={<CloudUpload />}
                                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                                    >
                                        Add
                                        <input
                                            id="gallery-upload"
                                            type="file"
                                            hidden
                                            multiple
                                            accept="image/*"
                                            onChange={handleGalleryUpload}
                                        />
                                    </Button>
                                </div>

                                <div className="mb-6 flex justify-center">
                                    <Avatar
                                        src={profilePhoto}
                                        alt="Profile Preview"
                                        sx={{
                                            width: 150,
                                            height: 150,
                                            border: '4px solid white',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                        }}
                                    />
                                </div>
                                <Divider className="mb-4 dark:border-slate-700" />
                                {form.gallery.length > 0 ? (
                                    <ImageList sx={{ width: '100%', maxHeight: 200 }} cols={3} rowHeight={80}>
                                        {form.gallery.map((item, index) => (
                                            <ImageListItem key={index}>
                                                <img
                                                    src={item}
                                                    alt={`Gallery ${index}`}
                                                    loading="lazy"
                                                    style={{ borderRadius: 8, height: '80px', objectFit: 'cover' }}
                                                />
                                                <IconButton
                                                    sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)', padding: '2px' }}
                                                    size="small"
                                                    onClick={() => removeGalleryImage(index)}
                                                >
                                                    <Delete fontSize="small" color="error" />
                                                </IconButton>
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                        No photos yet. Add one to set profile picture.
                                    </p>
                                )}
                            </div>

                            {/* Status Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center mb-4">
                                    <InfoOutlined className="mr-2 text-blue-500" /> Current Status
                                </h3>
                                <Divider className="mb-4 dark:border-slate-700" />
                                <div className="space-y-4">
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            label="Status"
                                            name="status"
                                            value={form.status}
                                            onChange={handleSelectChange}
                                            startAdornment={<InputAdornment position="start"><HealthAndSafety /></InputAdornment>}
                                        >
                                            {STATUS_OPTIONS.map((status) => (
                                                <MenuItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {(['sick', 'sold', 'deceased'].includes(form.status)) && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <TextField
                                                fullWidth
                                                label={form.status === 'sold' ? "Sold To & Price" : "Reason/Details"}
                                                name="statusReason"
                                                value={form.statusReason}
                                                onChange={handleChange}
                                                multiline
                                                rows={2}
                                                placeholder="Provide more details..."
                                                size="small"
                                            />
                                        </div>
                                    )}
                                    {form.status === 'pregnant' && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <TextField
                                                fullWidth
                                                label="Semen Used (Bull ID/Name)"
                                                name="semen"
                                                value={form.semen}
                                                onChange={handleChange}
                                                size="small"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><Science /></InputAdornment>
                                                }}
                                            />
                                        </div>
                                    )}

                                    <Divider className="my-4 dark:border-slate-700" />
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
                                        Status History
                                    </span>
                                    <div className="max-h-52 overflow-y-auto">
                                        {form.statusHistory.length === 0 ? (
                                            <p className="text-sm text-slate-400">No status records.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {form.statusHistory.slice().reverse().slice(0, 2).map((rec, i) => (
                                                    <div key={i} className="flex justify-between items-center p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50">
                                                        <div>
                                                            <Chip label={rec.status} size="small" color={rec.status === 'active' ? 'success' : 'warning'} variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                        </div>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(rec.measuredAt).toLocaleDateString()}</span>
                                                    </div>
                                                ))}
                                                {form.statusHistory.length > 2 && (
                                                    <Button size="small" onClick={() => setShowAllStatus(true)} sx={{ textTransform: 'none' }}>
                                                        View all {form.statusHistory.length} records
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Dialog open={showAllStatus} onClose={() => setShowAllStatus(false)}>
                                        <DialogTitle>Status History</DialogTitle>
                                        <DialogContent dividers>
                                            <List>
                                                {form.statusHistory.slice().reverse().map((rec, i) => (
                                                    <ListItem key={i} divider>
                                                        <ListItemText
                                                            primary={<div className="flex items-center gap-2"><Chip label={rec.status} size="small" color={rec.status === 'active' ? 'success' : 'warning'} />{rec.reason && <span className="text-xs text-slate-500">({rec.reason})</span>}</div>}
                                                            secondary={new Date(rec.measuredAt).toLocaleDateString()}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </DialogContent>
                                        <DialogActions><Button onClick={() => setShowAllStatus(false)}>Close</Button></DialogActions>
                                    </Dialog>
                                </div>
                            </div>

                            {/* Weight Section */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center mb-4">
                                    <MonitorWeight className="mr-2 text-green-500" /> Weight Records
                                </h3>
                                <Divider className="mb-4 dark:border-slate-700" />
                                <div className="flex items-center space-x-2 mb-4">
                                    <TextField
                                        fullWidth
                                        label="New Weight (kg)"
                                        type="number"
                                        value={newWeight}
                                        onChange={(e) => setNewWeight(e.target.value)}
                                        size="small"
                                        InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                                    />
                                    <Button variant="contained" onClick={addWeightRecord} disabled={!newWeight} disableElevation sx={{ height: 40, minWidth: 80 }}>Add</Button>
                                </div>
                                <div className="max-h-52 overflow-y-auto">
                                    {form.weightHistory.length === 0 && !form.currentWeight ? (
                                        <p className="text-sm text-slate-400">No weight records.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800">
                                                <span className="font-bold text-slate-800 dark:text-white">{form.currentWeight} kg</span>
                                                <span className="text-xs text-slate-500">(Current)</span>
                                            </div>
                                            {form.weightHistory.slice().reverse().slice(0, 2).map((rec, i) => (
                                                <div key={i} className="flex justify-between p-2 border border-slate-100 dark:border-slate-800 rounded">
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">{rec.weight} kg</span>
                                                    <span className="text-xs text-slate-500">{new Date(rec.measuredAt).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                            {form.weightHistory.length > 2 && (
                                                <Button size="small" onClick={() => setShowAllWeights(true)} sx={{ textTransform: 'none' }}>View all {form.weightHistory.length} records</Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Dialog open={showAllWeights} onClose={() => setShowAllWeights(false)}>
                                    <DialogTitle>Weight History</DialogTitle>
                                    <DialogContent dividers>
                                        <List>
                                            {form.weightHistory.slice().reverse().map((rec, i) => (
                                                <ListItem key={i} divider>
                                                    <ListItemText primary={`${rec.weight} kg`} secondary={new Date(rec.measuredAt).toLocaleDateString()} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </DialogContent>
                                    <DialogActions><Button onClick={() => setShowAllWeights(false)}>Close</Button></DialogActions>
                                </Dialog>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {/* Cattle Information */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                                <div className="flex items-center mb-6">
                                    <Pets sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        Cattle Information
                                    </h2>
                                </div>
                                <Divider className="mb-6 dark:border-slate-700" />

                                <div className="space-y-6">
                                    {/* Group 1: Name, Type, Breed */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Basic Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            <div className="md:col-span-12">
                                                <TextField
                                                    fullWidth
                                                    label="Name"
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.name && !!errors.name}
                                                    helperText={touched.name && errors.name}
                                                    required
                                                    size="small"
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><Pets /></InputAdornment>,
                                                        endAdornment: <InputAdornment position="end">{getFieldStatus('name')}</InputAdornment>,
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-6">
                                                <FormControl fullWidth required size="small">
                                                    <InputLabel>Cattle Type</InputLabel>
                                                    <Select
                                                        label="Cattle Type"
                                                        name="cattleType"
                                                        value={form.cattleType}
                                                        onChange={handleSelectChange}
                                                        startAdornment={<InputAdornment position="start"><Pets /></InputAdornment>}
                                                    >
                                                        <MenuItem value="cow">🐄 Cow</MenuItem>
                                                        <MenuItem value="buffalo">🐃 Buffalo</MenuItem>
                                                        <MenuItem value="heifer">Heifer</MenuItem>
                                                        <MenuItem value="calf">Calf</MenuItem>
                                                        <MenuItem value="bull">Bull</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div className="md:col-span-6">
                                                <TextField
                                                    fullWidth
                                                    label="Breed"
                                                    name="breed"
                                                    value={form.breed}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.breed && !!errors.breed}
                                                    helperText={touched.breed && errors.breed}
                                                    required
                                                    size="small"
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><Pets /></InputAdornment>,
                                                        endAdornment: <InputAdornment position="end">{getFieldStatus('breed')}</InputAdornment>,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Group 2: Life Cycle */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Life Cycle</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            <div className="md:col-span-6">
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Mother (if in farm)</InputLabel>
                                                    <Select
                                                        label="Mother (if in farm)"
                                                        name="motherId"
                                                        value={form.motherId}
                                                        onChange={handleSelectChange}
                                                        startAdornment={<InputAdornment position="start"><FamilyRestroom /></InputAdornment>}
                                                    >
                                                        <MenuItem value=""><em>None</em></MenuItem>
                                                        {allCattle.map((cow) => (
                                                            <MenuItem key={cow._id} value={cow._id}>
                                                                {cow.name} ({cow.cattleId})
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div className="md:col-span-6">
                                                <TextField
                                                    fullWidth
                                                    label="No. of Births"
                                                    name="numberOfBirths"
                                                    type="number"
                                                    value={form.numberOfBirths}
                                                    onChange={handleChange}
                                                    size="small"
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <TextField
                                                    fullWidth
                                                    label="Date of Birth"
                                                    name="dateOfBirthInput"
                                                    type="date"
                                                    InputLabelProps={{ shrink: true }}
                                                    value={form.dateOfBirthInput}
                                                    onChange={(e: any) => {
                                                        handleChange(e);
                                                        if (e.target.value) {
                                                            const age = calculateAge(e.target.value);
                                                            setForm(prev => ({ ...prev, age }));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                    required
                                                    size="small"
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><CalendarMonth /></InputAdornment>,
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <TextField
                                                    fullWidth
                                                    label="Date of Joining"
                                                    name="dateOfJoining"
                                                    type="date"
                                                    InputLabelProps={{ shrink: true }}
                                                    value={form.dateOfJoining}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.dateOfJoining && !!errors.dateOfJoining}
                                                    helperText={touched.dateOfJoining && errors.dateOfJoining}
                                                    required
                                                    size="small"
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><CalendarMonth /></InputAdornment>,
                                                        endAdornment: <InputAdornment position="end">{getFieldStatus('dateOfJoining')}</InputAdornment>,
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <TextField
                                                    fullWidth
                                                    label="Age (years)"
                                                    name="age"
                                                    type="number"
                                                    value={form.age}
                                                    InputProps={{
                                                        readOnly: true,
                                                        endAdornment: <InputAdornment position="end">Years</InputAdornment>,
                                                    }}
                                                    size="small"
                                                    variant="filled"
                                                    helperText="Calculated from Date of Birth"
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <TextField
                                                    fullWidth
                                                    label="Purchase Amount"
                                                    name="purchaseAmount"
                                                    type="number"
                                                    value={form.purchaseAmount}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.purchaseAmount && !!errors.purchaseAmount}
                                                    helperText={touched.purchaseAmount && errors.purchaseAmount}
                                                    size="small"
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                                                        endAdornment: <InputAdornment position="end">{getFieldStatus('purchaseAmount')}</InputAdornment>,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Group 3: Production */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Production Estimates</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            <div className="md:col-span-6">
                                                <TextField
                                                    fullWidth
                                                    label="Est. Daily Milk (L)"
                                                    name="expectedMilkProduction"
                                                    type="number"
                                                    value={form.expectedMilkProduction}
                                                    onChange={handleChange}
                                                    size="small"
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">L</InputAdornment>,
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-6">
                                                <TextField
                                                    fullWidth
                                                    label="Est. Fat Percentage (%)"
                                                    name="fatPercentage"
                                                    type="number"
                                                    value={form.fatPercentage}
                                                    onChange={handleChange}
                                                    size="small"
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><WaterDrop /></InputAdornment>,
                                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                    }}
                                                    placeholder="e.g. 4.5"
                                                    helperText="Average fat percentage for this cattle"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vaccination Records Section */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                                <div className="flex items-center mb-6">
                                    <Vaccines sx={{ fontSize: 28, color: '#8b5cf6', mr: 2 }} />
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                        Health & Vaccination Records
                                    </h3>
                                </div>
                                <Divider className="mb-6 dark:border-slate-700" />
                                <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
                                    <div className="flex-grow w-full md:w-auto">
                                        <TextField
                                            fullWidth
                                            label="Vaccine Name"
                                            size="small"
                                            value={newVaccine.vaccineName}
                                            onChange={(e) => setNewVaccine({ ...newVaccine, vaccineName: e.target.value })}
                                        />
                                    </div>
                                    <div className="w-full md:w-40">
                                        <TextField
                                            fullWidth
                                            label="Administered"
                                            type="date"
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            value={newVaccine.administeredDate}
                                            onChange={(e) => setNewVaccine({ ...newVaccine, administeredDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="w-full md:w-40">
                                        <TextField
                                            fullWidth
                                            label="Next Due"
                                            type="date"
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            value={newVaccine.nextDueDate}
                                            onChange={(e) => setNewVaccine({ ...newVaccine, nextDueDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="w-full md:w-auto">
                                        <Button variant="contained" onClick={addVaccination} disabled={!newVaccine.vaccineName} disableElevation sx={{ height: 40, width: { xs: '100%', md: 'auto' } }}>Add</Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {form.vaccinations.length === 0 ? (
                                        <p className="text-center text-slate-400">No vaccination records added.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {form.vaccinations.slice().reverse().slice(0, 2).map((vac, i) => (
                                                <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex justify-between items-center rounded-lg">
                                                    <div>
                                                        <span className="block font-bold text-slate-800 dark:text-white text-sm">{vac.vaccineName}</span>
                                                        <span className="text-xs text-slate-500">Date: {new Date(vac.administeredDate).toLocaleDateString()}</span>
                                                    </div>
                                                    {vac.nextDueDate && <Chip label={`Next: ${new Date(vac.nextDueDate).toLocaleDateString()}`} size="small" color="primary" variant="outlined" />}
                                                </div>
                                            ))}
                                            {form.vaccinations.length > 2 && (
                                                <Button size="small" onClick={() => setShowAllVaccinations(true)} sx={{ textTransform: 'none' }}>View all {form.vaccinations.length} records</Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Dialog open={showAllVaccinations} onClose={() => setShowAllVaccinations(false)}>
                                    <DialogTitle>Vaccination History</DialogTitle>
                                    <DialogContent dividers>
                                        <List>
                                            {form.vaccinations.slice().reverse().map((vac, i) => (
                                                <ListItem key={i} divider>
                                                    <ListItemText
                                                        primary={vac.vaccineName}
                                                        secondary={<><Typography variant="body2" component="span" display="block">Administered: {new Date(vac.administeredDate).toLocaleDateString()}</Typography>{vac.nextDueDate && <Typography variant="body2" component="span" color="primary">Next Due: {new Date(vac.nextDueDate).toLocaleDateString()}</Typography>}</>}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </DialogContent>
                                    <DialogActions><Button onClick={() => setShowAllVaccinations(false)}>Close</Button></DialogActions>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </form>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    sx={{ bottom: { xs: 100, sm: 100 } }}
                >
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </div>

            <StickyFooter
                summary={
                    <SummaryData stats={[
                        { label: 'Completion', value: `${calculateProgress()}%`, valueColor: 'text-blue-600 dark:text-blue-400' },
                        { label: 'Status', value: form.status.charAt(0).toUpperCase() + form.status.slice(1), valueColor: form.status === 'active' ? 'text-green-600' : 'text-amber-500' }
                    ]} />
                }
                submitButton={{
                    text: cattleId ? 'Update Cattle' : 'Save Cattle',
                    onClick: () => handleSubmit(),
                    loading: loading,
                    disabled: loading
                }}
            />
        </div>
    );
}
