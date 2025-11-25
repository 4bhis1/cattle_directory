import { NextResponse } from 'next/server';
import { mockData, generateId, MedicineApplication } from '@/lib/mockData';

// GET /api/medicine-application
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: mockData.medicineApplication
        });
    } catch (error) {
        console.error('Error fetching medicine applications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch medicine applications' },
            { status: 500 }
        );
    }
}

// POST /api/medicine-application
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newApplication: MedicineApplication = {
            ...body,
            _id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockData.medicineApplication.push(newApplication);

        return NextResponse.json({
            success: true,
            data: newApplication
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating medicine application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create medicine application' },
            { status: 500 }
        );
    }
}
