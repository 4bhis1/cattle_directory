import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/cattle/[id] - Get single cattle by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM cattle WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cattle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
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

    // Check if cattle exists
    const checkResult = await pool.query('SELECT id FROM cattle WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cattle not found' },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `UPDATE cattle SET
        name = COALESCE($1, name),
        breed = COALESCE($2, breed),
        cattle_type = COALESCE($3, cattle_type),
        date_of_joining = COALESCE($4, date_of_joining),
        purchase_amount = COALESCE($5, purchase_amount),
        seller_contact_number = COALESCE($6, seller_contact_number),
        seller_address = COALESCE($7, seller_address),
        age = COALESCE($8, age),
        photo_url = COALESCE($9, photo_url),
        estimated_milk_production_daily = COALESCE($10, estimated_milk_production_daily),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *`,
      [
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
        id,
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
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

    // Check if cattle exists
    const checkResult = await pool.query('SELECT id FROM cattle WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cattle not found' },
        { status: 404 }
      );
    }

    await pool.query('DELETE FROM cattle WHERE id = $1', [id]);

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

