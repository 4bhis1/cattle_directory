import { NextResponse } from 'next/server';
import { mockData, generateId, Cattle } from '@/lib/mockData';

// GET /api/cattle - Get all cattle
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockData.cattle
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

    const newCattle: Cattle = {
      ...body,
      _id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockData.cattle.push(newCattle);

    return NextResponse.json({
      success: true,
      data: newCattle
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating cattle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cattle' },
      { status: 500 }
    );
  }
}

