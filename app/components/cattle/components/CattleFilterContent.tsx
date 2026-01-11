import React from 'react';
import {
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
} from '@mui/material';

interface CattleFilterContentProps {
    filters: Record<string, any>;
    setFilter: (key: string, value: any) => void;
    availableBreeds: string[];
}

export default function CattleFilterContent({
    filters,
    setFilter,
    availableBreeds,
}: CattleFilterContentProps) {
    const statusFilter = filters.status || 'all';
    const breedFilter = filters.breed || 'all';
    const minCapacity = filters.minCapacity || '';
    const maxCapacity = filters.maxCapacity || '';
    const dateFilterType = filters.dateFilterType || 'none';
    const startDate = filters.startDate || '';
    const endDate = filters.endDate || '';
    const hideNoProduction = filters.hideNoProduction || false;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setFilter('status', e.target.value)}
                >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="pregnant">Pregnant</MenuItem>
                    <MenuItem value="sick">Sick</MenuItem>
                    <MenuItem value="sold">Sold</MenuItem>
                    <MenuItem value="dead">Dead</MenuItem>
                    <MenuItem value="dry">Dry</MenuItem>
                </Select>
            </FormControl>

            {/* Breed Filter */}
            <FormControl size="small" fullWidth>
                <InputLabel>Breed</InputLabel>
                <Select
                    value={breedFilter}
                    label="Breed"
                    onChange={(e) => setFilter('breed', e.target.value)}
                >
                    <MenuItem value="all">All Breeds</MenuItem>
                    {availableBreeds.map((breed) => (
                        <MenuItem key={breed} value={breed} className="capitalize">
                            {breed}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Capacity Range */}
            <div className="col-span-1 md:col-span-2 flex gap-2 items-center">
                <TextField
                    label="Min Capacity (L)"
                    type="number"
                    size="small"
                    value={minCapacity}
                    onChange={(e) => setFilter('minCapacity', e.target.value === '' ? '' : Number(e.target.value))}
                    fullWidth
                />
                <span className="text-slate-400">-</span>
                <TextField
                    label="Max Capacity (L)"
                    type="number"
                    size="small"
                    value={maxCapacity}
                    onChange={(e) => setFilter('maxCapacity', e.target.value === '' ? '' : Number(e.target.value))}
                    fullWidth
                />
            </div>

            {/* Date Filter */}
            <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-2">
                <FormControl size="small" className="min-w-[150px]">
                    <Select
                        value={dateFilterType}
                        onChange={(e) => setFilter('dateFilterType', e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="none">No Date Filter</MenuItem>
                        <MenuItem value="joining">Joining Date</MenuItem>
                        <MenuItem value="vaccination">Vaccination Date</MenuItem>
                    </Select>
                </FormControl>
                {dateFilterType !== 'none' && (
                    <div className="flex gap-2 flex-1">
                        <TextField
                            type="date"
                            size="small"
                            value={startDate}
                            onChange={(e) => setFilter('startDate', e.target.value)}
                            fullWidth
                            helperText="Start"
                        />
                        <TextField
                            type="date"
                            size="small"
                            value={endDate}
                            onChange={(e) => setFilter('endDate', e.target.value)}
                            fullWidth
                            helperText="End"
                        />
                    </div>
                )}
            </div>

             {/* Hide No Production Match */}
             <div className="flex items-center px-1">
                <FormControlLabel
                    control={
                        <Switch 
                            checked={hideNoProduction} 
                            onChange={(e) => setFilter('hideNoProduction', e.target.checked)} 
                            size="small"
                        />
                    }
                    label={<span className="text-sm text-slate-600 dark:text-slate-300">Hide No Production</span>}
                />
            </div>
        </div>
    );
}
