import { NextResponse } from 'next/server';
import { initialExpenses } from '@/lib/initialData';
import { Expense } from '@/lib/types';

let memoryExpenses: Expense[] = [...initialExpenses];

export async function GET() {
  return NextResponse.json(memoryExpenses);
}

export async function POST(request: Request) {
  try {
    const body: Expense = await request.json();
    const newExpense: Expense = {
      ...body,
      id: body.id || `exp-${Date.now()}`,
      amount: Number(body.amount) || 0,
      date: body.date || new Date().toISOString().split('T')[0],
    };
    memoryExpenses.unshift(newExpense);
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save expense' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
  }
  memoryExpenses = memoryExpenses.filter((e) => e.id !== id);
  return NextResponse.json({ success: true });
}
