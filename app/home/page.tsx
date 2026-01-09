
'use client'
import AlertsTicker from '../components/dashboard/AlertsTicker';
import QuickActions from '../components/dashboard/QuickActions';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import { useNavigate } from '@/app/hooks/useNavigate';

export default function HomePage() {
  const { navigateTo } = useNavigate();

  return <div className='p-4'>
    <AlertsTicker />
    <QuickActions onNavigate={navigateTo} />
    <AnalyticsSection />
  </div>
}
