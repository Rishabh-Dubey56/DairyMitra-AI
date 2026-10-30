import { NextResponse } from 'next/server';
import { initialMilkRecords } from '@/lib/initialData';
import { MilkRecord } from '@/lib/types';

let memoryRecords: MilkRecord[] = [...initialMilkRecords];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const animalId = searchParams.get('animalId');

  let filtered = [...memoryRecords];
  if (date) {
    filtered = filtered.filter((r) => r.date === date);
  }
  if (animalId) {
    filtered = filtered.filter((r) => r.animalId === animalId);
  }

  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body: MilkRecord = await request.json();

    // Check duplicate entry for same animal & date
    const existing = memoryRecords.find(
      (r) => r.animalId === body.animalId && r.date === body.date && r.id !== body.id
    );

    if (existing) {
      return NextResponse.json(
        { success: false, duplicate: true, error: 'A record for this animal on this date already exists.' },
        { status: 409 }
      );
    }

    const totalQty = Math.round(((Number(body.morningQuantity) || 0) + (Number(body.eveningQuantity) || 0)) * 10) / 10;
    const rate = Number(body.ratePerLitre) || 45;
    const totalAmount = Math.round(totalQty * rate);

    const newRecord: MilkRecord = {
      ...body,
      id: body.id || `mr-${Date.now()}`,
      totalQuantity: totalQty,
      ratePerLitre: rate,
      totalAmount,
    };

    memoryRecords.unshift(newRecord);
    return NextResponse.json({ success: true, record: newRecord }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to record milk production' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Record ID required' }, { status: 400 });
  }
  memoryRecords = memoryRecords.filter((r) => r.id !== id);
  return NextResponse.json({ success: true });
}
