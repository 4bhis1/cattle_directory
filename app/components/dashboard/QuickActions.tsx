'use client'
import React from 'react';
// import styles from '@/styles/dashboard.module.css';



export const quickActionsData = [
  // {
  //   id: 'feed/add',
  //   icon: '🌾',
  //   title: 'Add Feed Entry',
  //   description: 'Record daily feed consumption for your cattle',
  //   color: '#10b981',
  //   bgColor: 'rgba(16, 185, 129, 0.15)'
  // },
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
    id: 'sales/record',
    icon: '💵',
    title: 'Record Sale',
    description: 'Track milk sales to customers',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.15)'
  },
  // {
  //   id: 'expense',
  //   icon: '💰',
  //   title: 'Add Expense',
  //   description: 'Track farm expenses and costs',
  //   color: '#f59e0b',
  //   bgColor: 'rgba(245, 158, 11, 0.15)'
  // },
  // {
  //   id: 'waste',
  //   icon: '♻️',
  //   title: 'Waste Management',
  //   description: 'Track and manage waste for sale',
  //   color: '#ef4444',
  //   bgColor: 'rgba(239, 68, 68, 0.15)'
  // }
];

interface QuickActionsProps {
  onNavigate: (section: string) => void;
}

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {quickActionsData.map((action: any) => (
        <div
          key={action.id}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200 dark:border-slate-700 group relative overflow-hidden"
          onClick={() => onNavigate(action.id.split('/')[0])}
        >
          <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-500`}
            style={{ background: action.color }}
          />

          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110 duration-200"
            style={{ background: action.bgColor, color: action.color }}
          >
            {action.icon}
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {action.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {action.description}
          </p>
        </div>
      ))}
    </section>
  );
}
