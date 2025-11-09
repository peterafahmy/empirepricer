import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST add traveler to itinerary
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, age, roomType, roomNumber, isSingleOccupancy } = body;

    // Check ownership
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: params.id },
    });

    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    if (itinerary.agentId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const traveler = await prisma.traveler.create({
      data: {
        name,
        age,
        roomType,
        roomNumber: roomNumber || 1,
        isSingleOccupancy: isSingleOccupancy || false,
        itineraryId: params.id,
      },
    });

    return NextResponse.json(traveler, { status: 201 });
  } catch (error) {
    console.error('Error adding traveler:', error);
    return NextResponse.json(
      { error: 'Failed to add traveler' },
      { status: 500 }
    );
  }
}
