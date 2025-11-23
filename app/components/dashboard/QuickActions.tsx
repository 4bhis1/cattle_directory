'use client'
import React from 'react';
// import styles from '@/styles/dashboard.module.css';
import styles from "@/app/styles/dashboard.module.css";


export const quickActionsData = [
    {
      id: 'feed/add',
      icon: '🌾',
      title: 'Add Feed Entry',
      description: 'Record daily feed consumption for your cattle',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)'
    },
    {
      id: 'milk',
      icon: '🥛',
      title: 'Milk Production',
      description: 'Log today\'s milk collection data',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)'
    },
    {
      id: 'cattle',
      icon: '🐄',
      title: 'Cattle Management',
      description: 'Update cattle information and health records',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)'
    },
    {
      id: 'expense',
      icon: '💰',
      title: 'Add Expense',
      description: 'Track farm expenses and costs',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)'
    },
    {
      id: 'waste',
      icon: '♻️',
      title: 'Waste Management',
      description: 'Track and manage waste for sale',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)'
    }
  ];

interface QuickActionsProps {
  onNavigate: (section: string) => void;
}

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <section className={styles.quickActions}>
      {quickActionsData.map((action: any) => (
        <div 
          key={action.id}
          className={styles.actionCard}
          style={{'--card-color': action.color} as React.CSSProperties}
          onClick={() => onNavigate(action.id.split('/')[0])}
        >
          <div 
            className={styles.actionIcon}
            style={{background: action.bgColor, color: action.color}}
          >
            {action.icon}
          </div>
          <h3>{action.title}</h3>
          <p>{action.description}</p>
        </div>
      ))}
    </section>
  );
}
