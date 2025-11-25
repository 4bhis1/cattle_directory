import { NextResponse } from 'next/server';
import { mockData, generateId, Sales } from '@/lib/mockData';

// GET /api/sales
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: mockData.sales
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sales' },
            { status: 500 }
        );
    }
}

// POST /api/sales
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newSale: Sales = {
            ...body,
            _id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockData.sales.push(newSale);

        return NextResponse.json({
            success: true,
            data: newSale
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating sale:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create sale' },
            { status: 500 }
        );
    }
}
