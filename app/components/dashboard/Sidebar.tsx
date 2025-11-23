'use client'
import React from 'react';
import styles from "@/app/styles/dashboard.module.css";

interface SidebarProps {
  isOpen: boolean;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Sidebar({ isOpen, activeSection, onNavigate }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`} id="sidebar">
      <div className={styles.logoSection}>
        <div className={styles.logo}>🐄</div>
        <div className={styles.logoText}>
          <h1>DairyTrack</h1>
          <p>Farm Management</p>
        </div>
      </div>

      <nav>
        <div className={styles.navSection}>
          <div className={styles.navTitle}>Main Menu</div>
          <div 
            className={`${styles.navItem} ${activeSection === 'dashboard' ? styles.active : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span>Dashboard</span>
          </div>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navTitle}>Quick Forms</div>
          <div 
            className={`${styles.navItem} ${activeSection === 'feed' ? styles.active : ''}`}
            onClick={() => onNavigate('feed')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <span>Feed Entry</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeSection === 'cattle' ? styles.active : ''}`}
            onClick={() => onNavigate('cattle')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <span>Cattle Info</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeSection === 'milk' ? styles.active : ''}`}
            onClick={() => onNavigate('milk')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Milk Production</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeSection === 'medicine' ? styles.active : ''}`}
            onClick={() => onNavigate('medicine')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
            <span>Medicine</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeSection === 'expense' ? styles.active : ''}`}
            onClick={() => onNavigate('expense')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span>Expenses</span>
          </div>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navTitle}>Management</div>
          <div 
            className={`${styles.navItem} ${activeSection === 'feed-stock' ? styles.active : ''}`}
            onClick={() => onNavigate('feed-stock')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <span>Feed Stock</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeSection === 'waste' ? styles.active : ''}`}
            onClick={() => onNavigate('waste')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span>Waste Management</span>
          </div>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navTitle}>Analytics</div>
          <div 
            className={`${styles.navItem} ${activeSection === 'reports' ? styles.active : ''}`}
            onClick={() => onNavigate('reports')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Reports</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeSection === 'analytics' ? styles.active : ''}`}
            onClick={() => onNavigate('analytics')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
            </svg>
            <span>Analytics</span>
          </div>
        </div>
      </nav>
    </aside>
  );
}
