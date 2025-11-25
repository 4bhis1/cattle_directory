import { NextRequest, NextResponse } from 'next/server';
import { mockData, Cattle } from '@/lib/mockData';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/cattle/[id] - Get single cattle by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cattle = mockData.cattle.find(c => c._id === id);

    if (!cattle) {
      return NextResponse.json(
        { success: false, error: 'Cattle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: cattle }, { status: 200 });
  } catch (error) {
    console.error('Error fetching cattle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cattle' },
      { status: 500 }
    );
  }
}

// PUT /api/cattle/[id] - Update cattle
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const cattleIndex = mockData.cattle.findIndex(c => c._id === id);

    if (cattleIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Cattle not found' },
        { status: 404 }
      );
    }

    const updatedCattle: Cattle = {
      ...mockData.cattle[cattleIndex],
      ...body,
      _id: id,
      updatedAt: new Date().toISOString()
    };

    mockData.cattle[cattleIndex] = updatedCattle;

    return NextResponse.json(
      { success: true, data: updatedCattle },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating cattle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cattle' },
      { status: 500 }
    );
  }
}

// DELETE /api/cattle/[id] - Delete cattle
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const cattleIndex = mockData.cattle.findIndex(c => c._id === id);

    if (cattleIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Cattle not found' },
        { status: 404 }
      );
    }

    mockData.cattle.splice(cattleIndex, 1);

    return NextResponse.json(
      { success: true, message: 'Cattle deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting cattle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cattle' },
      { status: 500 }
    );
  }
}


