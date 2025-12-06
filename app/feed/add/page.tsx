'use client';
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
  Typography,
  Paper,
  LinearProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Avatar,
  Chip,
  Divider,
  Collapse,
} from '@mui/material';
import {
  CalendarMonth,
  Pets,
  ArrowBack,
  NavigateNext,
  Save,
  ExpandLess,
  ChildCare,
} from '@mui/icons-material';
import StickyFooter from '../../components/ui/StickyFooter';

interface Cattle {
  _id: string;
  cattleId: string;
  name: string;
  motherId?: string;
  children?: Cattle[];
}

interface FeedType {
  _id: string;
  name: string;
  unitOfMeasure: string;
  pricePerUnit: number;
}

// Structure: { [cattleId]: { [feedTypeId]: { morning: number, evening: number } } }
type FeedEntries = Record<string, Record<string, { morning: number; evening: number }>>;

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export default function FeedEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetCattleId = searchParams.get('cattleId');
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTodayDate());
  const [cattleList, setCattleList] = useState<Cattle[]>([]);
  const [feedTypes, setFeedTypes] = useState<FeedType[]>([]);
  const [entries, setEntries] = useState<FeedEntries>({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      const [cattleRes, feedRes] = await Promise.all([
        fetch('/api/cattle'),
        fetch('/api/feed')
      ]);

      const cattleData = await cattleRes.json();
      const feedData = await feedRes.json();

      if (cattleData.success && feedData.success) {
        let allCattle: Cattle[] = cattleData.data;
        if (targetCattleId) {
          allCattle = allCattle.filter(c => c._id === targetCattleId);
        }
        const allFeeds: FeedType[] = feedData.data;

        setFeedTypes(allFeeds);

        // Build Hierarchy
        const cattleMap = new Map<string, Cattle>();
        allCattle.forEach(c => {
          c.children = [];
          cattleMap.set(c._id, c);
        });

        const rootCattle: Cattle[] = [];
        allCattle.forEach(c => {
          // If we are filtering by ID, we might break the hierarchy if the parent isn't included.
          // If targetCattleId is set, we just show that cow (and maybe its children if they are in the list?)
          // But if we filter `allCattle` first, we only have that cow.
          // So we just push it to rootCattle.
          if (targetCattleId) {
            rootCattle.push(c);
          } else {
            if (c.motherId && cattleMap.has(c.motherId)) {
              cattleMap.get(c.motherId)!.children!.push(c);
            } else {
              rootCattle.push(c);
            }
          }
        });

        setCattleList(rootCattle);

        // Initialize entries
        const initialEntries: FeedEntries = {};
        allCattle.forEach(c => {
          initialEntries[c._id] = {};
          allFeeds.forEach(f => {
            initialEntries[c._id][f._id] = { morning: 0, evening: 0 };
          });
        });
        setEntries(initialEntries);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch data',
        severity: 'error',
      });
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (
    cattleId: string,
    feedTypeId: string,
    session: 'morning' | 'evening',
    value: number
  ) => {
    setEntries(prev => ({
      ...prev,
      [cattleId]: {
        ...prev[cattleId],
        [feedTypeId]: {
          ...prev[cattleId]?.[feedTypeId],
          [session]: value
        }
      }
    }));
  };

  // Calculations
  const calculateTotals = () => {
    let totalMorning = 0;
    let totalEvening = 0;
    let totalCost = 0;

    Object.keys(entries).forEach(cattleId => {
      Object.keys(entries[cattleId]).forEach(feedTypeId => {
        const entry = entries[cattleId][feedTypeId];
        const feed = feedTypes.find(f => f._id === feedTypeId);
        if (feed) {
          totalMorning += entry.morning || 0;
          totalEvening += entry.evening || 0;
          totalCost += ((entry.morning || 0) + (entry.evening || 0)) * feed.pricePerUnit;
        }
      });
    });

    return { totalMorning, totalEvening, totalCost };
  };

  const { totalMorning, totalEvening, totalCost } = calculateTotals();

  // Progress Calculation
  const calculateProgress = () => {
    let activeCattleCount = 0;
    let cattleWithEntry = 0;

    const countRecursive = (list: Cattle[]) => {
      list.forEach(c => {
        activeCattleCount++;
        const hasEntry = Object.values(entries[c._id] || {}).some(e => e.morning > 0 || e.evening > 0);
        if (hasEntry) cattleWithEntry++;
        if (c.children) countRecursive(c.children);
      });
    };
    countRecursive(cattleList);

    return activeCattleCount > 0 ? (cattleWithEntry / activeCattleCount) * 100 : 0;
  };

  const progress = calculateProgress();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];

      Object.keys(entries).forEach(cattleId => {
        Object.keys(entries[cattleId]).forEach(feedTypeId => {
          const entry = entries[cattleId][feedTypeId];
          if (entry.morning > 0 || entry.evening > 0) {
            const feed = feedTypes.find(f => f._id === feedTypeId);
            const totalQty = (entry.morning || 0) + (entry.evening || 0);

            const record = {
              date,
              feedType: feed?.name || 'Unknown', // Ideally send feedId, but API might expect string type
              quantity: totalQty,
              unit: feed?.unitOfMeasure || 'kg',
              cost: totalQty * (feed?.pricePerUnit || 0),
              notes: `Morning: ${entry.morning}, Evening: ${entry.evening}`,
              recordedBy: 'Admin',
              cattleId: cattleId,
              // If API supports feedId, add it here
            };

            promises.push(fetch('/api/feed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(record),
            }));
          }
        });
      });

      await Promise.all(promises);

      setSnackbar({
        open: true,
        message: '🌾 Feed records saved successfully!',
        severity: 'success',
      });

      // Reset
      setTimeout(() => {
        const resetEntries: FeedEntries = {};
        // Re-initialize with 0 (simplified, ideally re-fetch or deep clone reset)
        // For now just reload page or keep values? User might want to enter next day.
        // Let's just clear values.
        Object.keys(entries).forEach(cid => {
          resetEntries[cid] = {};
          feedTypes.forEach(f => {
            resetEntries[cid][f._id] = { morning: 0, evening: 0 };
          });
        });
        setEntries(resetEntries);
      }, 1500);

    } catch (error) {
      console.error('Error saving:', error);
      setSnackbar({ open: true, message: 'Failed to save records', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderCattleRow = (cow: Cattle, depth = 0) => {
    return (
      <React.Fragment key={cow._id}>
        <Paper
          elevation={0}
          className={`mb-4 border border-gray-200 rounded-xl overflow-hidden ${depth > 0 ? 'ml-8 border-l-4 border-l-blue-200 bg-gray-50' : 'bg-white'}`}
        >
          <Box className="p-4">
            <Box className="flex items-center mb-4">
              {depth > 0 && <ChildCare className="text-gray-400 mr-2" />}
              <Avatar sx={{ bgcolor: depth > 0 ? '#e0f2fe' : '#f3e8ff', color: depth > 0 ? '#0284c7' : '#9333ea', mr: 2 }}>
                <Pets fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h6" className="font-bold text-gray-800 leading-tight">
                  {cow.name}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  ID: {cow.cattleId}
                </Typography>
              </Box>
            </Box>

            {/* Feed Inputs - Horizontal Scroll for Mobile */}
            <Box sx={{ overflowX: 'auto', pb: 1 }}>
              <Box className="flex gap-4 min-w-max">
                {feedTypes.map(feed => (
                  <Box key={feed._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-w-[200px]">
                    <Typography variant="subtitle2" className="font-bold text-gray-700 mb-2 flex justify-between">
                      {feed.name}
                      <span className="text-xs font-normal text-gray-500">₹{feed.pricePerUnit}/{feed.unitOfMeasure}</span>
                    </Typography>
                    <Box className="flex gap-2">
                      <TextField
                        label="Morn"
                        type="number"
                        size="small"
                        value={entries[cow._id]?.[feed._id]?.morning || ''}
                        onChange={(e) => handleInputChange(cow._id, feed._id, 'morning', parseFloat(e.target.value))}
                        InputProps={{ endAdornment: <InputAdornment position="end" sx={{ fontSize: '0.7rem' }}>{feed.unitOfMeasure}</InputAdornment> }}
                        sx={{ bgcolor: 'white' }}
                      />
                      <TextField
                        label="Eve"
                        type="number"
                        size="small"
                        value={entries[cow._id]?.[feed._id]?.evening || ''}
                        onChange={(e) => handleInputChange(cow._id, feed._id, 'evening', parseFloat(e.target.value))}
                        InputProps={{ endAdornment: <InputAdornment position="end" sx={{ fontSize: '0.7rem' }}>{feed.unitOfMeasure}</InputAdornment> }}
                        sx={{ bgcolor: 'white' }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
        {cow.children && cow.children.map(child => renderCattleRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <Box className="min-h-screen bg-gray-50 pb-40">
      {/* Sticky Header */}
      <Paper
        elevation={2}
        sx={{ position: 'sticky', top: 0, zIndex: 1100, borderRadius: 0 }}
        className="bg-white/90 backdrop-blur-md border-b border-gray-200"
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            backgroundColor: 'transparent',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
            }
          }}
        />
        <Box className="max-w-7xl mx-auto px-4 py-3">
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
                  <Typography color="text.primary" sx={{ fontSize: '0.8rem' }}>Feed Entry</Typography>
                </Breadcrumbs>
                <Typography variant="h6" className="font-bold text-gray-800 leading-none mt-1">
                  Daily Feed Record
                </Typography>
              </Box>
            </Box>

            <TextField
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              sx={{ width: 150 }}
            />
          </Box>
        </Box>
      </Paper>

      <Box className="max-w-7xl mx-auto px-4 py-6">
        {fetchingData ? (
          <Box className="flex justify-center py-12">
            <CircularProgress />
          </Box>
        ) : (
          <Fade in={true}>
            <Box>
              {cattleList.map(cow => renderCattleRow(cow))}
            </Box>
          </Fade>
        )}
      </Box>

      {/* Sticky Bottom Bar */}
      <StickyFooter
        stats={[
          { label: 'Morning', value: totalMorning.toFixed(1), unit: 'kg', valueColor: 'text-blue-600' },
          { label: 'Evening', value: totalEvening.toFixed(1), unit: 'kg', valueColor: 'text-purple-600' },
          { label: 'Total Cost', value: `₹${totalCost.toFixed(0)}`, valueColor: 'text-green-600' }
        ]}
        submitButton={{
          text: 'Save Records',
          onClick: handleSubmit,
          loading: loading,
          disabled: loading
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 180, sm: 180 } }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
