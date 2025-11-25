import { NextRequest, NextResponse } from 'next/server';
import { mockData, generateId, Milk } from '@/lib/mockData';

// GET /api/milk - Get all milk records (with optional date filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const cattleId = searchParams.get('cattleId');

    let filteredMilk = mockData.milk;

    if (date) {
      filteredMilk = filteredMilk.filter(m => m.date === date);
    }

    if (cattleId) {
      filteredMilk = filteredMilk.filter(m => m.cattleId === cattleId);
    }

    return NextResponse.json({ success: true, data: filteredMilk }, { status: 200 });
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

    const newMilk: Milk = {
      ...body,
      _id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockData.milk.push(newMilk);

    return NextResponse.json({
      success: true,
      data: newMilk
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating milk record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create milk record' },
      { status: 500 }
    );
  }
}


