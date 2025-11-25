import { NextResponse } from 'next/server';
import { mockData, generateId, Medicine } from '@/lib/mockData';

// GET /api/medicine
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: mockData.medicine
        });
    } catch (error) {
        console.error('Error fetching medicine:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch medicine' },
            { status: 500 }
        );
    }
}

// POST /api/medicine
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newMedicine: Medicine = {
            ...body,
            _id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockData.medicine.push(newMedicine);

        return NextResponse.json({
            success: true,
            data: newMedicine
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating medicine:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create medicine' },
            { status: 500 }
        );
    }
}
