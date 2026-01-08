import { NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/backend';

// GET /api/cattle - Get all cattle
export async function GET() {
  try {
    const backendRes = await fetchFromBackend('/cattle');

    // Transform backend response to match frontend expectation
    // Backend: { status: 'success', results: N, data: { data: [...] } }
    // Frontend Expects: { success: true, data: [...] }

    return NextResponse.json({
      success: true,
      data: backendRes.data.data
    });
  } catch (error) {
    console.error('Error fetching cattle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cattle' },
      { status: 500 }
    );
  }
}

// POST /api/cattle - Add new cattle
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Backend expects specific fields. 
    // Ideally validation happens here, but we pass it through.

    const backendRes = await fetchFromBackend('/cattle', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    return NextResponse.json({
      success: true,
      data: backendRes.data.data
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating cattle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cattle' },
      { status: 500 }
    );
  }
}


