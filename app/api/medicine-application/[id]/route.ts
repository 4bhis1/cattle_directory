import { NextRequest, NextResponse } from 'next/server';
import { mockData, MedicineApplication } from '@/lib/mockData';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/medicine-application/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const application = mockData.medicineApplication.find(a => a._id === id);

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Medicine application not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: application });
    } catch (error) {
        console.error('Error fetching medicine application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch medicine application' },
            { status: 500 }
        );
    }
}

// PUT /api/medicine-application/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const applicationIndex = mockData.medicineApplication.findIndex(a => a._id === id);

        if (applicationIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Medicine application not found' },
                { status: 404 }
            );
        }

        const updatedApplication: MedicineApplication = {
            ...mockData.medicineApplication[applicationIndex],
            ...body,
            _id: id,
            updatedAt: new Date().toISOString()
        };

        mockData.medicineApplication[applicationIndex] = updatedApplication;

        return NextResponse.json({ success: true, data: updatedApplication });
    } catch (error) {
        console.error('Error updating medicine application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update medicine application' },
            { status: 500 }
        );
    }
}

// DELETE /api/medicine-application/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const applicationIndex = mockData.medicineApplication.findIndex(a => a._id === id);

        if (applicationIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Medicine application not found' },
                { status: 404 }
            );
        }

        mockData.medicineApplication.splice(applicationIndex, 1);

        return NextResponse.json({ success: true, message: 'Medicine application deleted successfully' });
    } catch (error) {
        console.error('Error deleting medicine application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete medicine application' },
            { status: 500 }
        );
    }
}
