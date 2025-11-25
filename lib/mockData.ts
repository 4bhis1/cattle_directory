// Mock data for all entities - will be replaced with MongoDB later

export interface Cattle {
    _id: string;
    cattleId: string;
    name: string;
    category: 'cow' | 'buffalo' | 'heifer' | 'calf' | 'bull';
    gender: 'male' | 'female';
    breed: string;
    dateOfBirth: string;
    dateOfAcquisition: string;
    acquisitionType: 'purchased' | 'born' | 'gifted';
    purchasePrice: number;
    weight: {
        current: number;
        history: Array<{ weight: number; measuredAt: string }>;
    };
    status: 'active' | 'pregnant' | 'sick' | 'sold' | 'deceased';
    healthRecords: {
        lastCheckup: string;
        vaccinations: Array<{
            vaccineName: string;
            administeredDate: string;
            nextDueDate: string;
        }>;
    };
    images: string[];
    notes: string;
    motherId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Feed {
    _id: string;
    feedType: 'dry-fodder' | 'green-fodder' | 'concentrate' | 'silage' | 'mineral-mix';
    name: string;
    supplier: string;
    unitOfMeasure: 'kg' | 'quintal' | 'ton' | 'bundle';
    currentStock: number;
    minimumStock: number;
    averageDailyConsumption: number;
    pricePerUnit: number;
    lastPurchaseDate: string;
    expiryDate?: string;
    nutritionalInfo: {
        protein: number;
        energy: number;
        fiber: number;
    };
    storageLocation: string;
    createdAt: string;
    updatedAt: string;
}

export interface FeedInStock {
    _id: string;
    feedId: string;
    transactionType: 'purchase' | 'consumption' | 'wastage' | 'adjustment';
    quantity: number;
    unitOfMeasure: string;
    pricePerUnit: number;
    totalAmount: number;
    supplier: string;
    billNumber: string;
    transactionDate: string;
    consumedBy?: Array<{ cattleId: string; quantity: number }>;
    notes: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Milk {
    _id: string;
    cattleId: string;
    milkingSession: 'morning' | 'evening' | 'night';
    date: string;
    quantity: number;
    quality: {
        fat: number;
        snf: number;
        temperature: number;
    };
    soldTo: 'dairy' | 'direct-customer' | 'self-use';
    customerName?: string;
    pricePerLiter: number;
    totalAmount: number;
    paymentStatus: 'paid' | 'pending' | 'partial';
    paymentDate?: string;
    notes: string;
    recordedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Medicine {
    _id: string;
    medicineName: string;
    medicineType: 'antibiotic' | 'vaccine' | 'vitamin' | 'dewormer' | 'pain-relief' | 'other';
    manufacturer: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitOfMeasure: 'ml' | 'tablet' | 'bottle' | 'injection' | 'packet';
    pricePerUnit: number;
    purchaseDate: string;
    supplier: string;
    storageConditions: string;
    dosageInfo: string;
    withdrawalPeriod: number;
    currentStock: number;
    minimumStock: number;
    createdAt: string;
    updatedAt: string;
}

export interface MedicineApplication {
    _id: string;
    cattleId: string;
    medicineId: string;
    treatmentDate: string;
    reasonForTreatment: string;
    dosageGiven: number;
    unitOfMeasure: string;
    administeredBy: string;
    veterinarianName: string;
    veterinarianContact: string;
    followUpRequired: boolean;
    followUpDate?: string;
    treatmentCost: number;
    treatmentStatus: 'ongoing' | 'completed' | 'discontinued';
    withdrawalEndDate: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface Expense {
    _id: string;
    expenseCategory: 'feed' | 'medicine' | 'veterinary' | 'labor' | 'electricity' | 'water' | 'maintenance' | 'equipment' | 'transport' | 'other';
    subcategory: string;
    description: string;
    amount: number;
    date: string;
    paymentMethod: 'cash' | 'upi' | 'bank-transfer' | 'cheque' | 'card';
    paidTo: string;
    billNumber: string;
    billImage?: string;
    relatedCattleId?: string;
    relatedTransactionId?: string;
    isRecurring: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    paymentStatus: 'paid' | 'pending' | 'partial';
    notes: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Waste {
    _id: string;
    wasteType: 'feed' | 'fodder' | 'medicine' | 'other';
    relatedItemId: string;
    quantity: number;
    unitOfMeasure: string;
    reason: 'expired' | 'spoiled' | 'damaged' | 'contaminated' | 'excess';
    date: string;
    estimatedLoss: number;
    description: string;
    preventiveMeasures: string;
    createdAt: string;
    updatedAt: string;
}

export interface Sales {
    _id: string;
    clientName: string;
    clientContact: string;
    date: string;
    quantityInLiters: number;
    pricePerLiter: number;
    totalAmount: number;
    paymentStatus: 'paid' | 'pending' | 'partial';
    paymentDate?: string;
    paymentMethod?: 'cash' | 'upi' | 'bank-transfer' | 'cheque' | 'card';
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'owner' | 'manager' | 'staff' | 'veterinarian';
    fullName: string;
    phone: string;
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
}

export interface DailyReport {
    _id: string;
    date: string;
    totalMilkProduced: number;
    totalMilkSold: number;
    totalMilkRevenue: number;
    totalExpenses: number;
    activeCattleCount: number;
    feedConsumed: Array<{ feedId: string; quantity: number }>;
    cattleHealth: {
        healthy: number;
        sick: number;
        underTreatment: number;
    };
    notes: string;
    createdAt: string;
}

export interface Customer {
    _id: string;
    name: string;
    phone: string;
    address?: string;
    email?: string;
    joinDate: string;
    status: 'active' | 'inactive';
}

// Mock data storage
export const mockData = {
    customers: [
        {
            _id: '1',
            name: 'Rajesh Kumar',
            phone: '9876543210',
            address: '123 Village Road',
            joinDate: '2024-01-01',
            status: 'active'
        },
        {
            _id: '2',
            name: 'Sweet Shop',
            phone: '9876543211',
            address: 'Market Square',
            joinDate: '2024-01-15',
            status: 'active'
        }
    ] as Customer[],
    cattle: [
        {
            _id: '1',
            cattleId: 'CATTLE-001',
            name: 'Ganga',
            category: 'cow' as const,
            gender: 'female' as const,
            breed: 'Holstein',
            dateOfBirth: '2020-03-15',
            dateOfAcquisition: '2020-06-01',
            acquisitionType: 'purchased' as const,
            purchasePrice: 45000,
            weight: {
                current: 450,
                history: [
                    { weight: 420, measuredAt: '2024-01-01' },
                    { weight: 450, measuredAt: '2024-11-01' }
                ]
            },
            status: 'active' as const,
            healthRecords: {
                lastCheckup: '2024-10-15',
                vaccinations: [
                    {
                        vaccineName: 'FMD Vaccine',
                        administeredDate: '2024-09-01',
                        nextDueDate: '2025-03-01'
                    }
                ]
            },
            images: [],
            notes: 'High milk producer',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-11-01T00:00:00Z'
        },
        {
            _id: '2',
            cattleId: 'CATTLE-002',
            name: 'Lakshmi',
            category: 'buffalo' as const,
            gender: 'female' as const,
            breed: 'Murrah',
            dateOfBirth: '2019-08-20',
            dateOfAcquisition: '2020-01-10',
            acquisitionType: 'purchased' as const,
            purchasePrice: 55000,
            weight: {
                current: 550,
                history: [
                    { weight: 520, measuredAt: '2024-01-01' },
                    { weight: 550, measuredAt: '2024-11-01' }
                ]
            },
            status: 'pregnant' as const,
            healthRecords: {
                lastCheckup: '2024-11-10',
                vaccinations: [
                    {
                        vaccineName: 'Brucellosis Vaccine',
                        administeredDate: '2024-08-15',
                        nextDueDate: '2025-08-15'
                    }
                ]
            },
            images: [],
            notes: 'Expected delivery in February 2025',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-11-10T00:00:00Z'
        },
        {
            _id: '3',
            cattleId: 'CALF-001',
            name: 'Gauri',
            category: 'calf' as const,
            gender: 'female' as const,
            breed: 'Holstein',
            dateOfBirth: '2024-05-15',
            dateOfAcquisition: '2024-05-15',
            acquisitionType: 'born' as const,
            purchasePrice: 0,
            weight: {
                current: 80,
                history: [
                    { weight: 30, measuredAt: '2024-05-15' },
                    { weight: 80, measuredAt: '2024-11-01' }
                ]
            },
            status: 'active' as const,
            motherId: '1',
            healthRecords: {
                lastCheckup: '2024-11-01',
                vaccinations: []
            },
            images: [],
            notes: 'Daughter of Ganga',
            createdAt: '2024-05-15T00:00:00Z',
            updatedAt: '2024-11-01T00:00:00Z'
        }
    ] as Cattle[],

    feed: [
        {
            _id: '1',
            feedType: 'green-fodder' as const,
            name: 'Maize Fodder',
            supplier: 'Local Farm',
            unitOfMeasure: 'kg' as const,
            currentStock: 500,
            minimumStock: 100,
            averageDailyConsumption: 50,
            pricePerUnit: 5,
            lastPurchaseDate: '2024-11-20',
            nutritionalInfo: {
                protein: 8.5,
                energy: 2800,
                fiber: 25
            },
            storageLocation: 'Shed A',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-11-20T00:00:00Z'
        },
        {
            _id: '2',
            feedType: 'concentrate' as const,
            name: 'Cattle Feed Pellets',
            supplier: 'Amul Feed',
            unitOfMeasure: 'kg' as const,
            currentStock: 200,
            minimumStock: 50,
            averageDailyConsumption: 20,
            pricePerUnit: 35,
            lastPurchaseDate: '2024-11-15',
            expiryDate: '2025-05-15',
            nutritionalInfo: {
                protein: 18,
                energy: 3200,
                fiber: 12
            },
            storageLocation: 'Storage Room B',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-11-15T00:00:00Z'
        }
    ] as Feed[],

    feedInStock: [
        {
            _id: '1',
            feedId: '1',
            transactionType: 'purchase' as const,
            quantity: 500,
            unitOfMeasure: 'kg',
            pricePerUnit: 5,
            totalAmount: 2500,
            supplier: 'Local Farm',
            billNumber: 'BILL-2024-001',
            transactionDate: '2024-11-20',
            notes: 'Fresh stock',
            createdBy: 'Admin',
            createdAt: '2024-11-20T00:00:00Z',
            updatedAt: '2024-11-20T00:00:00Z'
        }
    ] as FeedInStock[],

    milk: [
        {
            _id: '1',
            cattleId: '1',
            milkingSession: 'morning' as const,
            date: '2024-11-23',
            quantity: 12,
            quality: {
                fat: 4.5,
                snf: 8.5,
                temperature: 35
            },
            soldTo: 'dairy' as const,
            pricePerLiter: 45,
            totalAmount: 540,
            paymentStatus: 'paid' as const,
            paymentDate: '2024-11-23',
            notes: 'Good quality',
            recordedBy: 'Staff',
            createdAt: '2024-11-23T06:00:00Z',
            updatedAt: '2024-11-23T06:00:00Z'
        },
        {
            _id: '2',
            cattleId: '2',
            milkingSession: 'evening' as const,
            date: '2024-11-23',
            quantity: 8,
            quality: {
                fat: 7.2,
                snf: 9.1,
                temperature: 34
            },
            soldTo: 'direct-customer' as const,
            customerName: 'Ramesh Kumar',
            pricePerLiter: 60,
            totalAmount: 480,
            paymentStatus: 'pending' as const,
            notes: 'Buffalo milk - high fat',
            recordedBy: 'Staff',
            createdAt: '2024-11-23T18:00:00Z',
            updatedAt: '2024-11-23T18:00:00Z'
        }
    ] as Milk[],

    medicine: [
        {
            _id: '1',
            medicineName: 'Oxytetracycline',
            medicineType: 'antibiotic' as const,
            manufacturer: 'Zoetis',
            batchNumber: 'BATCH-2024-A1',
            expiryDate: '2025-12-31',
            quantity: 10,
            unitOfMeasure: 'bottle' as const,
            pricePerUnit: 250,
            purchaseDate: '2024-10-01',
            supplier: 'Vet Supplies Co',
            storageConditions: 'Keep in cool, dry place',
            dosageInfo: '1ml per 10kg body weight',
            withdrawalPeriod: 7,
            currentStock: 8,
            minimumStock: 3,
            createdAt: '2024-10-01T00:00:00Z',
            updatedAt: '2024-11-01T00:00:00Z'
        }
    ] as Medicine[],

    medicineApplication: [
        {
            _id: '1',
            cattleId: '1',
            medicineId: '1',
            treatmentDate: '2024-11-15',
            reasonForTreatment: 'Respiratory infection',
            dosageGiven: 45,
            unitOfMeasure: 'ml',
            administeredBy: 'Dr. Sharma',
            veterinarianName: 'Dr. Rajesh Sharma',
            veterinarianContact: '+91-9876543210',
            followUpRequired: true,
            followUpDate: '2024-11-22',
            treatmentCost: 500,
            treatmentStatus: 'completed' as const,
            withdrawalEndDate: '2024-11-22',
            notes: 'Recovery successful',
            createdAt: '2024-11-15T00:00:00Z',
            updatedAt: '2024-11-22T00:00:00Z'
        }
    ] as MedicineApplication[],

    expenses: [
        {
            _id: '1',
            expenseCategory: 'feed' as const,
            subcategory: 'Green Fodder',
            description: 'Maize fodder purchase',
            amount: 2500,
            date: '2024-11-20',
            paymentMethod: 'cash' as const,
            paidTo: 'Local Farm',
            billNumber: 'BILL-2024-001',
            isRecurring: false,
            paymentStatus: 'paid' as const,
            notes: '',
            createdBy: 'Admin',
            createdAt: '2024-11-20T00:00:00Z',
            updatedAt: '2024-11-20T00:00:00Z'
        },
        {
            _id: '2',
            expenseCategory: 'electricity' as const,
            subcategory: 'Monthly Bill',
            description: 'November electricity bill',
            amount: 3500,
            date: '2024-11-10',
            paymentMethod: 'upi' as const,
            paidTo: 'State Electricity Board',
            billNumber: 'EB-NOV-2024',
            isRecurring: true,
            recurringFrequency: 'monthly' as const,
            paymentStatus: 'paid' as const,
            notes: '',
            createdBy: 'Admin',
            createdAt: '2024-11-10T00:00:00Z',
            updatedAt: '2024-11-10T00:00:00Z'
        }
    ] as Expense[],

    waste: [
        {
            _id: '1',
            wasteType: 'feed' as const,
            relatedItemId: '2',
            quantity: 5,
            unitOfMeasure: 'kg',
            reason: 'spoiled' as const,
            date: '2024-11-18',
            estimatedLoss: 175,
            description: 'Feed got wet due to roof leak',
            preventiveMeasures: 'Roof repaired, improved storage',
            createdAt: '2024-11-18T00:00:00Z',
            updatedAt: '2024-11-18T00:00:00Z'
        }
    ] as Waste[],

    sales: [
        {
            _id: '1',
            clientName: 'Sharma Dairy',
            clientContact: '+91-9876543211',
            date: '2024-11-23',
            quantityInLiters: 50,
            pricePerLiter: 45,
            totalAmount: 2250,
            paymentStatus: 'paid' as const,
            paymentDate: '2024-11-23',
            paymentMethod: 'bank-transfer' as const,
            notes: 'Regular customer',
            createdAt: '2024-11-23T00:00:00Z',
            updatedAt: '2024-11-23T00:00:00Z'
        },
        {
            _id: '2',
            clientName: 'Ramesh Kumar',
            clientContact: '+91-9876543212',
            date: '2024-11-23',
            quantityInLiters: 8,
            pricePerLiter: 60,
            totalAmount: 480,
            paymentStatus: 'pending' as const,
            notes: 'Direct customer - buffalo milk',
            createdAt: '2024-11-23T00:00:00Z',
            updatedAt: '2024-11-23T00:00:00Z'
        }
    ] as Sales[],

    users: [
        {
            _id: '1',
            username: 'admin',
            email: 'admin@dairyfarm.com',
            role: 'owner' as const,
            fullName: 'Farm Owner',
            phone: '+91-9876543210',
            isActive: true,
            lastLogin: '2024-11-23T00:00:00Z',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-11-23T00:00:00Z'
        }
    ] as User[],

    dailyReports: [
        {
            _id: '1',
            date: '2024-11-23',
            totalMilkProduced: 20,
            totalMilkSold: 20,
            totalMilkRevenue: 1020,
            totalExpenses: 0,
            activeCattleCount: 2,
            feedConsumed: [
                { feedId: '1', quantity: 50 },
                { feedId: '2', quantity: 20 }
            ],
            cattleHealth: {
                healthy: 2,
                sick: 0,
                underTreatment: 0
            },
            notes: 'Normal day operations',
            createdAt: '2024-11-23T23:59:59Z'
        }
    ] as DailyReport[]
};

// Helper function to generate new ID
let idCounter = 1000;
export const generateId = () => {
    idCounter++;
    return idCounter.toString();
};

export const db = mockData;
