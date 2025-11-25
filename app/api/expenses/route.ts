import { NextResponse } from 'next/server';
import { mockData, generateId, Expense } from '@/lib/mockData';

// GET /api/expenses
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: mockData.expenses
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch expenses' },
            { status: 500 }
        );
    }
}

// POST /api/expenses
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newExpense: Expense = {
            ...body,
            _id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockData.expenses.push(newExpense);

        return NextResponse.json({
            success: true,
            data: newExpense
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create expense' },
            { status: 500 }
        );
    }
}
