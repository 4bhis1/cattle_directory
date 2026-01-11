'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LinearProgress } from '@mui/material';
import MilkFormLayout from '@/app/components/milk/MilkFormLayout';

function MilkPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dateParam = searchParams.get('date');

    useEffect(() => {
        if (!dateParam) {
             const today = new Date().toISOString().split('T')[0];
             router.replace(`/milk?date=${today}`);
        }
    }, [dateParam, router]);

    if (!dateParam) {
        return <LinearProgress />; 
    }

    return <MilkFormLayout />;
}

export default function MilkPage() {
    return (
        <Suspense fallback={<LinearProgress />}>
            <MilkPageContent />
        </Suspense>
    );
}
