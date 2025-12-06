'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Notifications,
  Search,
  Menu as MenuIcon,
  Add,
  Settings,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import styles from "@/app/styles/dashboard.module.css";
import Sidebar from '../components/dashboard/Sidebar';
import AlertsTicker from '../components/dashboard/AlertsTicker';
import QuickActions from '../components/dashboard/QuickActions';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';

export default function DairyDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference or saved theme
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navigateTo = (section: string) => {
    setActiveSection(section);
    console.log('Navigating to:', section);

    // Navigate to the appropriate route
    const routeMap: { [key: string]: string } = {
      'feed': '/feed/add',
      'milk': '/milk',
      'cattle': '/cattle/add',
      'expense': '/expenses/add',
      'waste': '/waste/add',
      'sales': '/sales/add',
      'dashboard': '/'
    };

    const route = routeMap[section] || '/';
    router.push(route);

    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector(`.${styles.menuToggle}`);

        if (sidebar && menuToggle &&
          !sidebar.contains(e.target as Node) &&
          !menuToggle.contains(e.target as Node) &&
          isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <div className={styles.pageContainer}>
      <button className={styles.menuToggle} onClick={toggleSidebar}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        onNavigate={navigateTo}
      />

      {/* Main Content */}
      <Box className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900 lg:ml-[280px] transition-all duration-300">
        <Box className="p-8">
          <Box className="flex justify-between items-center mb-8">
            <Box>
              <Typography variant="h3" className="font-bold text-gray-800 dark:text-gray-100 mb-2">
                Happy Cows Dairy 🐮
              </Typography>
              <Typography variant="subtitle1" className="text-gray-500 dark:text-gray-400">
                Welcome back, Admin
              </Typography>
            </Box>
            <Box className="flex gap-4">
              <Button
                variant="outlined"
                onClick={toggleTheme}
                startIcon={isDarkMode ? <CheckCircle /> : <Warning />} // Using existing icons for now, ideally Sun/Moon
                sx={{ borderColor: isDarkMode ? '#fff' : 'inherit', color: isDarkMode ? '#fff' : 'inherit' }}
              >
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
              <Button variant="outlined" startIcon={<Settings />}>
                Settings
              </Button>
              <Button variant="contained" startIcon={<Add />}>
                New Entry
              </Button>
            </Box>
          </Box>

          <AlertsTicker />
          <QuickActions onNavigate={navigateTo} />
          <AnalyticsSection />
        </Box>
      </Box>
    </div>
  );
}
