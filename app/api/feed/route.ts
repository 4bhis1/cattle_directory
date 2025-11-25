import { NextResponse } from 'next/server';
import { mockData, generateId, Feed } from '@/lib/mockData';

// GET /api/feed - Get all feed
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: mockData.feed
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

        const newFeed: Feed = {
            ...body,
            _id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockData.feed.push(newFeed);

        return NextResponse.json({
            success: true,
            data: newFeed
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating feed:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create feed' },
            { status: 500 }
        );
    }
}
