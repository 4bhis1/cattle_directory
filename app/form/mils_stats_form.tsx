'use client'
import React, { useState } from 'react';
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
} from '@mui/material';
import {
  CalendarMonth,
  LocalDrink,
  AttachMoney,
  Pets,
  CheckCircle,
} from '@mui/icons-material';

const sampleCows = [
  { id: 'C001', name: 'Bessie' },
  { id: 'C002', name: 'Molly' },
  { id: 'C003', name: 'Daisy' },
];

interface MilkData {
  id: string;
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
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(initialDate || getTodayDate());
  const [milkData, setMilkData] = useState<MilkData[]>(
    sampleCows.map((cow) => ({
      ...cow,
      morningMilk: 0,
      eveningMilk: 0,
      ratePerLiter: 40, // default rate
    }))
  );
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleInputChange = (
    cowId: string,
    field: keyof MilkData,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setMilkData((prev) =>
      prev.map((cow) =>
        cow.id === cowId ? { ...cow, [field]: numValue } : cow
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!date) {
      setSnackbar({
        open: true,
        message: 'Please select a date',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Date:', date);
      console.log('Milk Data:', milkData);

      setSnackbar({
        open: true,
        message: '🥛 Milk production record saved successfully!',
        severity: 'success',
      });

      // Reset form after successful submission
      setTimeout(() => {
        setDate(getTodayDate());
        setMilkData(
          sampleCows.map((cow) => ({
            ...cow,
            morningMilk: 0,
            eveningMilk: 0,
            ratePerLiter: 40,
          }))
        );
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save record. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Fade in={true} timeout={800}>
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          {/* Header */}
          <Box className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Milk Production Record
            </h2>
            <p className="text-gray-600 text-lg">
              Record daily milk production for your cattle
            </p>
          </Box>

          {/* Date Selection Section */}
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Paper elevation={3} className="p-8 mb-6 bg-white rounded-2xl">
              <Box className="flex items-center mb-4">
                <CalendarMonth sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
                <Typography variant="h5" className="font-bold text-gray-800">
                  Select Date
                </Typography>
              </Box>
              <Divider className="mb-6" />
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
                inputProps={{
                  max: getTodayDate(), // Disable future dates
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth />
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
            </Paper>
          </Zoom>

          {/* Milk Production Table Section */}
          <Zoom in={true} style={{ transitionDelay: '150ms' }}>
            <Paper elevation={3} className="p-8 mb-6 bg-white rounded-2xl">
              <Box className="flex items-center mb-6">
                <LocalDrink sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
                <Typography variant="h5" className="font-bold text-gray-800">
                  Milk Production Details
                </Typography>
              </Box>
              <Divider className="mb-6" />

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          backgroundColor: '#f3f4f6',
                        }}
                      >
                        <Box className="flex items-center">
                          <Pets sx={{ mr: 1, color: '#3b82f6' }} />
                          Cow Name
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          backgroundColor: '#f3f4f6',
                        }}
                      >
                        <Box className="flex items-center">
                          <LocalDrink sx={{ mr: 1, color: '#3b82f6' }} />
                          Morning Milk (liters)
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          backgroundColor: '#f3f4f6',
                        }}
                      >
                        <Box className="flex items-center">
                          <LocalDrink sx={{ mr: 1, color: '#3b82f6' }} />
                          Evening Milk (liters)
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          backgroundColor: '#f3f4f6',
                        }}
                      >
                        <Box className="flex items-center">
                          <AttachMoney sx={{ mr: 1, color: '#3b82f6' }} />
                          Rate per Liter (₹)
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {milkData.map((cow) => (
                      <TableRow
                        key={cow.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f9fafb',
                          },
                        }}
                      >
                        <TableCell>
                          <Box className="flex items-center">
                            <Pets sx={{ mr: 1, color: '#8b5cf6' }} />
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
                                cow.id,
                                'morningMilk',
                                e.target.value
                              )
                            }
                            inputProps={{ min: 0, step: 0.01 }}
                            size="small"
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="caption" color="textSecondary">
                                    L
                                  </Typography>
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
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={cow.eveningMilk}
                            onChange={(e) =>
                              handleInputChange(
                                cow.id,
                                'eveningMilk',
                                e.target.value
                              )
                            }
                            inputProps={{ min: 0, step: 0.01 }}
                            size="small"
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="caption" color="textSecondary">
                                    L
                                  </Typography>
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
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={cow.ratePerLiter}
                            onChange={(e) =>
                              handleInputChange(
                                cow.id,
                                'ratePerLiter',
                                e.target.value
                              )
                            }
                            inputProps={{ min: 0, step: 0.01 }}
                            size="small"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Typography variant="body2" color="textSecondary">
                                    ₹
                                  </Typography>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Zoom>

          {/* Summary Section with Save Button */}
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Paper elevation={3} className="p-8 mb-6 bg-white rounded-2xl">
              <Box className="flex items-center mb-6">
                <AttachMoney sx={{ fontSize: 32, color: '#8b5cf6', mr: 2 }} />
                <Typography variant="h5" className="font-bold text-gray-800">
                  Summary
                </Typography>
              </Box>
              <Divider className="mb-6" />

              <Box className="relative">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            backgroundColor: '#f3f4f6',
                            width: '200px',
                          }}
                        >
                          Action
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            backgroundColor: '#f3f4f6',
                          }}
                        >
                          <Box className="flex items-center">
                            <Pets sx={{ mr: 1, color: '#3b82f6' }} />
                            Cow Name
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            backgroundColor: '#f3f4f6',
                          }}
                        >
                          <Box className="flex items-center justify-end">
                            <LocalDrink sx={{ mr: 1, color: '#3b82f6' }} />
                            Total Milk (L)
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            backgroundColor: '#f3f4f6',
                          }}
                        >
                          <Box className="flex items-center justify-end">
                            <AttachMoney sx={{ mr: 1, color: '#3b82f6' }} />
                            Total Cost (₹)
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {milkData.map((cow, index) => {
                        const cowTotalMilk = cow.morningMilk + cow.eveningMilk;
                        const cowTotalCost = cowTotalMilk * cow.ratePerLiter;
                        return (
                          <TableRow
                            key={cow.id}
                            sx={{
                              '&:hover': {
                                backgroundColor: '#f9fafb',
                              },
                            }}
                          >
                            {index === 0 && (
                              <TableCell
                                rowSpan={milkData.length + 1}
                                sx={{
                                  verticalAlign: 'middle',
                                  width: '200px',
                                }}
                              >
                                <Button
                                  variant="contained"
                                  type="submit"
                                  disabled={loading}
                                  size="large"
                                  fullWidth
                                  sx={{
                                    py: 2,
                                    fontSize: '1rem',
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
                                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                      Saving...
                                    </>
                                  ) : (
                                    'SAVE RECORD'
                                  )}
                                </Button>
                              </TableCell>
                            )}
                            <TableCell>
                              <Box className="flex items-center">
                                <Pets sx={{ mr: 1, color: '#8b5cf6' }} />
                                <Typography variant="body1" className="font-semibold">
                                  {cow.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body1"
                                className="font-semibold text-blue-600"
                              >
                                {cowTotalMilk.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body1"
                                className="font-semibold text-purple-600"
                              >
                                ₹{cowTotalCost.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {/* Total Row - No Action cell since it's rowSpanned from first row */}
                      <TableRow
                        sx={{
                          backgroundColor: '#f9fafb',
                          '& td': {
                            borderTop: '2px solid #e5e7eb',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                          },
                        }}
                      >
                        <TableCell>
                          <Box className="flex items-center">
                            <LocalDrink sx={{ mr: 1, color: '#3b82f6' }} />
                            <Typography variant="body1" className="font-bold text-gray-800">
                              TOTAL - All Cattle
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body1"
                            className="font-bold text-blue-600"
                          >
                            {totalMilkProduced.toFixed(2)} L
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body1"
                            className="font-bold text-purple-600"
                          >
                            ₹{totalCost.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
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
