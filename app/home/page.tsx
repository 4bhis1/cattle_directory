'use client'
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  Pets,
  LocalDrink,
  AttachMoney,
  TrendingUp,
  Warning,
  CalendarToday,
  Add,
  Edit,
  Dashboard,
} from '@mui/icons-material';
import Link from 'next/link';
import { Fade, Zoom } from '@mui/material';
import DairyDashboard from './dashboard';

// Mock data - Replace with actual API calls
const mockStats = {
  totalCattle: 12,
  totalMilkToday: 45.5,
  totalRevenue: 1820,
  growthRate: 8.5,
};

const mockUrgentItems = [
  {
    id: 1,
    type: 'vaccination',
    message: 'Bessie needs vaccination - Due in 2 days',
    priority: 'high',
  },
  {
    id: 2,
    type: 'health',
    message: 'Molly showing signs of illness',
    priority: 'high',
  },
  {
    id: 3,
    type: 'milk',
    message: 'Milk production dropped 15% this week',
    priority: 'medium',
  },
];

const mockRecentActivity = [
  { id: 1, action: 'Milk record added', date: 'Today, 8:30 AM', type: 'milk' },
  { id: 2, action: 'New cattle added: Daisy', date: 'Yesterday, 3:45 PM', type: 'cattle' },
  { id: 3, action: 'Milk record updated', date: '2 days ago', type: 'milk' },
];

export default function HomePage() {

  return <DairyDashboard />;

  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${month}-${day}-${year}`;
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Fade in={true} timeout={800}>
        <Box className="max-w-7xl mx-auto">
          {/* Header */}
          <Box className="mb-8">
            <Typography
              variant="h3"
              className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            >
              Cow Farm Dashboard
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Welcome back! Here's your farm overview
            </Typography>
          </Box>

          {/* Quick Actions */}
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Paper elevation={3} className="p-6 mb-6 bg-white rounded-2xl">
              <Box className="flex flex-wrap gap-4">
                <Link href="/cattle/add">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      },
                    }}
                  >
                    Add Cattle
                  </Button>
                </Link>
                <Link href="/feed/add">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      },
                    }}
                  >
                    Add Feeding Record
                  </Button>
                </Link>
                <Link href="/milk">
                  <Button
                    variant="outlined"
                    startIcon={<LocalDrink />}
                    sx={{
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      '&:hover': {
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    Record Milk
                  </Button>
                </Link>
                <Link href={`/milk/${getTodayDate()}`}>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    sx={{
                      borderColor: '#8b5cf6',
                      color: '#8b5cf6',
                      '&:hover': {
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      },
                    }}
                  >
                    Today's Records
                  </Button>
                </Link>
              </Box>
            </Paper>
          </Zoom>

          {/* Stats Cards */}
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} style={{ transitionDelay: '150ms' }}>
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
                          {mockStats.totalCattle}
                        </Typography>
                      </Box>
                      <Pets sx={{ fontSize: 48, color: '#3b82f6', opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
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
                          {mockStats.totalMilkToday}
                        </Typography>
                      </Box>
                      <LocalDrink sx={{ fontSize: 48, color: '#8b5cf6', opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} style={{ transitionDelay: '250ms' }}>
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
                          {mockStats.totalRevenue}
                        </Typography>
                      </Box>
                      <AttachMoney sx={{ fontSize: 48, color: '#10b981', opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
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
                          Growth Rate
                        </Typography>
                        <Typography variant="h4" className="font-bold text-yellow-600">
                          +{mockStats.growthRate}%
                        </Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 48, color: '#f59e0b', opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Urgent Items */}
            <Grid item xs={12} md={6}>
              <Zoom in={true} style={{ transitionDelay: '350ms' }}>
                <Paper elevation={3} className="p-6 bg-white rounded-2xl">
                  <Box className="flex items-center mb-4">
                    <Warning sx={{ fontSize: 32, color: '#ef4444', mr: 2 }} />
                    <Typography variant="h5" className="font-bold text-gray-800">
                      Urgent Items
                    </Typography>
                  </Box>
                  <Box className="space-y-3">
                    {mockUrgentItems.map((item) => (
                      <Alert
                        key={item.id}
                        severity={item.priority === 'high' ? 'error' : 'warning'}
                        sx={{
                          borderRadius: '12px',
                          '& .MuiAlert-icon': {
                            alignItems: 'center',
                          },
                        }}
                      >
                        <Typography variant="body2">{item.message}</Typography>
                      </Alert>
                    ))}
                  </Box>
                </Paper>
              </Zoom>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                <Paper elevation={3} className="p-6 bg-white rounded-2xl">
                  <Box className="flex items-center mb-4">
                    <CalendarToday sx={{ fontSize: 32, color: '#3b82f6', mr: 2 }} />
                    <Typography variant="h5" className="font-bold text-gray-800">
                      Recent Activity
                    </Typography>
                  </Box>
                  <Box className="space-y-3">
                    {mockRecentActivity.map((activity) => (
                      <Box
                        key={activity.id}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Box className="flex items-center justify-between">
                          <Typography variant="body1" className="font-medium">
                            {activity.action}
                          </Typography>
                          <Chip
                            label={activity.type}
                            size="small"
                            sx={{
                              backgroundColor:
                                activity.type === 'milk'
                                  ? 'rgba(59, 130, 246, 0.1)'
                                  : 'rgba(139, 92, 246, 0.1)',
                              color: activity.type === 'milk' ? '#3b82f6' : '#8b5cf6',
                            }}
                          />
                        </Box>
                        <Typography variant="caption" className="text-gray-500">
                          {activity.date}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>

          {/* Progress Summary */}
          <Zoom in={true} style={{ transitionDelay: '450ms' }}>
            <Paper elevation={3} className="p-6 mt-6 bg-white rounded-2xl">
              <Typography variant="h5" className="font-bold text-gray-800 mb-4">
                Monthly Progress
              </Typography>
              <Box className="space-y-4">
                <Box>
                  <Box className="flex justify-between mb-2">
                    <Typography variant="body2" className="font-medium">
                      Milk Production Target
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      75%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={75}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Box className="flex justify-between mb-2">
                    <Typography variant="body2" className="font-medium">
                      Revenue Target
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      60%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={60}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Box className="flex justify-between mb-2">
                    <Typography variant="body2" className="font-medium">
                      Health Check Completion
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      90%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={90}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #10b981, #f59e0b)',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Zoom>
        </Box>
      </Fade>
    </Box>
  );
}

