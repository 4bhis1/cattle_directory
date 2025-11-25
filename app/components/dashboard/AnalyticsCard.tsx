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
  onClick?: () => void;
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
  isProfitCard = false,
  onClick
}: AnalyticsCardProps) {
  return (
    <div
      className={`${styles.analyticsCard} ${isProfitCard ? styles.profitCard : ''} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={styles.analyticsHeader}>
        <div
          className={styles.analyticsIcon}
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div>
          <h4>{title}</h4>
          <span className={styles.analyticsSubtitle}>{subtitle}</span>
        </div>
      </div>
      <div className={`${styles.analyticsValue} ${isProfit !== undefined
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
      {onClick && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: iconColor,
          fontWeight: '500'
        }}>
          Click for detailed analytics →
        </div>
      )}
    </div>
  );
}
