'use client'
import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  Breadcrumbs,
  Link,
  ImageList,
  ImageListItem,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Error,
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
} from '@mui/icons-material';

interface FormData {
  name: string;
  breed: string;
  cattleType: string;
  dateOfJoining: string;
  purchaseAmount: string;
  age: string;
  estimatedMilkProductionDaily: string;
  isGivingMilk: boolean;
  isPregnant: boolean;
  motherId: string;
  gallery: string[];
  lastPhotoDate?: string;
  lastMedicineDate?: string;
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
}

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export default function CattleForm() {
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
    isGivingMilk: false,
    isPregnant: false,
    motherId: '',
    gallery: [],
    lastPhotoDate: '',
    lastMedicineDate: '',
  });

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
      setTimeout(() => {
        setForm(prev => ({
          ...prev,
          name: 'Lakshmi',
          breed: 'Jersey',
          cattleType: 'cow',
          dateOfJoining: '2023-01-15',
          purchaseAmount: '45000',
          age: '4',
          estimatedMilkProductionDaily: '12',
          isGivingMilk: true,
          isPregnant: false,
          motherId: '',
          gallery: [
            'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=300&h=300&fit=crop'
          ],
          lastPhotoDate: '2023-10-01',
          lastMedicineDate: '2023-09-15',
        }));
      }, 500);
    } catch (error) {
      console.error('Error fetching cattle details:', error);
    }
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

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm({ ...form, [name]: checked });
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: cattleId ? '🐄 Cattle updated successfully!' : '🐄 Cattle added successfully!',
        severity: 'success',
      });
    }, 1500);
  };

  const getFieldStatus = (fieldName: string) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName]) return <Error color="error" />;
    if (form[fieldName as keyof FormData] && typeof form[fieldName as keyof FormData] === 'string') return <CheckCircle color="success" />;
    return null;
  };

  const calculateProgress = (): number => {
    const fields = ['name', 'breed', 'dateOfJoining', 'purchaseAmount', 'age'];
    const filled = fields.filter((key) => form[key as keyof FormData] && !errors[key]).length;
    return Math.round((filled / fields.length) * 100);
  };

  const isCurrentMonth = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const hasPhotoWarning = cattleId && !isCurrentMonth(form.lastPhotoDate);
  const hasMedsWarning = cattleId && !isCurrentMonth(form.lastMedicineDate);
  const profilePhoto = form.gallery.length > 0 ? form.gallery[form.gallery.length - 1] : '/placeholder-cow.png';

  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <Paper elevation={1} sx={{ position: 'sticky', top: 0, zIndex: 1100 }} className="bg-white border-b border-gray-200 mb-6">
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
                  <Link color="inherit" href="/cattle/dashboard" onClick={(e) => { e.preventDefault(); router.push('/cattle/dashboard'); }} className="no-underline hover:text-blue-600 cursor-pointer">
                    Cattle
                  </Link>
                  <Typography color="text.primary" sx={{ fontSize: '0.8rem' }}>{cattleId ? 'Edit Cattle' : 'Add Cattle'}</Typography>
                </Breadcrumbs>
                <Typography variant="h6" className="font-bold text-gray-800 leading-none mt-1">
                  {cattleId ? `Edit ${form.name || 'Cattle'}` : 'Add New Cattle'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Fade in={true} timeout={800}>
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4">

          {(hasPhotoWarning || hasMedsWarning) && (
            <Zoom in={true}>
              <Paper elevation={0} className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Warning color="warning" />
                  <Box>
                    <Typography variant="subtitle2" className="font-bold text-orange-800">
                      Attention Required
                    </Typography>
                    <Stack direction="row" spacing={2} mt={1}>
                      {hasPhotoWarning && (
                        <Chip
                          icon={<AddAPhoto />}
                          label="No photo added this month"
                          color="warning"
                          size="small"
                          variant="outlined"
                          onClick={() => document.getElementById('gallery-upload')?.click()}
                        />
                      )}
                      {hasMedsWarning && (
                        <Chip
                          icon={<Medication />}
                          label="No medicines added this month"
                          color="warning"
                          size="small"
                          variant="outlined"
                          onClick={() => router.push(`/medicine/add?cattleId=${cattleId}`)}
                        />
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Zoom>
          )}

          <Box className="mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Form Progress</span>
              <Chip
                label={`${calculateProgress()}%`}
                size="small"
                color={calculateProgress() === 100 ? 'success' : 'primary'}
                className="animate-pulse"
              />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </Box>

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
                    <InfoOutlined className="mr-2 text-blue-500" /> Status
                  </Typography>
                  <Divider className="mb-4" />

                  <Box className="space-y-4">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.isGivingMilk}
                          onChange={handleSwitchChange}
                          name="isGivingMilk"
                          color="primary"
                        />
                      }
                      label="Giving Milk"
                      className="w-full justify-between ml-0"
                    />
                    <Divider />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.isPregnant}
                          onChange={handleSwitchChange}
                          name="isPregnant"
                          color="secondary"
                        />
                      }
                      label="Pregnant"
                      className="w-full justify-between ml-0"
                    />
                  </Box>
                </Paper>
              </Zoom>

              {cattleId && (
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <Paper elevation={3} className="p-6 bg-white rounded-2xl border-l-4 border-l-purple-500">
                    <Typography variant="h6" className="mb-4 font-semibold text-gray-800">
                      Quick Actions
                    </Typography>
                    <Box className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outlined"
                        startIcon={<LocalDrink />}
                        onClick={() => router.push(`/milk?cattleId=${cattleId}`)}
                        size="small"
                      >
                        Milk
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Restaurant />}
                        onClick={() => router.push(`/feed/add?cattleId=${cattleId}`)}
                        size="small"
                      >
                        Feed
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Medication />}
                        onClick={() => router.push(`/medicine/add?cattleId=${cattleId}`)}
                        size="small"
                      >
                        Meds
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => router.push(`/waste/add?cattleId=${cattleId}`)}
                        size="small"
                      >
                        Waste
                      </Button>
                    </Box>
                  </Paper>
                </Zoom>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Paper elevation={3} className="p-8 bg-white rounded-2xl">
                  <Box className="flex items-center mb-6">
                    <Pets sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
                    <Typography variant="h5" className="font-bold text-gray-800">
                      Cattle Information
                    </Typography>
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
                      label="Age (years)"
                      name="age"
                      type="number"
                      value={form.age}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.age && !!errors.age}
                      helperText={touched.age && errors.age}
                      size="small"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{getFieldStatus('age')}</InputAdornment>,
                      }}
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

                    <TextField
                      fullWidth
                      label="Est. Milk (L/day)"
                      name="estimatedMilkProductionDaily"
                      type="number"
                      value={form.estimatedMilkProductionDaily}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.estimatedMilkProductionDaily && !!errors.estimatedMilkProductionDaily}
                      helperText={touched.estimatedMilkProductionDaily && errors.estimatedMilkProductionDaily}
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LocalDrink /></InputAdornment>,
                        endAdornment: <InputAdornment position="end">{getFieldStatus('estimatedMilkProductionDaily')}</InputAdornment>,
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
                  </div>
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
    </Box>
  );
}
