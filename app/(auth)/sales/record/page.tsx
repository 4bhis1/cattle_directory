'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LinearProgress } from '@mui/material';
import SalesFormLayout from '@/app/components/sales/SalesFormLayout';

function SalesPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dateParam = searchParams.get('date');

    useEffect(() => {
        if (!dateParam) {
             const today = new Date().toISOString().split('T')[0];
             const currentParams = new URLSearchParams(searchParams.toString());
             currentParams.set('date', today);
             router.replace(`/sales/record?${currentParams.toString()}`);
        }
    }, [dateParam, router, searchParams]);

    if (!dateParam) {
        return <LinearProgress />; 
    }

    return <SalesFormLayout />;
}

export default function SalesPage() {
    return (
        <Suspense fallback={<LinearProgress />}>
            <SalesPageContent />
        </Suspense>
    );
}
