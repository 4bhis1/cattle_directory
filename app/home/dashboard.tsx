'use client'
import React, { useState, useEffect } from 'react';
// import styles from '@/styles/dashboard.module.css';
import styles from "@/app/styles/dashboard.module.css";
import Sidebar from '../components/dashboard/Sidebar';
import AlertsTicker from '../components/dashboard/AlertsTicker';
import QuickActions from '../components/dashboard/QuickActions';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
// import Sidebar from '@/components/dashboard/Sidebar';
// import AlertsTicker from '@/components/dashboard/AlertsTicker';
// import QuickActions from '@/components/dashboard/QuickActions';
// import AnalyticsSection from '@/components/dashboard/AnalyticsSection';

export default function DairyDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigateTo = (section: string) => {
    setActiveSection(section);
    console.log('Navigating to:', section);
    alert(`Navigation to ${section} page will be implemented`);
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <Sidebar 
        isOpen={isSidebarOpen} 
        activeSection={activeSection}
        onNavigate={navigateTo}
      />

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h2>🏠 Dashboard Overview</h2>
          <p>Welcome back! Here&apos;s what&apos;s happening with your farm today.</p>
        </div>

        <AlertsTicker />
        <QuickActions onNavigate={navigateTo} />
        <AnalyticsSection />
      </main>
    </div>
  );
}
