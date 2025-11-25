'use client';
import React, { Suspense } from 'react';
import MedicineForm from '../../form/medicine_form';

export default function MedicineAddPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MedicineForm />
        </Suspense>
    );
}
