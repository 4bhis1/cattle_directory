import { useState, useEffect } from 'react';
import { useFetch } from './useFetch';
import { Cattle } from './useCattle';

export interface MilkRecord {
    _id?: string;
    cattleId: string;
    milkingSession: 'morning' | 'evening';
    date: string;
    quantity: number;
    quality?: {
        fat: number;
    };
}

export interface MilkEntry {
    _id: string; // cattle _id
    cattleId: string;
    name: string;
    morningMilk: number;
    morningFat: number;
    eveningMilk: number;
    eveningFat: number;
    image?: string;
    status?: string;
}

// Helper to filter and sort cattle
function filterAndSortCattle(cattleList: Cattle[]) {
    const allowed = ['active', 'pregnant'];
    let filtered = cattleList.filter((c: Cattle) => {
        const s = (typeof c.status === 'object' ? c.status.current : c.status)?.toLowerCase() || '';
        return allowed.includes(s);
    });
    // Sort: Active first, then Pregnant
    filtered.sort((a: Cattle, b: Cattle) => {
        const sA = (typeof a.status === 'object' ? a.status.current : a.status)?.toLowerCase();
        const sB = (typeof b.status === 'object' ? b.status.current : b.status)?.toLowerCase();
        if (sA === 'active' && sB !== 'active') return -1;
        if (sA !== 'active' && sB === 'active') return 1;
        return 0;
    });
    return filtered;
}

export function useMilkProduction(date: string) {
    const { data: cattleData, loading: loadingCattle } = useFetch<Cattle[]>('/api/cattle');
    const { data: milkRecords, loading: loadingMilk, refetch: refetchMilk } = useFetch<MilkRecord[]>(`/api/milk?date=${date}`, {}, [date]);

    const [processedData, setProcessedData] = useState<MilkEntry[]>([]);

    useEffect(() => {
        if (Array.isArray(cattleData)) {
            const activeCattle = filterAndSortCattle(cattleData);

            const merged = activeCattle.map(c => {
                const records = Array.isArray(milkRecords) ? milkRecords : [];
                const morning = records.find((r: any) => r.cattleId === c._id && r.milkingSession === 'morning');
                const evening = records.find((r: any) => r.cattleId === c._id && r.milkingSession === 'evening');

                // Get default fat percentage from cattle data if available
                const defaultFat = c.fatPercentage || 4.5;

                return {
                    _id: c._id,
                    cattleId: c.cattleId,
                    name: c.name,
                    morningMilk: morning ? morning.quantity : 0,
                    morningFat: morning ? (morning.quality?.fat || defaultFat) : defaultFat,
                    eveningMilk: evening ? evening.quantity : 0,
                    eveningFat: evening ? (evening.quality?.fat || defaultFat) : defaultFat,
                    image: c.images?.[c.images.length - 1],
                    status: typeof c.status === 'object' ? c.status.current : c.status
                };
            });
            setProcessedData(merged);
        }
    }, [cattleData, milkRecords]);

    return {
        data: processedData,
        loading: loadingCattle || loadingMilk,
        refetch: refetchMilk
    };
}

