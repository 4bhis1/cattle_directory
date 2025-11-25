import { NextResponse } from 'next/server';
import { db, Customer } from '@/lib/mockData';

export async function GET() {
    return NextResponse.json({ success: true, data: db.customers });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newCustomer: Customer = {
            _id: Math.random().toString(36).substr(2, 9),
            ...body,
            joinDate: body.joinDate || new Date().toISOString().split('T')[0],
            status: body.status || 'active'
        };

        db.customers.push(newCustomer);

        return NextResponse.json({ success: true, data: newCustomer });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to create customer' },
            { status: 500 }
        );
    }
}
