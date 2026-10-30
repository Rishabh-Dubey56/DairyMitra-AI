import { NextResponse } from 'next/server';
import { initialAnimals } from '@/lib/initialData';
import { Animal } from '@/lib/types';

let memoryAnimals: Animal[] = [...initialAnimals];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const animal = memoryAnimals.find((a) => a.id === id || a.tagNumber.toLowerCase() === id.toLowerCase());
  if (!animal) {
    return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
  }
  return NextResponse.json(animal);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: Animal = await request.json();
    const index = memoryAnimals.findIndex((a) => a.id === id || a.tagNumber.toLowerCase() === id.toLowerCase());
    
    if (index === -1) {
      memoryAnimals.unshift(body);
      return NextResponse.json(body);
    }

    memoryAnimals[index] = { ...memoryAnimals[index], ...body };
    return NextResponse.json(memoryAnimals[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update animal' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  memoryAnimals = memoryAnimals.filter((a) => a.id !== id && a.tagNumber.toLowerCase() !== id.toLowerCase());
  return NextResponse.json({ success: true, message: 'Animal deleted' });
}
