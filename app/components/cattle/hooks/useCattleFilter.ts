import { useState, useMemo } from 'react';

export interface CattleData {
    _id: string;
    cattleId: string;
    name: string;
    breed: string;
    status: string | { current: string; history: any[] };
    gender?: string;
}

export const useCattleFilter = (cattleList: CattleData[]) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [breedFilter, setBreedFilter] = useState('all');

    const filters = {
        searchPoints: ['name', 'cattleId'],
        status: ['all', 'active', 'pregnant', 'sold', 'dead', 'sick'],
        breeds: ['all', ...Array.from(new Set(cattleList.map(c => c.breed))).filter(Boolean)]
    };

    const filteredList = useMemo(() => {
        return cattleList.filter((cow) => {
            // 1. Search Filter
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (cow.name?.toLowerCase().includes(query)) ||
                (cow.cattleId?.toLowerCase().includes(query));

            // 2. Status Filter
            const currentStatus = typeof cow.status === 'object' ? (cow.status as any).current : cow.status;
            const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

            // 3. Breed Filter
            const matchesBreed = breedFilter === 'all' || cow.breed === breedFilter;

            return matchesSearch && matchesStatus && matchesBreed;
        });
    }, [cattleList, searchQuery, statusFilter, breedFilter]);

    return {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        breedFilter,
        setBreedFilter,
        filteredList,
        availableBreeds: filters.breeds
    };
};
