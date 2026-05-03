"use client";

import React from 'react';
import { TimelineEvent } from './lifecycleCalculator';
import { 
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { 
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  alpha,
} from '@mui/material';
import {
  FavoriteBorder,
  Cake,
  LocalHospital,
  Opacity,
  EventAvailable,
  WbSunny,
} from '@mui/icons-material';

interface LifecycleTimelineProps {
  events: TimelineEvent[];
  gestationDays: number;
}

const eventTypeConfig = {
  heat: {
    color: '#e91e63' as const,
    icon: FavoriteBorder,
    label: 'Heat/Breeding',
  },
  calving: {
    color: '#2e7d32' as const,
    icon: Cake,
    label: 'Calving',
  },
  milk: {
    color: '#1976d2' as const,
    icon: Opacity,
    label: 'Milk Production',
  },
  dry: {
    color: '#795548' as const,
    icon: LocalHospital,
    label: 'Dry Period',
  },
  puberty: {
    color: '#9c27b0' as const,
    icon: WbSunny,
    label: 'Maturity',
  },
  breeding: {
    color: '#ff9800' as const,
    icon: EventAvailable,
    label: 'Breeding Window',
  },
};

export default function LifecycleTimeline({ events, gestationDays }: LifecycleTimelineProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getTimeUntil = (daysFromNow?: number) => {
    if (daysFromNow === undefined) return '';
    
    if (daysFromNow < 0) {
      return `${Math.abs(daysFromNow)} days ago`;
    }
    if (daysFromNow === 0) return 'Today';
    if (daysFromNow === 1) return 'Tomorrow';
    if (daysFromNow < 7) return `In ${daysFromNow} days`;
    if (daysFromNow < 30) {
      const weeks = Math.floor(daysFromNow / 7);
      return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    if (daysFromNow < 365) {
      const months = Math.floor(daysFromNow / 30);
      return `In ${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(daysFromNow / 365);
    return `In ${years} year${years > 1 ? 's' : ''}`;
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Info Banner */}
      <Card 
        sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              🧬 Biological Cycle Information
            </Typography>
            <Chip 
              label={`Gestation: ${gestationDays} days`}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            This timeline shows predicted milestones based on biological constants. 
            Actual dates may vary ±3-5 days depending on individual animal health and nutrition.
          </Typography>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Timeline position="right">
        {events.map((event, index) => {
          const config = eventTypeConfig[event.type];
          const IconComponent = config.icon;
          const isUpcoming = !event.isPast && (event.daysFromNow ?? 0) >= 0;
          const isNear = isUpcoming && (event.daysFromNow ?? 999) <= 14;

          return (
            <TimelineItem key={index}>
              <TimelineOppositeContent
                sx={{ 
                  flex: 0.3,
                  py: 2,
                  px: 2,
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: event.isPast ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {formatDate(event.date)}
                </Typography>
                {event.endDate && (
                  <Typography variant="caption" color="text.secondary">
                    to {formatDate(event.endDate)}
                  </Typography>
                )}
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getTimeUntil(event.daysFromNow)}
                    size="small"
                    sx={{
                      bgcolor: isNear 
                        ? alpha(config.color, 0.15)
                        : event.isPast 
                        ? 'action.disabledBackground'
                        : alpha(config.color, 0.1),
                      color: isNear 
                        ? config.color
                        : event.isPast 
                        ? 'text.disabled'
                        : config.color,
                      fontWeight: isNear ? 700 : 500,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    bgcolor: event.isPast ? 'action.disabled' : config.color,
                    boxShadow: isNear ? `0 0 0 4px ${alpha(config.color, 0.2)}` : 'none',
                    width: isNear ? 48 : 40,
                    height: isNear ? 48 : 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent sx={{ color: 'white', fontSize: isNear ? 24 : 20 }} />
                </TimelineDot>
                {index < events.length - 1 && (
                  <TimelineConnector 
                    sx={{ 
                      bgcolor: event.isPast ? 'action.disabled' : 'divider',
                      minHeight: 60,
                    }} 
                  />
                )}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 2, px: 3 }}>
                <Card
                  elevation={isNear ? 4 : 1}
                  sx={{
                    borderLeft: `4px solid ${event.isPast ? 'action.disabled' : config.color}`,
                    bgcolor: isNear ? alpha(config.color, 0.05) : 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: event.isPast ? 'text.disabled' : 'text.primary',
                        }}
                      >
                        {event.event}
                      </Typography>
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          bgcolor: alpha(config.color, 0.1),
                          color: config.color,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      color={event.isPast ? 'text.disabled' : 'text.secondary'}
                      sx={{ lineHeight: 1.6 }}
                    >
                      {event.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  );
}
