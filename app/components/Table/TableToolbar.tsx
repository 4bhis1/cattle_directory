import React, { useState } from 'react';
import {
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Collapse,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Tooltip
} from '@mui/material';
import {
    Search,
    FilterList,
    Clear,
    Download,
    Tune,
    ViewList,
    AccountTree
} from '@mui/icons-material';

interface FilterOption {
    label: string;
    value: string;
}

interface TableToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onClearFilters: () => void;
    
    // View
    groupBy?: string;
    onGroupByChange?: (value: string) => void;
    groupByOptions?: FilterOption[];
    
    isHierarchy?: boolean;
    onToggleHierarchy?: (value: boolean) => void;

    // Slots
    children?: React.ReactNode; // For Custom Filters Content
    actions?: React.ReactNode; // For Extra Actions (Export, etc.)
}

export const TableToolbar = ({
    searchQuery,
    onSearchChange,
    onClearFilters,
    groupBy,
    onGroupByChange,
    groupByOptions,
    isHierarchy,
    onToggleHierarchy,
    children,
    actions
}: TableToolbarProps) => {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <Paper
            elevation={0}
            className="mb-4 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm shadow-sm"
        >
            <div className="flex flex-col gap-2">
                {/* Top Row */}
                <div className="flex flex-col md:flex-row gap-2 items-center">
                    {/* Search */}
                    <div className="flex-1 w-full">
                        <TextField
                            fullWidth
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
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
                                        <IconButton size="small" onClick={() => onSearchChange('')}>
                                            <Clear fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                className: "bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white"
                            }}
                            sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                        />
                    </div>

                      {/* View Toggles (if hierarchy enabled) */}
                      {onToggleHierarchy && (
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                             <Tooltip title="List View">
                                <IconButton 
                                    size="small" 
                                    color={!isHierarchy ? 'primary' : 'default'}
                                    onClick={() => onToggleHierarchy(false)}
                                    className={!isHierarchy ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}
                                >
                                    <ViewList fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Hierarchy View">
                                <IconButton 
                                    size="small" 
                                    color={isHierarchy ? 'primary' : 'default'}
                                    onClick={() => onToggleHierarchy(true)}
                                    className={isHierarchy ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}
                                >
                                    <AccountTree fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    )}

                    {/* Group By */}
                    {groupByOptions && onGroupByChange && (
                         <FormControl size="small" sx={{ minWidth: 120 }} disabled={isHierarchy}>
                            <InputLabel>Group By</InputLabel>
                            <Select
                                value={groupBy || 'none'}
                                label="Group By"
                                onChange={(e) => onGroupByChange(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="none">None</MenuItem>
                                {groupByOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* Actions Row */}
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto items-center">
                         <Button
                            variant="outlined"
                            startIcon={<Tune />}
                            onClick={() => setShowFilters(!showFilters)}
                            size="medium"
                            color={showFilters ? "primary" : "inherit"}
                            sx={{ borderColor: 'rgba(0,0,0,0.12)', textTransform: 'none', minWidth: 'auto', px: 2 }}
                        >
                            Filters
                        </Button>
                        
                        <Button
                            variant="text"
                            onClick={onClearFilters}
                            size="medium"
                            color="error"
                            disabled={!searchQuery && !showFilters} // Basic disable logic, can rely on parent
                             sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
                        >
                            Clear
                        </Button>

                        {actions}
                    </div>
                </div>

                {/* Filters Content */}
                <Collapse in={showFilters}>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        {children}
                    </div>
                </Collapse>
            </div>
        </Paper>
    );
};
