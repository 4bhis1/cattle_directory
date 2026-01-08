import { NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/backend';

// GET /api/feed - Get all feed
export async function GET() {
    try {
        const backendRes = await fetchFromBackend('/feeds');
        return NextResponse.json({
            success: true,
            data: backendRes.data.data
        });
    } catch (error) {
        console.error('Error fetching feed:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch feed' },
            { status: 500 }
        );
    }
}

// POST /api/feed - Add new feed
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const backendRes = await fetchFromBackend('/feeds', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        return NextResponse.json({
            success: true,
            data: backendRes.data.data
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating feed:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create feed' },
            { status: 500 }
        );
    }
}
