import { NextRequest, NextResponse } from 'next/server';
import { mockData, Expense } from '@/lib/mockData';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/expenses/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const expense = mockData.expenses.find(e => e._id === id);

        if (!expense) {
            return NextResponse.json(
                { success: false, error: 'Expense not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: expense });
    } catch (error) {
        console.error('Error fetching expense:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch expense' },
            { status: 500 }
        );
    }
}

// PUT /api/expenses/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const expenseIndex = mockData.expenses.findIndex(e => e._id === id);

        if (expenseIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Expense not found' },
                { status: 404 }
            );
        }

        const updatedExpense: Expense = {
            ...mockData.expenses[expenseIndex],
            ...body,
            _id: id,
            updatedAt: new Date().toISOString()
        };

        mockData.expenses[expenseIndex] = updatedExpense;

        return NextResponse.json({ success: true, data: updatedExpense });
    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update expense' },
            { status: 500 }
        );
    }
}

// DELETE /api/expenses/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const expenseIndex = mockData.expenses.findIndex(e => e._id === id);

        if (expenseIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Expense not found' },
                { status: 404 }
            );
        }

        mockData.expenses.splice(expenseIndex, 1);

        return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete expense' },
            { status: 500 }
        );
    }
}
