import { NextResponse } from 'next/server';
import { mockData, generateId, Waste } from '@/lib/mockData';

// GET /api/waste
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: mockData.waste
        });
    } catch (error) {
        console.error('Error fetching waste:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch waste' },
            { status: 500 }
        );
    }
}

// POST /api/waste
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newWaste: Waste = {
            ...body,
            _id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockData.waste.push(newWaste);

        return NextResponse.json({
            success: true,
            data: newWaste
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating waste:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create waste' },
            { status: 500 }
        );
    }
}
