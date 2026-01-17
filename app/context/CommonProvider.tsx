"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User interface
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    avatarUrl?: string;
    organisation_id: string;
}

// Global constant for organisation ID
export const DEFAULT_ORGANISATION_ID = 'org_default_001';

// Define the context state interface
interface CommonContextType {
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
    refreshData: () => Promise<void>;
}

// Create the context with default values
const CommonContext = createContext<CommonContextType | undefined>(undefined);

// Dummy user data
const DUMMY_ADMIN_USER: User = {
    id: 'user-001',
    name: 'Admin User',
    email: 'admin@cattle-directory.com',
    role: 'admin',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
    organisation_id: DEFAULT_ORGANISATION_ID
};

interface CommonProviderProps {
    children: ReactNode;
}

export const CommonProvider: React.FC<CommonProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Function to fetch or simulate fetching data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // In a real app, you would fetch user data from an API here
            // For now, we use the dummy admin user as requested
            setUser(DUMMY_ADMIN_USER);

        } catch (error) {
            console.error("Failed to fetch common data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const value = {
        user,
        isLoading,
        isAdmin: user?.role === 'admin',
        refreshData: fetchData
    };

    return (
        <CommonContext.Provider value={value}>
            {children}
        </CommonContext.Provider>
    );
};

// Hook to use the common context
export const useCommonData = () => {
    const context = useContext(CommonContext);
    if (context === undefined) {
        throw new Error('useCommonData must be used within a CommonProvider');
    }
    return context;
};

// Convenience hook to specifically get user and admin status
export const useUser = () => {
    const { user, isAdmin, isLoading } = useCommonData();
    return { user, isAdmin, isLoading };
};
