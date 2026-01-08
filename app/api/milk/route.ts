import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/backend';

// GET /api/milk - Get all milk records (with optional date filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/milk?${queryString}` : '/milk';

    const backendRes = await fetchFromBackend(endpoint);

    return NextResponse.json({ success: true, data: backendRes.data.data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching milk records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch milk records' },
      { status: 500 }
    );
  }
}

// POST /api/milk - Add new milk record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetchFromBackend('/milk', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    return NextResponse.json({
      success: true,
      data: backendRes.data.data
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating milk record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create milk record' },
      { status: 500 }
    );
  }
}
