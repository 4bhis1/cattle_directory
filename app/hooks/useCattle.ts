import { useFetch } from './useFetch';

export interface Cattle {
    _id: string;
    cattleId: string;
    name: string;
    status?: { current: string } | string;
    images?: string[];
    fatPercentage?: number; // Default fat percentage for this cattle
}

export function useCattle() {
    return useFetch<Cattle[]>('/api/cattle');
}
