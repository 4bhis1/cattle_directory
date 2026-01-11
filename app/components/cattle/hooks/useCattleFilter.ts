import { useState, useMemo } from 'react';
import { useTable } from '@/app/components/Table/useTable';

export interface CattleData {
    _id: string;
    cattleId: string;
    name: string;
    breed: string;
    status: string | { current: string; history: any[] };
    motherId?: string;
    children?: CattleData[];
    dateOfBirth?: string;
    dateOfAcquisition?: string;
    expectedMilkProduction?: number;
    lastMilk?: number;
    lastFeed?: number;
    vaccinationHistory?: { vaccineName: string; administeredDate: string; nextDueDate?: string }[];
    images?: string[];
}

export type GroupByOption = 'none' | 'breed' | 'status' | 'joining_date' | 'vaccination_date';

export const useCattleFilter = (cattleList: CattleData[] = []) => {
    
    // Define Filter Function
    const filterFn = (cow: CattleData, searchQuery: string, filters: Record<string, any>) => {
        // Search
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (cow.name?.toLowerCase().includes(query)) ||
            (cow.cattleId?.toLowerCase().includes(query));

        if (!matchesSearch) return false;

        // Status
        const statusFilter = filters.status || 'all';
        const currentStatus = typeof cow.status === 'object' ? (cow.status as any).current : cow.status;
        const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

        // Breed
        const breedFilter = filters.breed || 'all';
        const matchesBreed = breedFilter === 'all' || cow.breed === breedFilter;

        // Capacity
        const minCapacity = filters.minCapacity;
        const maxCapacity = filters.maxCapacity;
        const capacity = cow.expectedMilkProduction || 0;
        const matchesMinCap = minCapacity === '' || minCapacity === undefined || capacity >= minCapacity;
        const matchesMaxCap = maxCapacity === '' || maxCapacity === undefined || capacity <= maxCapacity;

        // Date Filters
        const dateFilterType = filters.dateFilterType || 'none';
        const startDate = filters.startDate;
        const endDate = filters.endDate;
        
        let matchesDate = true;
        if (dateFilterType === 'joining' && (startDate || endDate)) {
            if (!cow.dateOfAcquisition) {
                matchesDate = false;
            } else {
                const joinDate = new Date(cow.dateOfAcquisition).getTime();
                const start = startDate ? new Date(startDate).getTime() : 0;
                const end = endDate ? new Date(endDate).getTime() : Infinity;
                matchesDate = joinDate >= start && joinDate <= end;
            }
        } else if (dateFilterType === 'vaccination' && (startDate || endDate)) {
            const history = cow.vaccinationHistory || [];
            if (history.length === 0) matchesDate = false;
            else {
                matchesDate = history.some(v => {
                    const vacDate = new Date(v.administeredDate).getTime();
                    const start = startDate ? new Date(startDate).getTime() : 0;
                    const end = endDate ? new Date(endDate).getTime() : Infinity;
                    return vacDate >= start && vacDate <= end;
                });
            }
        }

        // Hide No Production
        const hideNoProduction = filters.hideNoProduction;
        let matchesProduction = true;
        if (hideNoProduction) {
            const hasMilk = (cow.lastMilk || 0) > 0;
            const hasFeed = (cow.lastFeed || 0) > 0;
            matchesProduction = hasMilk || hasFeed;
        }

        return matchesStatus && matchesBreed && matchesMinCap && matchesMaxCap && matchesDate && matchesProduction;
    };

    // Define Group Function
    const groupFn = (cow: CattleData, groupBy: string) => {
        if (groupBy === 'breed') {
            return cow.breed || 'Unknown';
        } else if (groupBy === 'status') {
            return (typeof cow.status === 'object' ? (cow.status as any).current : cow.status) || 'Unknown';
        } else if (groupBy === 'joining_date') {
            return cow.dateOfAcquisition ? new Date(cow.dateOfAcquisition).getFullYear().toString() : 'Unknown';
        } else if (groupBy === 'vaccination_date') {
            const history = cow.vaccinationHistory || [];
            if (history.length > 0) {
                const latest = history.sort((a,b) => new Date(b.administeredDate).getTime() - new Date(a.administeredDate).getTime())[0];
                const d = new Date(latest.administeredDate);
                // Group by Month Year
                 return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
            } else {
                return 'No Vaccination';
            }
        }
        return 'Others';
    };

    // View Modes
    const [isHierarchy, setIsHierarchy] = useState(false);

    // Use Generic Table Hook
    const table = useTable<CattleData>({
        data: cattleList,
        defaultLimit: 10,
        filterFn,
        groupFn
    });

    // Available Options Helper
    const availableOptions = useMemo(() => ({
        status: ['all', 'active', 'pregnant', 'sold', 'dead', 'sick', 'dry'],
        breeds: ['all', ...Array.from(new Set(cattleList.map(c => c.breed))).filter(Boolean)]
    }), [cattleList]);

    // Hierarchy Logic
    const hierarchyList = useMemo(() => {
        // Use sortedData (filtered but not paginated) from the table hook
        const sourceList = table.sortedData; 
        
        if (!isHierarchy || !sourceList) return [];

        // Deep clone to avoid mutating original
        const nodes: Record<string, CattleData> = {};
        // First map all matching nodes
        sourceList.forEach(cow => {
            nodes[cow._id] = { ...cow, children: [] };
        });

        const roots: CattleData[] = [];
        
        // Build relationships
        sourceList.forEach(cow => {
            const node = nodes[cow._id];
            if (node.motherId && nodes[node.motherId]) {
                nodes[node.motherId].children?.push(node);
            } else {
                roots.push(node);
            }
        });
        
        return roots;
    }, [table.sortedData, isHierarchy]);

    // Wait, I need to update useTable to export allFilteredData for the hierarchy view.
    // Ideally useTable shouldn't hide intermediate states if needed.
    
    return {
        table,
        availableBreeds: availableOptions.breeds,
        isHierarchy,
        setIsHierarchy,
        hierarchyList
    };
};

