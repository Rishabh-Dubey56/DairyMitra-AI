import { NextResponse } from 'next/server';
import { initialSales } from '@/lib/initialData';
import { Sale } from '@/lib/types';

let memorySales: Sale[] = [...initialSales];

export async function GET() {
  return NextResponse.json(memorySales);
}

export async function POST(request: Request) {
  try {
    const body: Sale = await request.json();
    const qty = Number(body.quantityLiters) || 0;
    const rate = Number(body.ratePerLitre) || 0;
    const total = body.totalAmount ? Number(body.totalAmount) : Math.round(qty * rate);

    const newSale: Sale = {
      ...body,
      id: body.id || `sale-${Date.now()}`,
      quantityLiters: qty,
      ratePerLitre: rate,
      totalAmount: total,
      date: body.date || new Date().toISOString().split('T')[0],
      paymentStatus: body.paymentStatus || 'Paid',
    };
    memorySales.unshift(newSale);
    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Sale ID required' }, { status: 400 });
  }
  memorySales = memorySales.filter((s) => s.id !== id);
  return NextResponse.json({ success: true });
}
