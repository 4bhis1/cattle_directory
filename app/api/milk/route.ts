import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/milk - Get all milk records (with optional date filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const cattleId = searchParams.get('cattleId');

    let query = `
      SELECT 
        mr.*,
        c.name as cattle_name,
        c.breed as cattle_breed
      FROM milk_records mr
      JOIN cattle c ON mr.cattle_id = c.id
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (date) {
      query += ` WHERE mr.record_date = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    if (cattleId) {
      query += date ? ` AND mr.cattle_id = $${paramCount}` : ` WHERE mr.cattle_id = $${paramCount}`;
      params.push(cattleId);
      paramCount++;
    }

    query += ' ORDER BY mr.record_date DESC, c.name ASC';

    const result = await pool.query(query, params);
    return NextResponse.json({ success: true, data: result.rows }, { status: 200 });
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
    const { cattleId, recordDate, morningMilk, eveningMilk, ratePerLiter } = body;

    // Validate required fields
    if (!cattleId || !recordDate) {
      return NextResponse.json(
        { success: false, error: 'Cattle ID and record date are required' },
        { status: 400 }
      );
    }

    // Check if cattle exists
    const cattleCheck = await pool.query('SELECT id FROM cattle WHERE id = $1', [cattleId]);
    if (cattleCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cattle not found' },
        { status: 404 }
      );
    }

    // Use INSERT ... ON CONFLICT to handle updates if record already exists
    const result = await pool.query(
      `INSERT INTO milk_records (
        cattle_id, record_date, morning_milk, evening_milk, rate_per_liter
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (cattle_id, record_date)
      DO UPDATE SET
        morning_milk = EXCLUDED.morning_milk,
        evening_milk = EXCLUDED.evening_milk,
        rate_per_liter = EXCLUDED.rate_per_liter,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        cattleId,
        recordDate,
        morningMilk || 0,
        eveningMilk || 0,
        ratePerLiter || 40,
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating milk record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create milk record' },
      { status: 500 }
    );
  }
}

