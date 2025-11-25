import { NextRequest, NextResponse } from 'next/server';
import { mockData, Feed } from '@/lib/mockData';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/feed/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const feed = mockData.feed.find(f => f._id === id);

        if (!feed) {
            return NextResponse.json(
                { success: false, error: 'Feed not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: feed });
    } catch (error) {
        console.error('Error fetching feed:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch feed' },
            { status: 500 }
        );
    }
}

// PUT /api/feed/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const feedIndex = mockData.feed.findIndex(f => f._id === id);

        if (feedIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Feed not found' },
                { status: 404 }
            );
        }

        const updatedFeed: Feed = {
            ...mockData.feed[feedIndex],
            ...body,
            _id: id,
            updatedAt: new Date().toISOString()
        };

        mockData.feed[feedIndex] = updatedFeed;

        return NextResponse.json({ success: true, data: updatedFeed });
    } catch (error) {
        console.error('Error updating feed:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update feed' },
            { status: 500 }
        );
    }
}

// DELETE /api/feed/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const feedIndex = mockData.feed.findIndex(f => f._id === id);

        if (feedIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Feed not found' },
                { status: 404 }
            );
        }

        mockData.feed.splice(feedIndex, 1);

        return NextResponse.json({ success: true, message: 'Feed deleted successfully' });
    } catch (error) {
        console.error('Error deleting feed:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete feed' },
            { status: 500 }
        );
    }
}
