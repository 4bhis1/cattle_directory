import React, { Suspense } from 'react';
import { LinearProgress } from '@mui/material';
import ProfitLossDashboard from "@/app/components/finance/ProfitLossDashboard";

export default function FinancePage() {
    return (
        <Suspense fallback={<LinearProgress />}>
            <ProfitLossDashboard />
        </Suspense>
    );
}
