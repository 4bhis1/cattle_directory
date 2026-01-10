import { useState, useMemo } from 'react';

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
    // Basic Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [breedFilter, setBreedFilter] = useState('all');
    
    // Advanced Filters
    const [minCapacity, setMinCapacity] = useState<number | ''>('');
    const [maxCapacity, setMaxCapacity] = useState<number | ''>('');
    const [dateFilterType, setDateFilterType] = useState<'joining' | 'vaccination' | 'none'>('none');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [hideNoProduction, setHideNoProduction] = useState(false);

    // View Modes
    const [isHierarchy, setIsHierarchy] = useState(false); // Hierarchy vs List
    const [groupBy, setGroupBy] = useState<GroupByOption>('none');

    // Available Options
    const filters = useMemo(() => ({
        status: ['all', 'active', 'pregnant', 'sold', 'dead', 'sick', 'dry'],
        breeds: ['all', ...Array.from(new Set(cattleList.map(c => c.breed))).filter(Boolean)]
    }), [cattleList]);

    // 1. Filter Logic
    const filteredFlatList = useMemo(() => {
        return cattleList.filter((cow) => {
            // Search
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (cow.name?.toLowerCase().includes(query)) ||
                (cow.cattleId?.toLowerCase().includes(query));

            // Status
            const currentStatus = typeof cow.status === 'object' ? (cow.status as any).current : cow.status;
            const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

            // Breed
            const matchesBreed = breedFilter === 'all' || cow.breed === breedFilter;

            // Capacity (Milk Production)
            const capacity = cow.expectedMilkProduction || 0;
            const matchesMinCap = minCapacity === '' || capacity >= minCapacity;
            const matchesMaxCap = maxCapacity === '' || capacity <= maxCapacity;

            // Date Filters
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
                 // Check if ANY vaccination falls in range
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
            let matchesProduction = true;
            if (hideNoProduction) {
                // Assuming "liters and feed coming" means recent activity or non-zero stats
                // Checking lastMilk and lastFeed. If both are 0 or missing, hide.
                const hasMilk = (cow.lastMilk || 0) > 0;
                const hasFeed = (cow.lastFeed || 0) > 0;
                matchesProduction = hasMilk || hasFeed;
            }

            return matchesSearch && matchesStatus && matchesBreed && matchesMinCap && matchesMaxCap && matchesDate && matchesProduction;
        });
    }, [
        cattleList, searchQuery, statusFilter, breedFilter, 
        minCapacity, maxCapacity, dateFilterType, startDate, endDate,
        hideNoProduction
    ]);

    // 2. Hierarchy Builder
    const hierarchyList = useMemo(() => {
        if (!isHierarchy) return [];
        // Deep clone to avoid mutating original
        const nodes: Record<string, CattleData> = {};
        // First map all matching nodes
        filteredFlatList.forEach(cow => {
            nodes[cow._id] = { ...cow, children: [] };
        });

        const roots: CattleData[] = [];
        
        // Build relationships
        // Note: Use 'all' list for parents? 
        // Logic: If I filter "Bessy", but she has a child "Calf", do I show Calf? 
        // Usually hierarchy shows filtered nodes. If parent is filtered out, child becomes root in this view?
        // Or should we assume filtering applies to the tree?
        // Let's stick to: Only link if parent is ALSO in the filtered list.
        
        filteredFlatList.forEach(cow => {
            const node = nodes[cow._id];
            if (node.motherId && nodes[node.motherId]) {
                nodes[node.motherId].children?.push(node);
            } else {
                roots.push(node);
            }
        });
        
        return roots;
    }, [filteredFlatList, isHierarchy]);


    // 3. Grouping Logic
    const groupedList = useMemo(() => {
        if (groupBy === 'none') return null;
        
        const groups: Record<string, CattleData[]> = {};

        filteredFlatList.forEach(cow => {
            let key = 'Others';
            
            if (groupBy === 'breed') {
                key = cow.breed || 'Unknown';
            } else if (groupBy === 'status') {
                key = (typeof cow.status === 'object' ? (cow.status as any).current : cow.status) || 'Unknown';
            } else if (groupBy === 'joining_date') {
                key = cow.dateOfAcquisition ? new Date(cow.dateOfAcquisition).getFullYear().toString() : 'Unknown';
            } else if (groupBy === 'vaccination_date') {
                 // Group by latest vaccination date (Month-Year) or 'No Records'
                 const history = cow.vaccinationHistory || [];
                 if (history.length > 0) {
                     // Get latest
                     const latest = history.sort((a,b) => new Date(b.administeredDate).getTime() - new Date(a.administeredDate).getTime())[0];
                     const d = new Date(latest.administeredDate);
                     key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                 } else {
                     key = 'No Vaccination';
                 }
            }
            
            if (!groups[key]) groups[key] = [];
            groups[key].push(cow);
        });

        return groups;
    }, [filteredFlatList, groupBy]);

    return {
        // State
        searchQuery, setSearchQuery,
        statusFilter, setStatusFilter,
        breedFilter, setBreedFilter,
        minCapacity, setMinCapacity,
        maxCapacity, setMaxCapacity,
        dateFilterType, setDateFilterType,
        startDate, setStartDate,
        endDate, setEndDate,
        hideNoProduction, setHideNoProduction,
        isHierarchy, setIsHierarchy,
        groupBy, setGroupBy,

        // Data
        filters,
        filteredFlatList,
        hierarchyList,
        groupedList,
        availableBreeds: filters.breeds
    };
};

