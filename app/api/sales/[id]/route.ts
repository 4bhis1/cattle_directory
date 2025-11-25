import { NextRequest, NextResponse } from 'next/server';
import { mockData, Sales } from '@/lib/mockData';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/sales/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const sale = mockData.sales.find(s => s._id === id);

        if (!sale) {
            return NextResponse.json(
                { success: false, error: 'Sale not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: sale });
    } catch (error) {
        console.error('Error fetching sale:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sale' },
            { status: 500 }
        );
    }
}

// PUT /api/sales/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const saleIndex = mockData.sales.findIndex(s => s._id === id);

        if (saleIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Sale not found' },
                { status: 404 }
            );
        }

        const updatedSale: Sales = {
            ...mockData.sales[saleIndex],
            ...body,
            _id: id,
            updatedAt: new Date().toISOString()
        };

        mockData.sales[saleIndex] = updatedSale;

        return NextResponse.json({ success: true, data: updatedSale });
    } catch (error) {
        console.error('Error updating sale:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update sale' },
            { status: 500 }
        );
    }
}

// DELETE /api/sales/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const saleIndex = mockData.sales.findIndex(s => s._id === id);

        if (saleIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Sale not found' },
                { status: 404 }
            );
        }

        mockData.sales.splice(saleIndex, 1);

        return NextResponse.json({ success: true, message: 'Sale deleted successfully' });
    } catch (error) {
        console.error('Error deleting sale:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete sale' },
            { status: 500 }
        );
    }
}
