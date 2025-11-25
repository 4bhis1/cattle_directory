import { NextRequest, NextResponse } from 'next/server';
import { mockData, Medicine } from '@/lib/mockData';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/medicine/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const medicine = mockData.medicine.find(m => m._id === id);

        if (!medicine) {
            return NextResponse.json(
                { success: false, error: 'Medicine not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: medicine });
    } catch (error) {
        console.error('Error fetching medicine:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch medicine' },
            { status: 500 }
        );
    }
}

// PUT /api/medicine/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const medicineIndex = mockData.medicine.findIndex(m => m._id === id);

        if (medicineIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Medicine not found' },
                { status: 404 }
            );
        }

        const updatedMedicine: Medicine = {
            ...mockData.medicine[medicineIndex],
            ...body,
            _id: id,
            updatedAt: new Date().toISOString()
        };

        mockData.medicine[medicineIndex] = updatedMedicine;

        return NextResponse.json({ success: true, data: updatedMedicine });
    } catch (error) {
        console.error('Error updating medicine:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update medicine' },
            { status: 500 }
        );
    }
}

// DELETE /api/medicine/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const medicineIndex = mockData.medicine.findIndex(m => m._id === id);

        if (medicineIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Medicine not found' },
                { status: 404 }
            );
        }

        mockData.medicine.splice(medicineIndex, 1);

        return NextResponse.json({ success: true, message: 'Medicine deleted successfully' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete medicine' },
            { status: 500 }
        );
    }
}
