import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/cattle - Get all cattle
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM cattle ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching cattle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cattle' },
      { status: 500 }
    );
  }
}

// POST /api/cattle - Add new cattle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      breed,
      cattleType,
      dateOfJoining,
      purchaseAmount,
      sellerContactNumber,
      sellerAddress,
      age,
      photoUrl,
      estimatedMilkProductionDaily,
    } = body;

    // Validate required fields
    if (!name || !breed || !dateOfJoining) {
      return NextResponse.json(
        { success: false, error: 'Name, breed, and date of joining are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO cattle (
        name, breed, cattle_type, date_of_joining, purchase_amount,
        seller_contact_number, seller_address, age, photo_url,
        estimated_milk_production_daily
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name,
        breed,
        cattleType || 'cow',
        dateOfJoining,
        purchaseAmount || null,
        sellerContactNumber || null,
        sellerAddress || null,
        age || null,
        photoUrl || null,
        estimatedMilkProductionDaily || null,
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating cattle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cattle' },
      { status: 500 }
    );
  }
}

