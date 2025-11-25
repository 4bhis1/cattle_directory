import { NextRequest, NextResponse } from 'next/server';
import { mockData, Waste } from '@/lib/mockData';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/waste/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const waste = mockData.waste.find(w => w._id === id);

        if (!waste) {
            return NextResponse.json(
                { success: false, error: 'Waste record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: waste });
    } catch (error) {
        console.error('Error fetching waste:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch waste' },
            { status: 500 }
        );
    }
}

// PUT /api/waste/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const wasteIndex = mockData.waste.findIndex(w => w._id === id);

        if (wasteIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Waste record not found' },
                { status: 404 }
            );
        }

        const updatedWaste: Waste = {
            ...mockData.waste[wasteIndex],
            ...body,
            _id: id,
            updatedAt: new Date().toISOString()
        };

        mockData.waste[wasteIndex] = updatedWaste;

        return NextResponse.json({ success: true, data: updatedWaste });
    } catch (error) {
        console.error('Error updating waste:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update waste' },
            { status: 500 }
        );
    }
}

// DELETE /api/waste/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const wasteIndex = mockData.waste.findIndex(w => w._id === id);

        if (wasteIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Waste record not found' },
                { status: 404 }
            );
        }

        mockData.waste.splice(wasteIndex, 1);

        return NextResponse.json({ success: true, message: 'Waste record deleted successfully' });
    } catch (error) {
        console.error('Error deleting waste:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete waste' },
            { status: 500 }
        );
    }
}
