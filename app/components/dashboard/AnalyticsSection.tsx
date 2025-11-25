'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from "@/app/styles/dashboard.module.css";
import AnalyticsCard from './AnalyticsCard';

export default function AnalyticsSection() {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<'yesterday' | 'weekly' | 'monthly'>('yesterday');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    yesterday: {
      feed: { total: '0 kg', details: ['Loading...'] },
      milk: { total: '0 L', details: ['Loading...'] },
      expense: { total: '₹0', details: ['Loading...'] },
      profit: { total: '₹0', details: ['Loading...'], positive: true },
      waste: { total: '0 kg', details: ['Loading...'] }
    },
    weekly: {
      feed: { total: '0 kg', details: ['Loading...'] },
      milk: { total: '0 L', details: ['Loading...'] },
      expense: { total: '₹0', details: ['Loading...'] },
      profit: { total: '₹0', details: ['Loading...'], positive: true },
      waste: { total: '0 kg', details: ['Loading...'] }
    },
    monthly: {
      feed: { total: '0 kg', details: ['Loading...'] },
      milk: { total: '0 L', details: ['Loading...'] },
      expense: { total: '₹0', details: ['Loading...'] },
      profit: { total: '₹0', details: ['Loading...'], positive: true },
      waste: { total: '0 kg', details: ['Loading...'] }
    }
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [milkRes, expensesRes, salesRes, wasteRes, feedRes] = await Promise.all([
        fetch('/api/milk'),
        fetch('/api/expenses'),
        fetch('/api/sales'),
        fetch('/api/waste'),
        fetch('/api/feed')
      ]);

      const milkData = await milkRes.json();
      const expensesData = await expensesRes.json();
      const salesData = await salesRes.json();
      const wasteData = await wasteRes.json();
      const feedData = await feedRes.json();

      const milk = milkData.data || [];
      const expenses = expensesData.data || [];
      const sales = salesData.data || [];
      const waste = wasteData.data || [];
      const feed = feedData.data || [];

      // Calculate for different periods
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const calculatePeriodData = (startDate: Date) => {
        const periodMilk = milk.filter((m: any) => new Date(m.date) >= startDate);
        const periodExpenses = expenses.filter((e: any) => new Date(e.date) >= startDate);
        const periodSales = sales.filter((s: any) => new Date(s.date) >= startDate);
        const periodWaste = waste.filter((w: any) => new Date(w.date) >= startDate);

        const totalMilk = periodMilk.reduce((sum: number, m: any) => sum + m.quantity, 0);
        const totalExpense = periodExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        const totalRevenue = periodSales.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
        const totalWaste = periodWaste.reduce((sum: number, w: any) => sum + w.quantity, 0);
        const totalFeed = feed.reduce((sum: number, f: any) => sum + (f.averageDailyConsumption || 0), 0);

        const profit = totalRevenue - totalExpense;

        return {
          feed: {
            total: `${totalFeed.toFixed(1)} kg`,
            details: [`${feed.length} feed types tracked`]
          },
          milk: {
            total: `${totalMilk.toFixed(1)} L`,
            details: [`${periodMilk.length} records`]
          },
          expense: {
            total: `₹${totalExpense.toFixed(0)}`,
            details: [`${periodExpenses.length} transactions`]
          },
          profit: {
            total: `₹${Math.abs(profit).toFixed(0)}`,
            details: [profit >= 0 ? 'Profit' : 'Loss'],
            positive: profit >= 0
          },
          waste: {
            total: `${totalWaste.toFixed(1)} kg`,
            details: [`${periodWaste.length} waste entries`]
          }
        };
      };

      setAnalyticsData({
        yesterday: calculatePeriodData(yesterday),
        weekly: calculatePeriodData(weekAgo),
        monthly: calculatePeriodData(monthAgo)
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => router.push('/analytics/feed')}
        />

        <AnalyticsCard
          icon="🥛"
          title="Milk Produced"
          subtitle="Total production"
          value={currentData.milk.total}
          details={currentData.milk.details}
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
          onClick={() => router.push('/analytics/milk')}
        />

        <AnalyticsCard
          icon="💰"
          title="Expenses"
          subtitle="Total spending"
          value={currentData.expense.total}
          details={currentData.expense.details}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
          onClick={() => router.push('/analytics/expenses')}
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
          onClick={() => router.push('/analytics/profit')}
        />

        <AnalyticsCard
          icon="♻️"
          title="Waste Collected"
          subtitle="For sale"
          value={currentData.waste.total}
          details={currentData.waste.details}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8b5cf6"
          onClick={() => router.push('/analytics/waste')}
        />
      </div>
    </section>
  );
}
