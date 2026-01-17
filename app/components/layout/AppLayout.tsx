'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft,
    Dashboard,
    Pets,
    LocalDrink,
    AttachMoney,
    Settings,
    ChevronRight,
} from '@mui/icons-material';
import { ActionableIcon } from '../ui/ActionableIcon';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const Divider = ({ className }: { className?: string }) => <div className={`h-[1px] bg-slate-400 my-2 ${className || ''}`} />

const DrawerItem = ({ Icon, name, path, href, collapsed, isMobile, pathname, setMobileOpen }: any) => {
    const isActive = pathname === path || (path !== '/home' && pathname.startsWith(path));
    return (
        <Tooltip title={(collapsed && !isMobile) ? name : ''} placement="right" arrow>
            <Link href={href || path} className="no-underline block" onClick={() => isMobile && setMobileOpen && setMobileOpen(false)}>
                <div
                    className={`flex items-center py-3 px-3 mx-2 my-1 rounded-xl transition-all duration-200 group relative overflow-hidden cursor-pointer
                    ${isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                    ${collapsed && !isMobile ? 'justify-center' : ''}`}
                >
                    <Icon
                        className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} ${collapsed && !isMobile ? '' : 'mr-4'}`}
                        sx={{ fontSize: 24 }}
                    />

                    {(!collapsed || isMobile) && (
                        <span className={`font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                            {name}
                        </span>
                    )}
                </div>
            </Link>
        </Tooltip>
    );
}

const DrawerContent = ({ collapsed, isMobile, toggleSidebar, handleDrawerToggle, setMobileOpen }: { collapsed: boolean, isMobile: boolean, toggleSidebar: () => void, handleDrawerToggle: () => void, setMobileOpen: (open: boolean) => void }) => {

    const pathname = usePathname();

    const ToggleIcon = isMobile ? ChevronLeft : (collapsed ? ChevronRight : ChevronLeft)

    // Dynamic Navigation Items
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const navItems = [
        { label: 'Dashboard', path: '/home', icon: Dashboard },
        { label: 'Cattle', path: '/cattle', icon: Pets },
        { label: 'Milk Production', path: '/milk', href: `/milk`, icon: LocalDrink },
        { label: 'Sales', path: '/sales', href: `/sales`, icon: AttachMoney },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-width-8 border-slate-800">
            {/* Logo Section */}
            <div className={`flex items-center m-2 my-4 ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
                {(!collapsed || isMobile) && (
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/50">
                            D
                        </div>
                        <div className="text-xl font-bold tracking-tight text-slate-100">
                            Dairy<span className="text-blue-500">Track</span>
                        </div>
                    </div>
                )}
                <ActionableIcon Icon={ToggleIcon} onClick={isMobile ? handleDrawerToggle : toggleSidebar} />
            </div>

            <Divider className="border-slate-800" />

            {/* Navigation Items */}
            <List className="flex-1 space-y-1 px-2">
                {navItems.map((item) => (
                    <DrawerItem
                        key={item.path}
                        Icon={item.icon}
                        name={item.label}
                        path={item.path}
                        href={item.href}
                        pathname={pathname}
                        collapsed={collapsed}
                        isMobile={isMobile}
                        setMobileOpen={setMobileOpen}
                    />
                ))}
            </List>

            {/* Bottom Section (Settings) */}

            <Divider />
            <DrawerItem Icon={Settings} name="Settings" path="/settings" pathname={pathname} collapsed={collapsed} isMobile={isMobile} setMobileOpen={setMobileOpen} />
        </div>
    );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [collapsed, setCollapsed] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                PaperProps={{
                    className: "bg-slate-900 border-r border-slate-800 overflow-hidden",
                    sx: {
                        backgroundColor: '#0f172a', // Enforce dark background on Paper
                        color: '#cbd5e1',
                        width: isMobile ? DRAWER_WIDTH : (collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH),
                        transition: 'width 0.3s ease',
                    }
                }}
                sx={{
                    width: isMobile ? 'auto' : (collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH),
                    flexShrink: 0,
                    transition: 'width 0.3s ease',
                    '& .MuiDrawer-paper': {
                        border: 'none', // Remove default MUI border
                    }
                }}
            >
                <DrawerContent collapsed={collapsed} isMobile={isMobile} toggleSidebar={toggleSidebar} handleDrawerToggle={handleDrawerToggle} setMobileOpen={setMobileOpen} />
            </Drawer>

            <main
                className={`flex-grow h-screen overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}
                style={{
                    width: isMobile ? '100%' : `calc(100% - ${collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)`,
                }}
            >
                {isMobile && (
                    <div className="h-16 px-4 bg-white dark:bg-slate-900 flex items-center border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shrink-0">

                        <MenuIcon onClick={handleDrawerToggle} className="mr-4 text-slate-200 dark:text-slate-300 cursor-pointer" />

                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                D
                            </div>
                            <div className="text-lg font-bold text-slate-800 dark:text-white">
                                DairyTrack
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
}
