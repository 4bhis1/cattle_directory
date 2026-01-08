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
import StickyFooter from '../components/ui/StickyFooter';

interface Cattle {
  _id: string;
  cattleId: string;
  name: string;
  status?: { current: string };
  images?: string[];
}

interface MilkData {
  _id: string;
  cattleId: string;
  name: string;
  morningMilk: number;
  morningFat: number;
  eveningMilk: number;
  eveningFat: number;
  image?: string;
  status?: string;
}

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface MilkStatsFormProps {
  initialDate?: string;
}

// Define stable InputProps objects outside the component to prevent re-creation on every render
const literInputProps = {
  endAdornment: <InputAdornment position="end">L</InputAdornment>,
};

const currencyInputProps = {
  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
};

export default function MilkStatsForm({ initialDate }: MilkStatsFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const urlDate = searchParams.get('date');
  const [date, setDate] = useState(urlDate || initialDate || getTodayDate());
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
        } else {
          // Filter: only Active and Pregnant
          const allowed = ['active', 'pregnant'];
          cattleList = cattleList.filter((c: Cattle) => {
            const s = (typeof c.status === 'object' ? c.status.current : c.status)?.toLowerCase() || '';
            return allowed.includes(s);
          });
          // Sort: Active first, then Pregnant
          cattleList.sort((a: Cattle, b: Cattle) => {
            const sA = (typeof a.status === 'object' ? a.status.current : a.status)?.toLowerCase();
            const sB = (typeof b.status === 'object' ? b.status.current : b.status)?.toLowerCase();
            if (sA === 'active' && sB !== 'active') return -1;
            if (sA !== 'active' && sB === 'active') return 1;
            return 0;
          });
        }

        setCattle(cattleList);
        // Milk data initialization is now handled by the useEffect dependent on [cattle, date]
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

  // Fetch milk data when cattle or date changes
  useEffect(() => {
    const fetchMilkData = async () => {
      if (cattle.length === 0) return;

      try {
        setFetchingCattle(true);
        const res = await fetch(`/api/milk?date=${date}`);
        const data = await res.json();
        const milkRecords = data.success ? data.data : [];

        const newMilkData = cattle.map((c) => {
          const morningRecord = milkRecords.find((r: any) => r.cattleId === c._id && r.milkingSession === 'morning');
          const eveningRecord = milkRecords.find((r: any) => r.cattleId === c._id && r.milkingSession === 'evening');

          return {
            _id: c._id,
            cattleId: c.cattleId,
            name: c.name,
            morningMilk: morningRecord ? morningRecord.quantity : 0,
            morningFat: morningRecord ? (morningRecord.quality?.fat || 4.5) : 4.5,
            eveningMilk: eveningRecord ? eveningRecord.quantity : 0,
            eveningFat: eveningRecord ? (eveningRecord.quality?.fat || 4.5) : 4.5,
            image: (c.images && c.images.length > 0) ? c.images[c.images.length - 1] : undefined,
            status: typeof c.status === 'object' ? c.status.current : c.status
          };
        });
        setMilkData(newMilkData);
      } catch (error) {
        console.error('Error fetching milk data:', error);
      } finally {
        setFetchingCattle(false);
      }
    };

    fetchMilkData();
  }, [cattle, date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    const params = new URLSearchParams(searchParams.toString());
    if (newDate) {
      params.set('date', newDate);
    } else {
      params.delete('date');
    }
    router.replace(`?${params.toString()}`);
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
  const totalCost = 0; // Usage removed or calc differently if needed

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
      const promises = [];

      for (const cow of milkData) {
        // Morning Record
        if (cow.morningMilk > 0) {
          promises.push(fetch('/api/milk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cattleId: cow._id,
              milkingSession: 'morning',
              date: date,
              quantity: cow.morningMilk,
              quality: {
                fat: cow.morningFat,
                snf: 8.5,
                temperature: 35
              },
              soldTo: 'dairy',
              pricePerLiter: 0,
              totalAmount: 0,
              paymentStatus: 'pending',
              notes: `Session: Morning, Qty: ${cow.morningMilk}L, Fat: ${cow.morningFat}%`,
              recordedBy: 'Admin'
            })
          }).then(res => res.json()));
        }

        // Evening Record
        if (cow.eveningMilk > 0) {
          promises.push(fetch('/api/milk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cattleId: cow._id,
              milkingSession: 'evening',
              date: date,
              quantity: cow.eveningMilk,
              quality: {
                fat: cow.eveningFat,
                snf: 8.5,
                temperature: 35
              },
              soldTo: 'dairy',
              pricePerLiter: 0,
              totalAmount: 0,
              paymentStatus: 'pending',
              notes: `Session: Evening, Qty: ${cow.eveningMilk}L, Fat: ${cow.eveningFat}%`,
              recordedBy: 'Admin'
            })
          }).then(res => res.json()));
        }
      }

      await Promise.all(promises);

      setSnackbar({
        open: true,
        message: '🥛 Milk production records saved successfully!',
        severity: 'success',
      });

      // Reset form after successful submission
      // Refresh data instead of resetting to 0
      setTimeout(() => {
        // Trigger re-fetch by keeping date same? 
        // Actually, relying on useEffect might not work if dependencies haven't changed.
        // We should manually call fetch or just update local state if we want.
        // Or forces update.
        // Simplest is to just do nothing and keep the values, as they are now "Saved".
      }, 500);
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
                        <TableCell rowSpan={2} className="font-bold text-gray-600 py-4">
                          <Box className="flex items-center">
                            <Pets sx={{ mr: 1, color: '#3b82f6' }} />
                            Cow Name
                          </Box>
                        </TableCell>
                        <TableCell colSpan={2} align="center" className="font-bold text-gray-600 py-2 border-l border-gray-200">
                          <Box className="flex items-center justify-center text-blue-600">
                            <LocalDrink sx={{ mr: 1 }} fontSize="small" />
                            Morning
                          </Box>
                        </TableCell>
                        <TableCell colSpan={2} align="center" className="font-bold text-gray-600 py-2 border-l border-gray-200">
                          <Box className="flex items-center justify-center text-purple-600">
                            <LocalDrink sx={{ mr: 1 }} fontSize="small" />
                            Evening
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center" className="text-sm text-gray-500 border-l border-gray-200">Qty (L)</TableCell>
                        <TableCell align="center" className="text-sm text-gray-500">Fat (%)</TableCell>
                        <TableCell align="center" className="text-sm text-gray-500 border-l border-gray-200">Qty (L)</TableCell>
                        <TableCell align="center" className="text-sm text-gray-500">Fat (%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fetchingCattle ? (
                        <TableRow key="loading">
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
                                <Box className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden border border-gray-200">
                                  {cow.image ? (
                                    <img src={cow.image} alt={cow.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <Pets fontSize="small" className="text-gray-400" />
                                  )}
                                </Box>
                                <Box>
                                  <Typography variant="body1" className="font-semibold text-gray-800">
                                    {cow.name}
                                  </Typography>
                                  {cow.status && (
                                    <Chip
                                      label={cow.status}
                                      size="small"
                                      color={cow.status === 'active' ? 'success' : cow.status === 'pregnant' ? 'warning' : 'default'}
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell className="border-l border-gray-200">
                              <TextField
                                type="number"
                                value={cow.morningMilk}
                                onChange={(e) => handleInputChange(cow.cattleId, 'morningMilk', e.target.value)}
                                inputProps={{ min: 0, step: 0.1 }}
                                size="small"
                                fullWidth
                                InputProps={{ ...literInputProps, disableUnderline: true }}
                                variant="outlined"
                                sx={{ maxWidth: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={cow.morningFat}
                                onChange={(e) => handleInputChange(cow.cattleId, 'morningFat', e.target.value)}
                                inputProps={{ min: 0, step: 0.1 }}
                                size="small"
                                fullWidth
                                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                sx={{ maxWidth: 90 }}
                              />
                            </TableCell>
                            <TableCell className="border-l border-gray-200">
                              <TextField
                                type="number"
                                value={cow.eveningMilk}
                                onChange={(e) => handleInputChange(cow.cattleId, 'eveningMilk', e.target.value)}
                                inputProps={{ min: 0, step: 0.1 }}
                                size="small"
                                fullWidth
                                InputProps={{ ...literInputProps, disableUnderline: true }}
                                variant="outlined"
                                sx={{ maxWidth: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={cow.eveningFat}
                                onChange={(e) => handleInputChange(cow.cattleId, 'eveningFat', e.target.value)}
                                inputProps={{ min: 0, step: 0.1 }}
                                size="small"
                                fullWidth
                                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                sx={{ maxWidth: 90 }}
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
      <StickyFooter
        stats={[
          { label: 'Morning', value: totalMorningMilk.toFixed(1), unit: 'L', valueColor: 'text-blue-600' },
          { label: 'Evening', value: totalEveningMilk.toFixed(1), unit: 'L', valueColor: 'text-purple-600' },
          { label: 'Total', value: totalMilkProduced.toFixed(1), unit: 'L', valueColor: 'text-gray-800' }
          // Removed Income stat as rate is gone
        ]}
        submitButton={{
          text: 'Save Production',
          onClick: () => handleSubmit(),
          loading: loading,
          disabled: loading
        }}
      />

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
