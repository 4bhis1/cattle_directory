import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const useNavigate = () => {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('dashboard');

    const navigateTo = (section: string) => {
        setActiveSection(section);
        // Navigate to the appropriate route
        const routeMap: { [key: string]: string } = {
            'feed': '/feed/add',
            'milk': '/milk',
            'cattle': '/cattle/add',
            'expense': '/expenses/add',
            'waste': '/waste/add',
            'sales': '/sales/record',
            'dashboard': '/',
            'feed-stock': '/feed/stock'
        };

        const route = routeMap[section] || '/';
        router.push(route);
    }

    return {
        activeSection,
        navigateTo
    }
};
