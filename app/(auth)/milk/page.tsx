'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MilkFormLayout from '@/app/components/milk/MilkFormLayout';
import Loader from '@/app/components/ui/Loader';

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
        return <Loader />; 
    }

    return <MilkFormLayout />;
}

export default function MilkPage() {
    return (
        <Suspense fallback={<Loader />}>
            <MilkPageContent />
        </Suspense>
    );
}
