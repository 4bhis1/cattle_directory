'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tooltip,
    Divider,
    Typography,
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
    Restaurant,
    ReceiptLong,
    Delete,
    Settings,
    Logout,
    ChevronRight,
    MenuOpen
} from '@mui/icons-material';

const DRAWER_WIDTH = 250;
const COLLAPSED_WIDTH = 70;

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/home', icon: <Dashboard /> },
    { label: 'Cattle', path: '/cattle/dashboard', icon: <Pets /> },
    { label: 'Milk Production', path: '/milk', icon: <LocalDrink /> },
    { label: 'Sales Records', path: '/sales/record', icon: <AttachMoney /> },
    // { label: 'Feed Management', path: '/feed/add', icon: <Restaurant /> },
    // { label: 'Expenses', path: '/expenses/add', icon: <ReceiptLong /> },
    // { label: 'Waste', path: '/waste/add', icon: <Delete /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const drawerContent = (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: (collapsed && !isMobile) ? 'center' : 'space-between',
                    p: 2,
                    height: 64,
                }}
            >
                {(!collapsed || isMobile) && (
                    <Typography variant="h6" fontWeight="bold" noWrap sx={{ color: '#60a5fa' }}>
                        Dairy<span className="text-white">Track</span>
                    </Typography>
                )}
                <IconButton onClick={isMobile ? handleDrawerToggle : toggleSidebar} sx={{ color: 'white' }}>
                    {isMobile ? <ChevronLeft /> : (collapsed ? <ChevronRight /> : <ChevronLeft />)}
                </IconButton>
            </Box>

            <Divider sx={{ borderColor: '#334155' }} />

            <List sx={{ px: 1, py: 2 }}>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/home' && pathname.startsWith(item.path));
                    return (
                        <ListItem key={item.path} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <Tooltip title={(collapsed && !isMobile) ? item.label : ''} placement="right" arrow>
                                <Link href={item.path} style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => isMobile && setMobileOpen(false)}>
                                    <ListItemButton
                                        sx={{
                                            minHeight: 48,
                                            justifyContent: (collapsed && !isMobile) ? 'center' : 'initial',
                                            px: 2.5,
                                            borderRadius: 2,
                                            backgroundColor: isActive ? '#3b82f6' : 'transparent',
                                            '&:hover': {
                                                backgroundColor: isActive ? '#2563eb' : '#334155',
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: (collapsed && !isMobile) ? 0 : 2,
                                                justifyContent: 'center',
                                                color: isActive ? 'white' : '#94a3b8',
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            sx={{
                                                opacity: (collapsed && !isMobile) ? 0 : 1,
                                                display: (collapsed && !isMobile) ? 'none' : 'block',
                                                '& .MuiTypography-root': { fontWeight: isActive ? 600 : 400, fontSize: '0.95rem' }
                                            }}
                                        />
                                    </ListItemButton>
                                </Link>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{ marginTop: 'auto', p: 1 }}>
                <Divider sx={{ borderColor: '#334155', mb: 1 }} />
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <Tooltip title={(collapsed && !isMobile) ? "Settings" : ''} placement="right">
                        <ListItemButton
                            sx={{
                                minHeight: 48,
                                justifyContent: (collapsed && !isMobile) ? 'center' : 'initial',
                                px: 2.5,
                                borderRadius: 2,
                                '&:hover': { backgroundColor: '#334155' }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: (collapsed && !isMobile) ? 0 : 2, justifyContent: 'center', color: '#94a3b8' }}>
                                <Settings />
                            </ListItemIcon>
                            <ListItemText primary="Settings" sx={{ opacity: (collapsed && !isMobile) ? 0 : 1, display: (collapsed && !isMobile) ? 'none' : 'block' }} />
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
            </Box>
        </>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                sx={{
                    width: isMobile ? 'auto' : (collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH),
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: isMobile ? DRAWER_WIDTH : (collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH),
                        transition: 'width 0.3s ease',
                        overflowX: 'hidden',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        borderRight: '1px solid #334155',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: isMobile ? '100%' : `calc(100% - ${collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)`,
                    transition: 'width 0.3s ease, margin-left 0.3s ease',
                    minHeight: '100vh',
                    bgcolor: '#f1f5f9'
                }}
            >
                {isMobile && (
                    <Box sx={{ p: 2, background: 'white', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                        <IconButton onClick={handleDrawerToggle} edge="start" sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                            DairyTrack
                        </Typography>
                    </Box>
                )}
                {children}
            </Box>
        </Box>
    );
}
