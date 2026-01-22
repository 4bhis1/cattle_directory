"use client";

import React, { useState, useEffect, ReactNode } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Button,
  Grid,
} from "@mui/material";
import {
  FilterList,
  Refresh,
  KeyboardArrowUp,
  Search,
} from "@mui/icons-material";
import { TopHeader } from "@/app/components/ui/Header";
import { TableToolbar } from "@/app/components/Table/TableToolbar";
import { TablePagination } from "@/app/components/Table/TablePagination";

// --- Types ---
interface DashboardTab {
  label: string;
  value: string;
  icon?: React.ReactElement;
  content: ReactNode;
}

interface PaginationProps {
    page: number;
    count: number; // Total pages
    limit: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

interface UniversalDashboardProps {
  title: string;
  breadcrumbs: { label: string; href: string }[];
  tabs: DashboardTab[];
  actions?: ReactNode; // E.g. Add Button
  filters?: ReactNode; // Custom filters content
  pagination?: PaginationProps; // If present, shows sticky pagination
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  onClearFilters?: () => void;
  activeTab?: string;
  onTabChange?: (newValue: string) => void;
}

const UniversalDashboard: React.FC<UniversalDashboardProps> = ({
  title,
  breadcrumbs,
  tabs,
  actions,
  filters,
  pagination,
  onSearch,
  onRefresh,
  onClearFilters,
  activeTab,
  onTabChange,
}) => {
  const theme = useTheme();
  
  // Internal state for tab if not controlled
  const [internalTab, setInternalTab] = useState(tabs[0]?.value || "");
  const currentTab = activeTab !== undefined ? activeTab : internalTab;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    if (onTabChange) onTabChange(newValue);
    else setInternalTab(newValue);
  };

  return (
    <Box className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* 1. Top Header */}
      <TopHeader
        title={title}
        breadcrumbs={breadcrumbs}
        actionButton={actions}
      />

      {/* 2. Sticky Control Bar (Tabs + Filters + Pagination) */}
      <Paper
        elevation={0}
        component="div" // Explicitly Div to avoid 'header' nesting issues if any
        className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
        sx={{ borderRadius: 0 }}
      >
        <Box className="max-w-7xl mx-auto px-4 md:px-8">
            <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                 
                 {/* Tabs */}
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        minHeight: 48,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 48,
                            fontSize: '0.95rem',
                        }
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab 
                            key={tab.value} 
                            label={tab.label} 
                            value={tab.value} 
                            icon={tab.icon} 
                            iconPosition="start"
                        />
                    ))}
                </Tabs>

                {/* Pagination (Sticky Top) */}
                {pagination && (
                     <Box className="hidden md:block">
                        <TablePagination
                            page={pagination.page}
                            count={pagination.count}
                            limit={pagination.limit}
                            totalItems={pagination.totalItems}
                            onPageChange={pagination.onPageChange}
                            onLimitChange={pagination.onLimitChange}
                        />
                     </Box>
                )}
            </Box>
            
            {/* Filters Bar (Collapsible/Expandable logic usually resides in TableToolbar, 
                but here we render it directly if content provided) */}
            <Box className="py-2 border-t border-slate-100 dark:border-slate-800">
                 <TableToolbar
                    searchQuery="" // Managed internally or via props if needed, simpler to delegate
                    onSearchChange={(e: any) => onSearch && onSearch(typeof e === 'string' ? e : e.target.value)}
                    onClearFilters={onClearFilters ? onClearFilters : () => {}}
                    actions={
                        <>
                            {onRefresh && (
                                <Tooltip title="Refresh">
                                    <IconButton onClick={onRefresh} size="small">
                                        <Refresh />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </>
                    }
                 >
                    {filters}
                 </TableToolbar>
            </Box>
        </Box>
      </Paper>

      {/* 3. Main Content Area */}
      <Box className="max-w-7xl mx-auto px-4 md:px-8 py-6">
           {/* Mobile Pagination (if needed) */}
           {pagination && (
               <Box className="md:hidden mb-4 flex justify-center">
                    <TablePagination
                            page={pagination.page}
                            count={pagination.count}
                            limit={pagination.limit}
                            totalItems={pagination.totalItems}
                            onPageChange={pagination.onPageChange}
                            onLimitChange={pagination.onLimitChange}
                     />
               </Box>
           )}

           {/* Tab Content */}
           <Box className="min-h-[400px]">
                {tabs.map((tab) => (
                    <div key={tab.value} role="tabpanel" hidden={currentTab !== tab.value}>
                        {currentTab === tab.value && (
                            <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
                                {tab.content}
                            </Box>
                        )}
                    </div>
                ))}
           </Box>
      </Box>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default UniversalDashboard;
