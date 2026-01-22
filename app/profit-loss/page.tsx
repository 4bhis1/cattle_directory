'use client';

import React, { Suspense } from 'react';
import ProfitLossDashboard from '@/app/components/finance/ProfitLossDashboard';
import Loader from '@/app/components/ui/Loader';

export default function ProfitLossPage() {
  return (
    <Suspense fallback={<Loader text="Loading Profit & Loss..." />}>
      <ProfitLossDashboard />
    </Suspense>
  );
}
