'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Box,
  Fade,
  Zoom,
  Typography,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Breadcrumbs,
  Link,
  IconButton,
} from '@mui/material';
import {
  CalendarMonth,
  LocalDrink,
  AttachMoney,
  Pets,
  CheckCircle,
  ArrowBack,
  NavigateNext,
  Save,
} from '@mui/icons-material';

interface Cattle {
  _id: string;
  cattleId: string;
  name: string;
}

interface MilkData {
  _id: string;
  cattleId: string;
  name: string;
  morningMilk: number;
  eveningMilk: number;
  ratePerLiter: number;
}

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface MilkStatsFormProps {
  initialDate?: string;
}

export default function MilkStatsForm({ initialDate }: MilkStatsFormProps) {
  const router = useRouter();
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(initialDate || getTodayDate());
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [milkData, setMilkData] = useState<MilkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCattle, setFetchingCattle] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const searchParams = useSearchParams();
  const targetCattleId = searchParams.get('cattleId');

  // Fetch cattle on component mount
  useEffect(() => {
    fetchCattle();
  }, []);

  const fetchCattle = async () => {
    try {
      setFetchingCattle(true);
      const response = await fetch('/api/cattle');
      const data = await response.json();

      if (data.success) {
        let cattleList = data.data;
        if (targetCattleId) {
          cattleList = cattleList.filter((c: Cattle) => c._id === targetCattleId);
        }
        setCattle(cattleList);
        // Initialize milk data for each cattle
        setMilkData(
          cattleList.map((c: Cattle) => ({
            _id: c._id,
            cattleId: c.cattleId,
            name: c.name,
            morningMilk: 0,
            eveningMilk: 0,
            ratePerLiter: 45, // default rate
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching cattle:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch cattle data',
        severity: 'error',
      });
    } finally {
      setFetchingCattle(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleInputChange = (
    cattleId: string,
    field: keyof MilkData,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setMilkData((prev) =>
      prev.map((cow) =>
        cow.cattleId === cattleId ? { ...cow, [field]: numValue } : cow
      )
    );
  };

  const totalMilkProduced = milkData.reduce(
    (sum, cow) => sum + cow.morningMilk + cow.eveningMilk,
    0
  );
  const totalCost = milkData.reduce(
    (sum, cow) =>
      sum + (cow.morningMilk + cow.eveningMilk) * cow.ratePerLiter,
    0
  );

  const totalMorningMilk = milkData.reduce((sum, cow) => sum + cow.morningMilk, 0);
  const totalEveningMilk = milkData.reduce((sum, cow) => sum + cow.eveningMilk, 0);

  // Calculate progress
  const cowsWithMilk = milkData.filter(c => c.morningMilk > 0 || c.eveningMilk > 0).length;
  const progress = cattle.length > 0 ? (cowsWithMilk / cattle.length) * 100 : 0;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!date) {
      setSnackbar({
        open: true,
        message: 'Please select a date',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      // Save each cattle's milk record
      const promises = milkData
        .filter(cow => cow.morningMilk > 0 || cow.eveningMilk > 0) // Only save if there's milk
        .map(async (cow) => {
          const totalQuantity = cow.morningMilk + cow.eveningMilk;
          const milkRecord = {
            cattleId: cow._id,
            milkingSession: cow.morningMilk > cow.eveningMilk ? 'morning' : 'evening',
            date: date,
            quantity: totalQuantity,
            quality: {
              fat: 4.5,
              snf: 8.5,
              temperature: 35
            },
            soldTo: 'dairy',
            pricePerLiter: cow.ratePerLiter,
            totalAmount: totalQuantity * cow.ratePerLiter,
            paymentStatus: 'pending',
            notes: `Morning: ${cow.morningMilk}L, Evening: ${cow.eveningMilk}L`,
            recordedBy: 'Admin'
          };

          const response = await fetch('/api/milk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(milkRecord),
          });

          return response.json();
        });

      await Promise.all(promises);

      setSnackbar({
        open: true,
        message: '🥛 Milk production records saved successfully!',
        severity: 'success',
      });

      // Reset form after successful submission
      setTimeout(() => {
        setMilkData(
          cattle.map((c) => ({
            _id: c._id,
            cattleId: c.cattleId,
            name: c.name,
            morningMilk: 0,
            eveningMilk: 0,
            ratePerLiter: 45,
          }))
        );
      }, 1500);
    } catch (error) {
      console.error('Error saving milk records:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save records. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen bg-gray-50 pb-32">
      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          backgroundColor: '#e2e8f0',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
          }
        }}
      />

      <Box className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs & Header */}
        <Box className="mb-8">
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="mb-4">
            <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer">
              Dashboard
            </Link>
            <Typography color="text.primary">Milk Production</Typography>
          </Breadcrumbs>

          <Box className="flex items-center justify-between">
            <Box className="flex items-center">
              <IconButton onClick={() => router.back()} className="mr-4 bg-white shadow-sm hover:bg-gray-50">
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" className="font-bold text-gray-800">
                  Milk Production Record
                </Typography>
                <Typography variant="body1" className="text-gray-500">
                  Record daily milk production for your cattle
                </Typography>
              </Box>
            </Box>

            <Paper className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center">
              <CalendarMonth className="text-blue-600 mr-2" />
              <TextField
                type="date"
                value={date}
                onChange={handleDateChange}
                variant="standard"
                InputProps={{ disableUnderline: true }}
                sx={{ '& input': { fontSize: '1.1rem', fontWeight: 600, color: '#1e40af' } }}
              />
            </Paper>
          </Box>
        </Box>

        <Fade in={true} timeout={800}>
          <Box>
            {/* Milk Production Table Section */}
            <Zoom in={true} style={{ transitionDelay: '150ms' }}>
              <Paper elevation={0} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <TableContainer>
                  <Table>
                    <TableHead className="bg-gray-50">
                      <TableRow>
                        <TableCell className="font-bold text-gray-600 py-4">
                          <Box className="flex items-center">
                            <Pets sx={{ mr: 1, color: '#3b82f6' }} />
                            Cow Name
                          </Box>
                        </TableCell>
                        <TableCell className="font-bold text-gray-600 py-4">
                          <Box className="flex items-center">
                            <LocalDrink sx={{ mr: 1, color: '#3b82f6' }} />
                            Morning Milk (L)
                          </Box>
                        </TableCell>
                        <TableCell className="font-bold text-gray-600 py-4">
                          <Box className="flex items-center">
                            <LocalDrink sx={{ mr: 1, color: '#3b82f6' }} />
                            Evening Milk (L)
                          </Box>
                        </TableCell>
                        <TableCell className="font-bold text-gray-600 py-4">
                          <Box className="flex items-center">
                            <AttachMoney sx={{ mr: 1, color: '#3b82f6' }} />
                            Rate per Liter (₹)
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fetchingCattle ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" className="py-8">
                            <CircularProgress size={24} />
                          </TableCell>
                        </TableRow>
                      ) : (
                        milkData.map((cow) => (
                          <TableRow
                            key={cow.cattleId}
                            hover
                            className="transition-colors"
                          >
                            <TableCell>
                              <Box className="flex items-center">
                                <Box className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                                  <Pets fontSize="small" />
                                </Box>
                                <Typography variant="body1" className="font-semibold">
                                  {cow.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={cow.morningMilk}
                                onChange={(e) =>
                                  handleInputChange(
                                    cow.cattleId,
                                    'morningMilk',
                                    e.target.value
                                  )
                                }
                                inputProps={{ min: 0, step: 0.01 }}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">L</InputAdornment>
                                  ),
                                }}
                                sx={{ maxWidth: 150 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={cow.eveningMilk}
                                onChange={(e) =>
                                  handleInputChange(
                                    cow.cattleId,
                                    'eveningMilk',
                                    e.target.value
                                  )
                                }
                                inputProps={{ min: 0, step: 0.01 }}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">L</InputAdornment>
                                  ),
                                }}
                                sx={{ maxWidth: 150 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={cow.ratePerLiter}
                                onChange={(e) =>
                                  handleInputChange(
                                    cow.cattleId,
                                    'ratePerLiter',
                                    e.target.value
                                  )
                                }
                                inputProps={{ min: 0, step: 0.01 }}
                                size="small"
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">₹</InputAdornment>
                                  ),
                                }}
                                sx={{ maxWidth: 150 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Zoom>
          </Box>
        </Fade>
      </Box>

      {/* Fixed Bottom Bar */}
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
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex gap-8">
              <Box>
                <Typography variant="caption" className="text-gray-500 uppercase tracking-wider font-bold">Total Morning</Typography>
                <Typography variant="h6" className="text-blue-600 font-bold">{totalMorningMilk.toFixed(1)} L</Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-gray-500 uppercase tracking-wider font-bold">Total Evening</Typography>
                <Typography variant="h6" className="text-purple-600 font-bold">{totalEveningMilk.toFixed(1)} L</Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-gray-500 uppercase tracking-wider font-bold">Total Production</Typography>
                <Typography variant="h6" className="text-gray-800 font-bold">{totalMilkProduced.toFixed(1)} L</Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-gray-500 uppercase tracking-wider font-bold">Total Cost</Typography>
                <Typography variant="h6" className="text-green-600 font-bold">₹{totalCost.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => handleSubmit()}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            {loading ? 'Saving Records...' : 'Save Milk Records'}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 100, sm: 100 } }}
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
