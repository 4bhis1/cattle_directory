import { useState } from 'react';

export interface MilkEntry {
    _id: string; // cattle _id
    morningMilk: number;
    morningFat: number;
    eveningMilk: number;
    eveningFat: number;
}

export function useSaveMilkRecords() {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const saveRecords = async (records: MilkEntry[], date: string) => {
        setSaving(true);
        setError(null);
        try {
            const promises = [];

            for (const cow of records) {
                // Morning Record
                if (cow.morningMilk > 0) {
                    promises.push(fetch('/api/milk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            cattleId: cow._id,
                            milkingSession: 'morning',
                            date: date,
                            quantity: cow.morningMilk,
                            quality: {
                                fat: cow.morningFat,
                                snf: 8.5,
                                temperature: 35
                            },
                            soldTo: 'dairy',
                            paymentStatus: 'pending',
                            notes: `Session: Morning, Qty: ${cow.morningMilk}L, Fat: ${cow.morningFat}%`,
                            recordedBy: 'Admin'
                        })
                    }).then(res => res.json()));
                }

                // Evening Record
                if (cow.eveningMilk > 0) {
                    promises.push(fetch('/api/milk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            cattleId: cow._id,
                            milkingSession: 'evening',
                            date: date,
                            quantity: cow.eveningMilk,
                            quality: {
                                fat: cow.eveningFat,
                                snf: 8.5,
                                temperature: 35
                            },
                            soldTo: 'dairy',
                            paymentStatus: 'pending',
                            notes: `Session: Evening, Qty: ${cow.eveningMilk}L, Fat: ${cow.eveningFat}%`,
                            recordedBy: 'Admin'
                        })
                    }).then(res => res.json()));
                }
            }

            await Promise.all(promises);
            return true;
        } catch (err) {
            setError(err as Error);
            return false;
        } finally {
            setSaving(false);
        }
    };

    return { saveRecords, saving, error };
}
