import { NextResponse } from 'next/server';
import { initialAnimals } from '@/lib/initialData';
import { Animal } from '@/lib/types';

// In-memory runtime cache for API route
let memoryAnimals: Animal[] = [...initialAnimals];

export async function GET() {
  return NextResponse.json(memoryAnimals);
}

export async function POST(request: Request) {
  try {
    const body: Animal = await request.json();
    if (!body.tagNumber || !body.name) {
      return NextResponse.json({ error: 'Tag number and Name are required' }, { status: 400 });
    }

    const newAnimal: Animal = {
      ...body,
      id: body.id || `a-${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    memoryAnimals.unshift(newAnimal);
    return NextResponse.json(newAnimal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create animal' }, { status: 500 });
  }
}
