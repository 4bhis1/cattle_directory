import React from 'react';
import { Pagination, PaginationItem, Select, MenuItem, Typography } from '@mui/material';

interface TablePaginationProps {
    page: number;
    count: number; // Total pages
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    totalItems?: number;
}

export const TablePagination = ({
    page,
    count,
    limit,
    onPageChange,
    onLimitChange,
    totalItems
}: TablePaginationProps) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Showing</span>
                {onLimitChange && (
                    <Select
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        size="small"
                        variant="standard"
                        disableUnderline
                        className="font-semibold text-slate-800 dark:text-white mx-1"
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                )}
                 <span>rows per page</span>
                 {totalItems !== undefined && (
                     <span className="hidden md:inline"> • Total {totalItems} items</span>
                 )}
            </div>

            <Pagination 
                count={count} 
                page={page} 
                onChange={(_, p) => onPageChange(p)} 
                color="primary" 
                shape="rounded"
                showFirstButton 
                showLastButton
                renderItem={(item) => (
                    <PaginationItem
                        {...item}
                        className="dark:text-slate-300"
                    />
                )}
            />
        </div>
    );
};
