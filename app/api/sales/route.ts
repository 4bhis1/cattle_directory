import { NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/backend';

export async function GET() {
    try {
        const backendRes = await fetchFromBackend('/finance/sales');
        return NextResponse.json({
            success: true,
            data: backendRes.data.data
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sales' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const backendRes = await fetchFromBackend('/finance/sales', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        return NextResponse.json({
            success: true,
            data: backendRes.data.data
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating sale:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create sale' },
            { status: 500 }
        );
    }
}
