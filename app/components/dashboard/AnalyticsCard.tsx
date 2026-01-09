'use client'
import React from 'react';


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
      className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full hover:shadow-md transition-all duration-200 relative overflow-hidden group
         ${isProfitCard ? 'dark:bg-slate-800/80' : ''} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
      onClick={onClick}
    >
      {/* Background Accent for Profit Card */}
      {isProfitCard && (
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-5 transition-transform group-hover:scale-150 duration-500`}
          style={{ background: isProfit ? '#10b981' : '#ef4444' }}
        />
      )}

      <div className="flex items-start justify-between mb-6 relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-right">{title}</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block text-right">{subtitle}</span>
        </div>
      </div>

      <div className={`text-3xl font-bold mb-4 tracking-tight z-10 relative
          ${isProfit !== undefined
          ? (isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
          : 'text-slate-900 dark:text-white'
        }`}>
        {value}
      </div>

      <div className="flex flex-wrap gap-2 mt-auto text-sm text-slate-600 dark:text-slate-300 z-10 relative">
        {details.map((detail, i) => {
          if (detail === 'Available') {
            return (
              <span key={i}>
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-md text-xs font-bold">Available</span>
              </span>
            );
          }
          // Simple heuristic for trend up arrows
          const isPositiveTrend = detail.includes('↑');
          // Simple heuristic for trend down arrows
          const isNegativeTrend = detail.includes('↓');

          return (
            <span
              key={i}
              className={`flex items-center gap-1 ${isPositiveTrend ? 'text-green-600 dark:text-green-400 font-medium' :
                isNegativeTrend ? 'text-red-600 dark:text-red-400 font-medium' : ''
                }`}
            >
              {detail}
            </span>
          );
        })}
      </div>
      {onClick && (
        <div
          className="mt-4 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: iconColor }}
        >
          Click for detailed analytics →
        </div>
      )}
    </div>
  );
}
