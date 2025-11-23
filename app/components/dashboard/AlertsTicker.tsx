'use client'
import React, { useEffect } from 'react';
import styles from "@/app/styles/dashboard.module.css";
import { alertsData } from '@/lib/db/dashboardData';

export default function AlertsTicker() {
  useEffect(() => {
    // Duplicate ticker content for infinite scroll effect
    const tickerContent = document.getElementById('tickerContent');
    if (tickerContent) {
      const items = tickerContent.innerHTML;
      tickerContent.innerHTML = items + items;
    }
  }, []);

  return (
    <section className={styles.alertsTicker}>
      <div className={styles.tickerHeader}>
        <span className={styles.tickerIcon}>⚠️</span>
        <span className={styles.tickerTitle}>Alerts</span>
        <span className={`${styles.badge} ${styles.badgeError}`}>4</span>
      </div>
      <div className={styles.tickerWrapper}>
        <div className={styles.tickerContent} id="tickerContent">
          {alertsData.map((alert: any, index: number) => (
            <div key={index} className={`${styles.tickerItem} ${styles[alert.type]}`}>
              <span className={styles.tickerBadge}>{alert.badge}</span>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
