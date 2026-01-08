import { NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/backend';

export async function GET() {
    try {
        const backendRes = await fetchFromBackend('/medicine-applications');
        return NextResponse.json({
            success: true,
            data: backendRes.data.data
        });
    } catch (error) {
        console.error('Error fetching medicine applications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch medicine applications' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const backendRes = await fetchFromBackend('/medicine-applications', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        return NextResponse.json({
            success: true,
            data: backendRes.data.data
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating medicine application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create medicine application' },
            { status: 500 }
        );
    }
}
