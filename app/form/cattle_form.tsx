'use client'
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
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
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Phone,
  LocationOn,
  CalendarMonth,
  AttachMoney,
  Pets,
  LocalDrink,
  InfoOutlined,
  CloudUpload,
  Store,
} from '@mui/icons-material';

interface FormData {
  name: string;
  breed: string;
  cattleType: string;
  dateOfJoining: string;
  purchaseAmount: string;
  sellerContactNumber: string;
  sellerAddress: string;
  age: string;
  photo: File | null;
  photoPreview: string;
  estimatedMilkProductionDaily: string;
}

interface FormErrors {
  [key: string]: string;
}

interface FormTouched {
  [key: string]: boolean;
}

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface CattleFormProps {
  cattleId?: string;
}

export default function CattleForm({ cattleId }: CattleFormProps) {
  const [form, setForm] = useState<FormData>({
    name: '',
    breed: '',
    cattleType: 'cow',
    dateOfJoining: '',
    purchaseAmount: '',
    sellerContactNumber: '',
    sellerAddress: '',
    age: '',
    photo: null,
    photoPreview: '',
    estimatedMilkProductionDaily: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Real-time validation
  const validateField = (name: string, value: string): string => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'breed':
        if (!value.trim()) error = 'Breed is required';
        break;
      case 'dateOfJoining':
        if (!value) error = 'Date is required';
        else if (new Date(value) > new Date()) error = 'Date cannot be in the future';
        break;
      case 'sellerContactNumber':
        if (value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          error = 'Phone number must be 10 digits';
        }
        break;
      case 'purchaseAmount':
        if (value && parseFloat(value) < 0) error = 'Amount cannot be negative';
        break;
      case 'age':
        if (value && (parseFloat(value) < 0 || parseFloat(value) > 30)) {
          error = 'Age must be between 0 and 30 years';
        }
        break;
      case 'photo':
        if (value && !isValidUrl(value)) {
          error = 'Please enter a valid URL';
        }
        break;
      case 'estimatedMilkProductionDaily':
        if (value && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
          error = 'Production must be between 0 and 100 liters';
        }
        break;
    }

    return error;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: 'Please upload a valid image file (JPG, PNG, WEBP)',
          severity: 'error',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'File size should be less than 5MB',
          severity: 'error',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({
          ...form,
          photo: file,
          photoPreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
    setFocusedField(null);
  };

  const handleFocus = (name: string) => {
    setFocusedField(name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    Object.keys(form).forEach((key) => {
      if (key === 'photo' || key === 'photoPreview') return; // Skip file fields
      const error = validateField(key, form[key as keyof FormData] as string);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(
        Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Cattle Form Data:', form);

      setSnackbar({
        open: true,
        message: '🐄 Cattle added successfully!',
        severity: 'success',
      });

      // Reset form after successful submission
      setTimeout(() => {
        setForm({
          name: '',
          breed: '',
          cattleType: 'cow',
          dateOfJoining: '',
          purchaseAmount: '',
          sellerContactNumber: '',
          sellerAddress: '',
          age: '',
          photo: null,
          photoPreview: '',
          estimatedMilkProductionDaily: '',
        });
        setTouched({});
        setErrors({});
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to add cattle. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (fieldName: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      name: <Pets />,
      breed: <Pets />,
      dateOfJoining: <CalendarMonth />,
      purchaseAmount: <AttachMoney />,
      sellerContactNumber: <Phone />,
      sellerAddress: <LocationOn />,
      estimatedMilkProductionDaily: <LocalDrink />,
    };
    return icons[fieldName];
  };

  const getFieldStatus = (fieldName: string) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName]) return <Error color="error" />;
    if (form[fieldName as keyof FormData]) return <CheckCircle color="success" />;
    return null;
  };

  const calculateProgress = (): number => {
    const fields = Object.keys(form);
    const filled = fields.filter((key) => form[key as keyof FormData] && !errors[key]).length;
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Fade in={true} timeout={800}>
        <form
          onSubmit={handleSubmit}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <Box className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Add New Cattle
            </h2>
            <p className="text-gray-600 text-lg">Fill in the details to register a new cattle</p>
            
            {/* Progress Indicator */}
            <Box className="mt-6 mb-2 max-w-md mx-auto">
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
          </Box>

          {/* Photo Upload Section */}
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Paper elevation={3} className="p-8 mb-6 bg-white rounded-2xl">
              <Box className="flex flex-col items-center">
                <Typography variant="h6" className="mb-4 font-semibold text-gray-800">
                  Cattle Photo
                </Typography>
                
                <Box className="relative mb-4">
                  <Avatar
                    src={form.photoPreview || '/placeholder-cow.png'}
                    alt="Cattle"
                    sx={{
                      width: 180,
                      height: 180,
                      border: '4px solid #e5e7eb',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    }}
                  />
                  {form.photoPreview && (
                    <CheckCircle
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        color: '#10b981',
                        bgcolor: 'white',
                        borderRadius: '50%',
                        fontSize: 32,
                      }}
                    />
                  )}
                </Box>

                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {form.photo ? 'Change Photo' : 'Upload Photo'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                <Typography variant="caption" className="mt-2 text-gray-500">
                  Maximum file size: 5MB. Supported formats: JPG, PNG, WEBP
                </Typography>
              </Box>
            </Paper>
          </Zoom>

          {/* Cattle Information Section */}
          <Zoom in={true} style={{ transitionDelay: '150ms' }}>
            <Paper elevation={3} className="p-8 mb-6 bg-white rounded-2xl">
              <Box className="flex items-center mb-6">
                <Pets sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
                <Typography variant="h5" className="font-bold text-gray-800">
                  Cattle Information
                </Typography>
              </Box>
              <Divider className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={() => handleFocus('name')}
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Pets />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {getFieldStatus('name')}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                </div>

                {/* Cattle Type */}
                <div>
                  <FormControl fullWidth required>
                    <InputLabel>Cattle Type</InputLabel>
                    <Select
                      label="Cattle Type"
                      name="cattleType"
                      value={form.cattleType}
                      onChange={handleSelectChange}
                      startAdornment={
                        <InputAdornment position="start">
                          <Pets />
                        </InputAdornment>
                      }
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3b82f6',
                          borderWidth: '2px',
                        },
                      }}
                    >
                      <MenuItem value="cow">🐄 Cow</MenuItem>
                      <MenuItem value="buffalo">🐃 Buffalo</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                {/* Breed */}
                <div>
                  <TextField
                    fullWidth
                    label="Breed"
                    name="breed"
                    value={form.breed}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={() => handleFocus('breed')}
                    error={touched.breed && !!errors.breed}
                    helperText={touched.breed && errors.breed}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Pets />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {getFieldStatus('breed')}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                </div>

                {/* Age */}
                <div>
                  <TextField
                    fullWidth
                    label="Age (years)"
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={() => handleFocus('age')}
                    error={touched.age && !!errors.age}
                    helperText={touched.age && errors.age}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Age of the cattle in years">
                            <IconButton size="small">
                              <InfoOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {getFieldStatus('age')}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                </div>

                {/* Date of Joining */}
                <div>
                  <TextField
                    fullWidth
                    label="Date of Joining"
                    name="dateOfJoining"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={form.dateOfJoining}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={() => handleFocus('dateOfJoining')}
                    error={touched.dateOfJoining && !!errors.dateOfJoining}
                    helperText={touched.dateOfJoining && errors.dateOfJoining}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonth />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {getFieldStatus('dateOfJoining')}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                </div>

                {/* Milk Production */}
                <div>
                  <TextField
                    fullWidth
                    label="Estimated Milk Production (daily, liters)"
                    name="estimatedMilkProductionDaily"
                    type="number"
                    value={form.estimatedMilkProductionDaily}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={() => handleFocus('estimatedMilkProductionDaily')}
                    error={
                      touched.estimatedMilkProductionDaily &&
                      !!errors.estimatedMilkProductionDaily
                    }
                    helperText={
                      touched.estimatedMilkProductionDaily &&
                      errors.estimatedMilkProductionDaily
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalDrink />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {getFieldStatus('estimatedMilkProductionDaily')}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </Paper>
          </Zoom>

          {/* Seller Information Section */}
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Paper elevation={3} className="p-8 mb-6 bg-white rounded-2xl">
              <Box className="flex items-center mb-6">
                <Store sx={{ fontSize: 32, color: '#8b5cf6', mr: 2 }} />
                <Typography variant="h5" className="font-bold text-gray-800">
                  Seller Information
                </Typography>
              </Box>
              <Divider className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Amount */}
                <div>
                  <TextField
                    fullWidth
                    label="Purchase Amount"
                    name="purchaseAmount"
                    type="number"
                    value={form.purchaseAmount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={() => handleFocus('purchaseAmount')}
                    error={touched.purchaseAmount && !!errors.purchaseAmount}
                    helperText={touched.purchaseAmount && errors.purchaseAmount}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {getFieldStatus('purchaseAmount')}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <TextField
                    fullWidth
                    label="Seller Contact Number"
                    name="sellerContactNumber"
                    value={form.sellerContactNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={() => handleFocus('sellerContactNumber')}
                    error={touched.sellerContactNumber && !!errors.sellerContactNumber}
                    helperText={
                      touched.sellerContactNumber && errors.sellerContactNumber
                        ? errors.sellerContactNumber
                        : 'Format: 10 digits'
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {getFieldStatus('sellerContactNumber')}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    label="Seller Address"
                    name="sellerAddress"
                    value={form.sellerAddress}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={() => handleFocus('sellerAddress')}
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                          <LocationOn />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </Paper>
          </Zoom>

          {/* Submit Button */}
          <Zoom in={true} style={{ transitionDelay: '250ms' }}>
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
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                    Submitting...
                  </>
                ) : (
                  'SUBMIT'
                )}
              </Button>
            </Box>
          </Zoom>
        </form>
      </Fade>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
