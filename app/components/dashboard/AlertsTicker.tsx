'use client'

import { alertsData } from '@/lib/db/dashboardData';

export default function AlertsTicker() {

  return (
    <section className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3 px-4 rounded-xl shadow-sm mb-6 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
      <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-700 min-w-fit z-10 bg-white dark:bg-slate-800 items-center justify-center">
        <span className="text-xl">⚠️</span>
        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">4</span>
      </div>

      <div className="overflow-hidden flex-1 relative h-6">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee absolute top-0 left-0 h-full w-max">
          {/* Original Items */}
          {alertsData.map((alert: any, index: number) => (
            <div key={`original-${index}`} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider
                    ${alert.type === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  alert.type === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {alert.badge}
              </span>
              <span>{alert.message}</span>
            </div>
          ))}
          {/* Duplicated Items for seamless loop */}
          {alertsData.map((alert: any, index: number) => (
            <div key={`dup-${index}`} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider
                    ${alert.type === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  alert.type === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {alert.badge}
              </span>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
