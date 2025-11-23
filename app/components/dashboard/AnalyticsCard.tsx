'use client'
import React from 'react';
import styles from "@/app/styles/dashboard.module.css";

interface AnalyticsCardProps {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  details: string[];
  iconBg: string;
  iconColor: string;
  isProfit?: boolean;
  isProfitCard?: boolean;
}

export default function AnalyticsCard({
  icon,
  title,
  subtitle,
  value,
  details,
  iconBg,
  iconColor,
  isProfit,
  isProfitCard = false
}: AnalyticsCardProps) {
  return (
    <div className={`${styles.analyticsCard} ${isProfitCard ? styles.profitCard : ''}`}>
      <div className={styles.analyticsHeader}>
        <div 
          className={styles.analyticsIcon}
          style={{background: iconBg, color: iconColor}}
        >
          {icon}
        </div>
        <div>
          <h4>{title}</h4>
          <span className={styles.analyticsSubtitle}>{subtitle}</span>
        </div>
      </div>
      <div className={`${styles.analyticsValue} ${
        isProfit !== undefined 
          ? (isProfit ? styles.profitPositive : styles.profitNegative)
          : ''
      }`}>
        {value}
      </div>
      <div className={styles.analyticsDetail}>
        {details.map((detail, i) => {
          if (detail === 'Available') {
            return (
              <span key={i}>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Available</span>
              </span>
            );
          }
          return (
            <span 
              key={i} 
              className={detail.includes('↑') ? `${styles.statTrend} ${styles.trendUp}` : ''}
            >
              {detail}
            </span>
          );
        })}
      </div>
    </div>
  );
}
