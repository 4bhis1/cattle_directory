import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/backend';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/cattle/[id] - Get single cattle by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const backendRes = await fetchFromBackend(`/cattle/${id}`);

    return NextResponse.json({ success: true, data: backendRes.data.data }, { status: 200 });
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
  return updateCattle(request, params);
}

// PATCH /api/cattle/[id] - Update cattle
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return updateCattle(request, params);
}

async function updateCattle(request: NextRequest, params: Promise<{ id: string }>) {
  try {
    const { id } = await params;
    const body = await request.json();

    const backendRes = await fetchFromBackend(`/cattle/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });

    return NextResponse.json(
      { success: true, data: backendRes.data.data },
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

    await fetchFromBackend(`/cattle/${id}`, {
      method: 'DELETE'
    });

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


