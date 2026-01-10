'use client';
import React from 'react';
import {
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Paper,
    IconButton
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';

interface FilterBarProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    breedFilter: string;
    setBreedFilter: (value: string) => void;
    availableBreeds: string[];
}

export default function FilterBar({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    breedFilter,
    setBreedFilter,
    availableBreeds
}: FilterBarProps) {
    return (
        <Paper
            elevation={0}
            className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm"
        >
            <div className="flex flex-col md:flex-row gap-4 items-center">
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

                {/* Filters */}
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <FormControl size="small" className="min-w-[140px]">
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Status Filter' }}
                            className="bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200"
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                            }}
                            renderValue={(selected) => {
                                if (selected === 'all') {
                                    return <span className="text-slate-400">Status: All</span>;
                                }
                                return <span className="capitalize">{selected}</span>;
                            }}
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="pregnant">Pregnant</MenuItem>
                            <MenuItem value="sick">Sick</MenuItem>
                            <MenuItem value="sold">Sold</MenuItem>
                            <MenuItem value="dead">Dead</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" className="min-w-[140px]">
                        <Select
                            value={breedFilter}
                            onChange={(e) => setBreedFilter(e.target.value)}
                            displayEmpty
                            className="bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200"
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                            }}
                            renderValue={(selected) => {
                                if (selected === 'all') {
                                    return <span className="text-slate-400">Breed: All</span>;
                                }
                                return <span className="capitalize">{selected}</span>;
                            }}
                        >
                            {availableBreeds.map((breed) => (
                                <MenuItem key={breed} value={breed} className="capitalize">
                                    {breed === 'all' ? 'All Breeds' : breed}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </div>
        </Paper>
    );
}
