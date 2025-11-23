'use client'
import React, { useState } from 'react';
// import styles from '@/styles/dashboard.module.css';
import styles from "@/app/styles/dashboard.module.css";
// import { analyticsData, type AnalyticsData } from '@/lib/dashboardData';
// import AnalyticsCard from './AnalyticsCard';
import AnalyticsCard from './AnalyticsCard';
import { analyticsData } from '@/lib/db/dashboardData';

export default function AnalyticsSection() {
  const [activePeriod, setActivePeriod] = useState<'yesterday' | 'weekly' | 'monthly'>('yesterday');
  const currentData = analyticsData[activePeriod];

  return (
    <section>
      <div className={styles.sectionHeader}>
        <h3>
          <span>📊</span>
          Quick Analytics
        </h3>
      </div>

      {/* Time Period Tabs */}
      <div className={styles.timePeriodTabs}>
        <button 
          className={`${styles.tabBtn} ${activePeriod === 'yesterday' ? styles.active : ''}`}
          onClick={() => setActivePeriod('yesterday')}
        >
          Yesterday
        </button>
        <button 
          className={`${styles.tabBtn} ${activePeriod === 'weekly' ? styles.active : ''}`}
          onClick={() => setActivePeriod('weekly')}
        >
          Weekly
        </button>
        <button 
          className={`${styles.tabBtn} ${activePeriod === 'monthly' ? styles.active : ''}`}
          onClick={() => setActivePeriod('monthly')}
        >
          Monthly
        </button>
      </div>

      {/* Analytics Cards Grid */}
      <div className={styles.analyticsGrid}>
        <AnalyticsCard
          icon="🌾"
          title="Feed Consumed"
          subtitle="Total consumption"
          value={currentData.feed.total}
          details={currentData.feed.details}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
        />

        <AnalyticsCard
          icon="🥛"
          title="Milk Produced"
          subtitle="Total production"
          value={currentData.milk.total}
          details={currentData.milk.details}
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
        />

        <AnalyticsCard
          icon="💰"
          title="Expenses"
          subtitle="Total spending"
          value={currentData.expense.total}
          details={currentData.expense.details}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
        />

        <AnalyticsCard
          icon="📈"
          title="Profit/Loss"
          subtitle="Net result"
          value={currentData.profit.total}
          details={currentData.profit.details}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
          isProfit={currentData.profit.positive}
          isProfitCard
        />

        <AnalyticsCard
          icon="♻️"
          title="Waste Collected"
          subtitle="For sale"
          value={currentData.waste.total}
          details={currentData.waste.details}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8b5cf6"
        />
      </div>
    </section>
  );
}
