import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/milk/[id] - Get single milk record by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT 
        mr.*,
        c.name as cattle_name,
        c.breed as cattle_breed
      FROM milk_records mr
      JOIN cattle c ON mr.cattle_id = c.id
      WHERE mr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Milk record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching milk record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch milk record' },
      { status: 500 }
    );
  }
}

// PUT /api/milk/[id] - Update milk record
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { recordDate, morningMilk, eveningMilk, ratePerLiter } = body;

    // Check if milk record exists
    const checkResult = await pool.query('SELECT id FROM milk_records WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Milk record not found' },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `UPDATE milk_records SET
        record_date = COALESCE($1, record_date),
        morning_milk = COALESCE($2, morning_milk),
        evening_milk = COALESCE($3, evening_milk),
        rate_per_liter = COALESCE($4, rate_per_liter),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *`,
      [recordDate, morningMilk, eveningMilk, ratePerLiter, id]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating milk record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update milk record' },
      { status: 500 }
    );
  }
}

// DELETE /api/milk/[id] - Delete milk record
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if milk record exists
    const checkResult = await pool.query('SELECT id FROM milk_records WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Milk record not found' },
        { status: 404 }
      );
    }

    await pool.query('DELETE FROM milk_records WHERE id = $1', [id]);

    return NextResponse.json(
      { success: true, message: 'Milk record deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting milk record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete milk record' },
      { status: 500 }
    );
  }
}

