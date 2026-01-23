import React, { Suspense } from 'react';
import { LinearProgress } from '@mui/material';
import CattleFormLayout from '@/app/components/cattle/CattleFormLayout';

export default function EditCattlePage() {
  return (
    <Suspense fallback={<LinearProgress />}>
       <CattleFormLayout />
    </Suspense>
  );
}
