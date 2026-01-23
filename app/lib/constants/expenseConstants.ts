export const EXPENSE_GROUPS: Record<string, string[]> = {
    'Feeding': [
        'Pora',
        'Greenery',
        'Supplements',
        'Dry Fodder',
        'Wheat Seed',
        'Rice Seed',
        'Waste Daal Product',
        'Masala (Gurr)',
        'Salt',
        'Chuna (Calcium Water)',
        'Other Feeding'
    ],
    'Cattle': [
        'Medicine',
        'Veterinary Services',
        'Purchase',
        'Other Cattle Expense'
    ],
    'Salary': [
        'Staff Salary',
        'Labor Wages',
        'Bonus'
    ],
    'Infra': [
        'Power/Electricity',
        'Water',
        'Machines',
        'Construction',
        'Repairs'
    ],
    'Vehicle Expense': [
        'Fuel',
        'Service/Maintenance',
        'Insurance',
        'Repair'
    ],
    'Logistics': [
        'Freight/Cartage', // "fratten cartage" -> Freight/Cartage
        'Staff Fare'
    ],
    'Maintenance': [
        'Repair and Maintenance',
        'Cleaning'
    ],
    'Admin': [
        'Office Expense',
        'Stationery',
        'Software/Subscription'
    ],
    'Other': [
        'Miscellaneous'
    ]
};

export const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card'];
