"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  CalendarToday,
  Pets,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { calculateCattleLifecycle, CattleData, LifecycleResult } from './lifecycleCalculator';
import LifecycleTimeline from './LifecycleTimeline';

interface CattleLifecycleDashboardProps {
  cattleData: CattleData;
}

export default function CattleLifecycleDashboard({ cattleData }: CattleLifecycleDashboardProps) {
  const [lifecycle, setLifecycle] = useState<LifecycleResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cattleData) {
      try {
        const result = calculateCattleLifecycle(cattleData);
        setLifecycle(result);
      } catch (error) {
        console.error('Error calculating lifecycle:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [cattleData]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Calculating lifecycle milestones...
        </Typography>
      </Box>
    );
  }

  if (!lifecycle) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Unable to calculate lifecycle. Please check cattle data.
      </Alert>
    );
  }

  const { summary, gestationLength, timeline, currentStage, nextMilestone } = lifecycle;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Cattle Lifecycle Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {summary}
        </Typography>
      </Box>

      {/* Key Metrics Grid */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Current Stage */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: '100%',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Pets sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Current Stage
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {currentStage}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {cattleData.cattleType === 'buffalo' ? 'Buffalo' : 'Cow'} • {cattleData.breed}
            </Typography>
          </CardContent>
        </Card>

        {/* Next Milestone */}
        <Card
          sx={{
            background: nextMilestone 
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            height: '100%',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {nextMilestone ? (
                <Warning sx={{ mr: 1, fontSize: 28 }} />
              ) : (
                <CheckCircle sx={{ mr: 1, fontSize: 28 }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Next Milestone
              </Typography>
            </Box>
            {nextMilestone ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {nextMilestone.event}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {nextMilestone.daysFromNow !== undefined && nextMilestone.daysFromNow >= 0
                    ? `In ${nextMilestone.daysFromNow} day${nextMilestone.daysFromNow !== 1 ? 's' : ''}`
                    : 'Date passed'}
                </Typography>
              </>
            ) : (
              <Typography variant="body1">
                All milestones completed
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Gestation Info */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            height: '100%',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarToday sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Gestation Period
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {gestationLength} days
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {cattleData.cattleType === 'buffalo' 
                ? '~10 months (Buffaloes carry longer)'
                : '~9 months (Standard cow gestation)'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Urgent Actions Alert */}
      {nextMilestone && nextMilestone.daysFromNow !== undefined && nextMilestone.daysFromNow <= 14 && nextMilestone.daysFromNow >= 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-icon': {
              fontSize: 28,
            },
          }}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>
            Upcoming Action Required!
          </AlertTitle>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>{nextMilestone.event}</strong> is coming up in {nextMilestone.daysFromNow} day{nextMilestone.daysFromNow !== 1 ? 's' : ''}.
          </Typography>
          <Typography variant="body2">
            {nextMilestone.desc}
          </Typography>
        </Alert>
      )}

      {/* Biological Differences Info */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4,
          bgcolor: alpha('#667eea', 0.05),
          border: '1px solid',
          borderColor: alpha('#667eea', 0.2),
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#667eea' }}>
          📊 Why This Matters: Biological Differences
        </Typography>
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, color: '#667eea' }}>🐄 Cows:</Typography>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Gestation: <strong>283 days</strong> (~9 months)
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • First heat: <strong>15 months</strong> of age
              </Typography>
              <Typography variant="body2">
                • Heat cycle: Every <strong>21 days</strong>
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, color: '#764ba2' }}>🐃 Buffaloes:</Typography>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Gestation: <strong>310 days</strong> (~10 months) - Almost a month longer!
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • First heat: <strong>24 months</strong> of age (mature later)
              </Typography>
              <Typography variant="body2">
                • Heat cycle: Every <strong>21 days</strong>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Timeline Section */}
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUp sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Lifecycle Timeline
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <LifecycleTimeline events={timeline} gestationDays={gestationLength} />
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <AlertTitle>Important Note</AlertTitle>
        These dates are projections based on biological averages. Actual dates may vary by ±3-5 days 
        depending on individual animal health, nutrition, and environmental factors. Always consult 
        with a veterinarian for critical decisions.
      </Alert>
    </Box>
  );
}
