'use client';
import React, { useState } from 'react';
import {
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Paper,
    IconButton,
    Button,
    Collapse,
    Switch,
    FormControlLabel,
    Tooltip,
    Divider,
    Chip
} from '@mui/material';
import { 
    Search, 
    FilterList, 
    Clear, 
    Download, 
    AccountTree, 
    ViewList, 
    Tune, 
    CalendarMonth 
} from '@mui/icons-material';

interface FilterBarProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    breedFilter: string;
    setBreedFilter: (value: string) => void;
    availableBreeds: string[];

    // Advanced
    minCapacity: number | '';
    setMinCapacity: (v: number | '') => void;
    maxCapacity: number | '';
    setMaxCapacity: (v: number | '') => void;
    
    dateFilterType: 'joining' | 'vaccination' | 'none';
    setDateFilterType: (v: 'joining' | 'vaccination' | 'none') => void;
    startDate: string;
    setStartDate: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
    
    hideNoProduction: boolean;
    setHideNoProduction: (v: boolean) => void;
    
    // View
    isHierarchy: boolean;
    setIsHierarchy: (v: boolean) => void;
    groupBy: string;
    setGroupBy: (v: any) => void;

    onExport: () => void;
}

export default function FilterBar({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    breedFilter,
    setBreedFilter,
    availableBreeds,
    minCapacity,
    setMinCapacity,
    maxCapacity,
    setMaxCapacity,
    dateFilterType,
    setDateFilterType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hideNoProduction,
    setHideNoProduction,
    isHierarchy,
    setIsHierarchy,
    groupBy,
    setGroupBy,
    onExport
}: FilterBarProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const activeAdvancedFiltersCount = [
        minCapacity !== '', 
        maxCapacity !== '', 
        dateFilterType !== 'none', 
        hideNoProduction
    ].filter(Boolean).length;

    return (
        <Paper
            elevation={0}
            className="mb-4 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm shadow-sm"
        >
            <div className="flex flex-col gap-2">
                {/* Top Row: Search + Basic Filters + Actions */}
                <div className="flex flex-col md:flex-row gap-2 items-center">
                    {/* Search Input */}
                    <div className="flex-1 w-full">
                        <TextField
                            fullWidth
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search className="text-slate-400" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <Clear fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                className: "bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white"
                            }}
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            }}
                        />
                    </div>

                    {/* View Toggles */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                         <Tooltip title="List View">
                            <IconButton 
                                size="small" 
                                color={!isHierarchy ? 'primary' : 'default'}
                                onClick={() => setIsHierarchy(false)}
                                className={!isHierarchy ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}
                            >
                                <ViewList fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Hierarchy View">
                            <IconButton 
                                size="small" 
                                color={isHierarchy ? 'primary' : 'default'}
                                onClick={() => setIsHierarchy(true)}
                                className={isHierarchy ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}
                            >
                                <AccountTree fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>

                    {/* Group By */}
                    <FormControl size="small" sx={{ minWidth: 120 }} disabled={isHierarchy}>
                        <InputLabel>Group By</InputLabel>
                        <Select
                            value={groupBy}
                            label="Group By"
                            onChange={(e) => setGroupBy(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="breed">Breed</MenuItem>
                            <MenuItem value="status">Status</MenuItem>
                            <MenuItem value="joining_date">Joining Year</MenuItem>
                            <MenuItem value="vaccination_date">Vaccination Date</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Basic Dropdowns & Export */}
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 items-center">
                         <Button
                            variant="outlined"
                            startIcon={<Tune />}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            size="medium"
                            color={activeAdvancedFiltersCount > 0 ? "primary" : "inherit"}
                            sx={{ borderColor: 'rgba(0,0,0,0.12)', textTransform: 'none', minWidth: 'auto', px: 2 }}
                        >
                            Filters
                            {activeAdvancedFiltersCount > 0 && (
                                <Chip 
                                    label={activeAdvancedFiltersCount} 
                                    size="small" 
                                    color="primary" 
                                    className="ml-2 h-5 text-[10px]" 
                                />
                            )}
                        </Button>

                         <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={onExport}
                            size="medium"
                            sx={{ borderColor: 'rgba(0,0,0,0.12)', textTransform: 'none', minWidth: 'auto' }}
                        >
                            Export
                        </Button>
                    </div>
                </div>

                {/* Advanced Filters Section */}
                <Collapse in={showAdvanced}>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Status Filter */}
                            <FormControl size="small" fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
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
                                    onChange={(e) => setBreedFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Breeds</MenuItem>
                                    {availableBreeds.map((breed) => (
                                        <MenuItem key={breed} value={breed} className="capitalize">
                                            {breed}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Hide No Production Match */}
                            <div className="flex items-center px-1">
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={hideNoProduction} 
                                            onChange={(e) => setHideNoProduction(e.target.checked)} 
                                            size="small"
                                        />
                                    }
                                    label={<span className="text-sm text-slate-600 dark:text-slate-300">Hide No Production</span>}
                                />
                            </div>

                            {/* Capacity Range */}
                             <div className="col-span-1 md:col-span-2 flex gap-2 items-center">
                                <TextField
                                    label="Min Capacity (L)"
                                    type="number"
                                    size="small"
                                    value={minCapacity}
                                    onChange={(e) => setMinCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                                    fullWidth
                                />
                                <span className="text-slate-400">-</span>
                                <TextField
                                    label="Max Capacity (L)"
                                    type="number"
                                    size="small"
                                    value={maxCapacity}
                                    onChange={(e) => setMaxCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                                    fullWidth
                                />
                            </div>

                            {/* Date Filter */}
                            <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-2">
                                <FormControl size="small" className="min-w-[150px]">
                                    <Select
                                        value={dateFilterType}
                                        onChange={(e) => setDateFilterType(e.target.value as any)}
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
                                            onChange={(e) => setStartDate(e.target.value)}
                                            fullWidth
                                            helperText="Start"
                                        />
                                        <TextField
                                            type="date"
                                            size="small"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            fullWidth
                                            helperText="End"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Collapse>
            </div>
        </Paper>
    );
}
