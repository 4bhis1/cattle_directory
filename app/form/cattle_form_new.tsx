'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    TextField,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
    InputAdornment,
    IconButton,
    Chip,
    Box,
    Fade,
    Zoom,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Paper,
    Divider,
    Avatar,
    Breadcrumbs,
    Link,
    ImageList,
    ImageListItem,
    Stack,
    Autocomplete,
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
    LocalDrink,
    InfoOutlined,
    CloudUpload,
    ArrowBack,
    NavigateNext,
    FamilyRestroom,
    PhotoLibrary,
    Delete,
    Restaurant,
    Medication,
    Warning,
    AddAPhoto,
    MonitorWeight,
    History,
    Vaccines,
    Science,
    HealthAndSafety,
} from '@mui/icons-material';

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
    expectedMilkProduction: string;
    motherId: string | null;
    gallery: string[];
    lastPhotoDate?: string; // Kept for UI logic, though not in schema directly in same way

    // New Status Fields
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
    const cattleId = params?.cattleId as string;

    const [form, setForm] = useState<FormData>({
        name: '',
        breed: '',
        cattleType: 'cow',
        dateOfJoining: '',
        purchaseAmount: '',
        age: '',
        estimatedMilkProductionDaily: '',
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

    // Auxiliary state for adding new records
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

    const fullCattleList = useMemo(() => {
        return allCattle.filter(c => {
            const status = typeof c.status === 'object' ? c.status.current : c.status;
            return c.gender === 'female' && status !== 'sold' && status !== 'deceased' && c._id !== cattleId;
        });
    }, [allCattle, cattleId]);

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
                    estimatedMilkProductionDaily: '0', // Not in generic schema, kept if UI needs it
                    expectedMilkProduction: c.expectedMilkProduction?.toString() || '',
                    numberOfBirths: c.numberOfBirths?.toString() || '',
                    motherId: c.motherId || '',
                    gallery: c.images || [],

                    status: c.status?.current || 'active',
                    // Try to find latest reason/semen from history if matches current status
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

    // Health & Weight Handlers
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
                // Update current weight and add to history
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Starting form submission...');
            // Clean up payload
            const cleanForm = { ...form };

            // Fix motherId: Convert empty string to null to avoid CastError
            if (!cleanForm.motherId || cleanForm.motherId === '') {
                (cleanForm as any).motherId = null;
            }

            // Ensure numeric values are numbers
            if (cleanForm.purchaseAmount) (cleanForm as any).purchaseAmount = parseFloat(cleanForm.purchaseAmount.toString());
            if (cleanForm.age) (cleanForm as any).age = parseFloat(cleanForm.age.toString());

            const payload = {
                name: cleanForm.name,
                category: cleanForm.cattleType,
                gender: 'female', // Defaulting as per previous form behavior
                breed: cleanForm.breed,
                dateOfBirth: cleanForm.dateOfBirthInput ? new Date(cleanForm.dateOfBirthInput).toISOString() : new Date(new Date().getFullYear() - (cleanForm.age as any || 0), 0, 1).toISOString(),
                dateOfAcquisition: cleanForm.dateOfJoining ? new Date(cleanForm.dateOfJoining).toISOString() : new Date().toISOString(),
                acquisitionType: 'purchased',
                purchasePrice: cleanForm.purchaseAmount,
                expectedMilkProduction: parseFloat(cleanForm.expectedMilkProduction || '0'),
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

                        // If history is empty, add new entry
                        if (existingHistory.length === 0) return [newEntry];

                        // Check if latest entry differs significantly
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

            const finalPayload = {
                ...payload,
                // Double check motherId
                motherId: (payload.motherId === '' || payload.motherId === undefined) ? null : payload.motherId
            };

            console.log('Sending Payload:', JSON.stringify(finalPayload, null, 2));

            // NOTE: The previous form didn't seem to load full history. 
            // If we want to APPEND history, we should probably let the backend handle pushing to arrays 
            // OR we ensure we have the full history loaded. 
            // I'll assume we are sending the full object.

            const method = cattleId ? 'PATCH' : 'POST'; // Updated to PATCH for updates usually
            const url = cattleId
                ? `/api/cattle/${cattleId}`
                : '/api/cattle';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload)
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
        <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
            <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 1100 }} className="bg-white border-b border-gray-200 mb-6">
                <Box className="max-w-5xl mx-auto px-4 py-3">
                    <Box className="flex items-center justify-between gap-4">
                        <Box className="flex items-center">
                            <IconButton onClick={() => router.back()} size="small" className="mr-2">
                                <ArrowBack />
                            </IconButton>
                            <Box>
                                <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" sx={{ '& .MuiBreadcrumbs-li': { fontSize: '0.8rem' } }}>
                                    <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer">
                                        Dashboard
                                    </Link>
                                    <Link color="inherit" href="/cattle/dashboard" onClick={(e) => { e.preventDefault(); router.push('/cattle/dashboard'); }} className="no-underline hover:text-blue-600 cursor-pointer">
                                        Cattle
                                    </Link>
                                    <Typography color="text.primary" sx={{ fontSize: '0.8rem' }} suppressHydrationWarning>{cattleId ? 'Edit Cattle' : 'Add Cattle'}</Typography>
                                </Breadcrumbs>
                                <Typography variant="h6" className="font-bold text-gray-800 leading-none mt-1" suppressHydrationWarning>
                                    {cattleId ? `Edit ${form.name || 'Cattle'}` : 'Add New Cattle'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box className="flex items-center gap-4 flex-1 justify-end">
                            <Box className="flex-1 max-w-xs hidden sm:block">
                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="caption" className="font-semibold text-gray-600">Profile Completion</Typography>
                                    <Typography variant="caption" className="font-bold text-blue-600">{calculateProgress()}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={calculateProgress()} sx={{ height: 6, borderRadius: 3 }} />
                            </Box>
                            <Button
                                variant="contained"
                                onClick={(e: any) => handleSubmit(e)} // Trigger form submit from outside form
                                disabled={loading}
                                sx={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                                    minWidth: 120
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : (cattleId ? 'Save Changes' : 'Add Cattle')}
                            </Button>
                        </Box>
                    </Box>
                    {/* Mobile Progress Bar */}
                    <Box className="sm:hidden mt-3">
                        <LinearProgress variant="determinate" value={calculateProgress()} sx={{ height: 4, borderRadius: 2 }} />
                    </Box>
                </Box>
            </Paper>

            <Fade in={true} timeout={800}>
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">

                            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                                <Paper elevation={3} className="p-6 bg-white rounded-2xl overflow-hidden">
                                    <Box className="flex items-center justify-between mb-4">
                                        <Typography variant="h6" className="font-semibold text-gray-800 flex items-center">
                                            <PhotoLibrary className="mr-2 text-pink-500" /> Gallery
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            size="small"
                                            startIcon={<CloudUpload />}
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
                                    </Box>

                                    <Box className="mb-4 flex justify-center">
                                        <Avatar
                                            src={profilePhoto}
                                            alt="Profile Preview"
                                            sx={{
                                                width: 150,
                                                height: 150,
                                                border: '4px solid #fff',
                                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                            }}
                                        />
                                    </Box>

                                    <Divider className="mb-4" />

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
                                        <Typography variant="body2" color="textSecondary" align="center">
                                            No photos yet. Add one to set profile picture.
                                        </Typography>
                                    )}
                                </Paper>
                            </Zoom>

                            <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                                <Paper elevation={3} className="p-6 bg-white rounded-2xl">
                                    <Typography variant="h6" className="mb-4 font-semibold text-gray-800 flex items-center">
                                        <InfoOutlined className="mr-2 text-blue-500" /> Current Status
                                    </Typography>
                                    <Divider className="mb-4" />

                                    <Box className="space-y-4">
                                        <Box className="mt-6 mb-6">
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
                                                <Box className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                                </Box>
                                            )}

                                            {form.status === 'pregnant' && (
                                                <Box className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Status History */}
                                        <Divider className="my-4" />
                                        <Typography variant="caption" className="font-semibold text-gray-500 mb-2 block">
                                            Status History
                                        </Typography>
                                        <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                            {form.statusHistory.length === 0 ? (
                                                <Typography variant="body2" color="textSecondary">No status records.</Typography>
                                            ) : (
                                                <Stack spacing={1}>
                                                    {/* Show only last 2 records */}
                                                    {form.statusHistory.slice().reverse().slice(0, 2).map((rec, i) => (
                                                        <Box key={i} display="flex" justifyContent="space-between" className="p-2 border rounded bg-gray-50">
                                                            <Box>
                                                                <Chip label={rec.status} size="small" color={rec.status === 'active' ? 'success' : 'warning'} variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                            </Box>
                                                            <Typography variant="caption" color="textSecondary">{new Date(rec.measuredAt).toLocaleDateString()}</Typography>
                                                        </Box>
                                                    ))}
                                                    {form.statusHistory.length > 2 && (
                                                        <Button size="small" onClick={() => setShowAllStatus(true)} sx={{ textTransform: 'none' }}>
                                                            View all {form.statusHistory.length} records
                                                        </Button>
                                                    )}
                                                </Stack>
                                            )}
                                        </Box>

                                        {/* Status Modal */}
                                        <Dialog open={showAllStatus} onClose={() => setShowAllStatus(false)}>
                                            <DialogTitle>Status History</DialogTitle>
                                            <DialogContent dividers>
                                                <List>
                                                    {form.statusHistory.slice().reverse().map((rec, i) => (
                                                        <ListItem key={i} divider>
                                                            <ListItemText
                                                                primary={
                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                        <Chip label={rec.status} size="small" color={rec.status === 'active' ? 'success' : 'warning'} />
                                                                        {rec.reason && <Typography variant="caption" color="textSecondary">({rec.reason})</Typography>}
                                                                        {rec.semen && <Typography variant="caption" color="textSecondary">(Semen: {rec.semen})</Typography>}
                                                                    </Box>
                                                                }
                                                                secondary={new Date(rec.measuredAt).toLocaleDateString()}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={() => setShowAllStatus(false)}>Close</Button>
                                            </DialogActions>
                                        </Dialog>
                                    </Box>
                                </Paper>
                            </Zoom>

                            {/* Weight Section */}
                            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                                <Paper elevation={3} className="p-6 bg-white rounded-2xl">
                                    <Typography variant="h6" className="mb-4 font-semibold text-gray-800 flex items-center">
                                        <MonitorWeight className="mr-2 text-green-500" /> Weight Records
                                    </Typography>
                                    <Divider className="mb-4" />

                                    <Box className="flex items-center space-x-2 mb-4">
                                        <TextField
                                            fullWidth
                                            label="New Weight (kg)"
                                            type="number"
                                            value={newWeight}
                                            onChange={(e) => setNewWeight(e.target.value)}
                                            size="small"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={addWeightRecord}
                                            disabled={!newWeight}
                                            disableElevation
                                            sx={{ height: 40, minWidth: 80 }}
                                        >
                                            Add
                                        </Button>
                                    </Box>

                                    <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                        {form.weightHistory.length === 0 && !form.currentWeight ? (
                                            <Typography variant="body2" color="textSecondary">No weight records.</Typography>
                                        ) : (
                                            <Stack spacing={1}>
                                                <Box display="flex" justifyContent="space-between" className="p-2 bg-gray-50 rounded">
                                                    <Typography variant="body2" fontWeight="bold">{form.currentWeight} kg</Typography>
                                                    <Typography variant="caption" color="textSecondary">(Current)</Typography>
                                                </Box>
                                                {/* Show only last 2 records */}
                                                {form.weightHistory.slice().reverse().slice(0, 2).map((rec, i) => (
                                                    <Box key={i} display="flex" justifyContent="space-between" className="p-2 border rounded">
                                                        <Typography variant="body2">{rec.weight} kg</Typography>
                                                        <Typography variant="caption">{new Date(rec.measuredAt).toLocaleDateString()}</Typography>
                                                    </Box>
                                                ))}
                                                {form.weightHistory.length > 2 && (
                                                    <Button size="small" onClick={() => setShowAllWeights(true)} sx={{ textTransform: 'none' }}>
                                                        View all {form.weightHistory.length} records
                                                    </Button>
                                                )}
                                            </Stack>
                                        )}
                                    </Box>

                                    {/* Weights Modal */}
                                    <Dialog open={showAllWeights} onClose={() => setShowAllWeights(false)}>
                                        <DialogTitle>Weight History</DialogTitle>
                                        <DialogContent dividers>
                                            <List>
                                                {form.weightHistory.slice().reverse().map((rec, i) => (
                                                    <ListItem key={i} divider>
                                                        <ListItemText
                                                            primary={`${rec.weight} kg`}
                                                            secondary={new Date(rec.measuredAt).toLocaleDateString()}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => setShowAllWeights(false)}>Close</Button>
                                        </DialogActions>
                                    </Dialog>
                                </Paper>
                            </Zoom>

                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                                <Paper elevation={3} className="p-8 bg-white rounded-2xl">

                                    {/* Cattle Information Header */}
                                    <Box className="mb-6">
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Box className="flex items-center">
                                                <Pets sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
                                                <Typography variant="h5" className="font-bold text-gray-800">
                                                    Cattle Information
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Divider className="mb-6" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                        <TextField
                                            fullWidth
                                            label="Date of Birth"
                                            name="dateOfBirthInput"
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                            value={form.dateOfBirthInput}
                                            onChange={(e: any) => {
                                                handleChange(e);
                                                // Auto-calculate age
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
                                        />

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

                                        <TextField
                                            fullWidth
                                            label="Expected Daily Milk (L)"
                                            name="expectedMilkProduction"
                                            type="number"
                                            value={form.expectedMilkProduction}
                                            onChange={handleChange}
                                            size="small"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">L</InputAdornment>,
                                            }}
                                        />

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
                                </Paper>
                            </Zoom>

                            {/* Vaccination Records Section */}
                            <Zoom in={true} style={{ transitionDelay: '250ms' }}>
                                <Paper elevation={3} className="p-8 bg-white rounded-2xl">
                                    <Box className="flex items-center mb-6">
                                        <Vaccines sx={{ fontSize: 28, color: '#8b5cf6', mr: 2 }} />
                                        <Typography variant="h6" className="font-bold text-gray-800">
                                            Health & Vaccination Records
                                        </Typography>
                                    </Box>
                                    <Divider className="mb-6" />

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
                                            <Button
                                                variant="contained"
                                                onClick={addVaccination}
                                                disabled={!newVaccine.vaccineName}
                                                disableElevation
                                                sx={{ height: 40, width: { xs: '100%', md: 'auto' } }}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>

                                    <Box>
                                        {form.vaccinations.length === 0 ? (
                                            <Typography variant="body2" align="center" color="textSecondary">No vaccination records added.</Typography>
                                        ) : (
                                            <Stack spacing={1}>
                                                {form.vaccinations.slice().reverse().slice(0, 2).map((vac, i) => (
                                                    <Paper key={i} elevation={0} className="p-3 bg-blue-50 border border-blue-100 flex justify-between items-center">
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight="bold">{vac.vaccineName}</Typography>
                                                            <Typography variant="caption">Date: {new Date(vac.administeredDate).toLocaleDateString()}</Typography>
                                                        </Box>
                                                        {vac.nextDueDate && (
                                                            <Chip label={`Next: ${new Date(vac.nextDueDate).toLocaleDateString()}`} size="small" color="primary" variant="outlined" />
                                                        )}
                                                    </Paper>
                                                ))}
                                                {form.vaccinations.length > 2 && (
                                                    <Button size="small" onClick={() => setShowAllVaccinations(true)} sx={{ textTransform: 'none' }}>
                                                        View all {form.vaccinations.length} records
                                                    </Button>
                                                )}
                                            </Stack>
                                        )}
                                    </Box>

                                    {/* Vaccinations Modal */}
                                    <Dialog open={showAllVaccinations} onClose={() => setShowAllVaccinations(false)}>
                                        <DialogTitle>Vaccination History</DialogTitle>
                                        <DialogContent dividers>
                                            <List>
                                                {form.vaccinations.slice().reverse().map((vac, i) => (
                                                    <ListItem key={i} divider>
                                                        <ListItemText
                                                            primary={vac.vaccineName}
                                                            secondary={
                                                                <>
                                                                    <Typography variant="body2" component="span" display="block">
                                                                        Administered: {new Date(vac.administeredDate).toLocaleDateString()}
                                                                    </Typography>
                                                                    {vac.nextDueDate && (
                                                                        <Typography variant="body2" component="span" color="primary">
                                                                            Next Due: {new Date(vac.nextDueDate).toLocaleDateString()}
                                                                        </Typography>
                                                                    )}
                                                                </>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => setShowAllVaccinations(false)}>Close</Button>
                                        </DialogActions>
                                    </Dialog>

                                </Paper>
                            </Zoom>

                            <Zoom in={true} style={{ transitionDelay: '350ms' }}>
                                <Box className="mt-4">
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        fullWidth
                                        disabled={loading}
                                        size="large"
                                        sx={{
                                            py: 2,
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                            borderRadius: '12px',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
                                            },
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                                                Saving...
                                            </>
                                        ) : (
                                            cattleId ? 'UPDATE CATTLE' : 'ADD CATTLE'
                                        )}
                                    </Button>
                                </Box>
                            </Zoom>
                        </div>
                    </div>
                </form>
            </Fade>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box >
    );
}
