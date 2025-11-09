import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH update traveler
export async function PATCH(
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

    // Check ownership through itinerary
    const existing = await prisma.traveler.findUnique({
      where: { id: params.id },
      include: { itinerary: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Traveler not found' }, { status: 404 });
    }

    if (existing.itinerary.agentId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const traveler = await prisma.traveler.update({
      where: { id: params.id },
      data: {
        name,
        age,
        roomType,
        roomNumber,
        isSingleOccupancy,
      },
    });

    return NextResponse.json(traveler);
  } catch (error) {
    console.error('Error updating traveler:', error);
    return NextResponse.json(
      { error: 'Failed to update traveler' },
      { status: 500 }
    );
  }
}

// DELETE traveler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership through itinerary
    const existing = await prisma.traveler.findUnique({
      where: { id: params.id },
      include: { itinerary: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Traveler not found' }, { status: 404 });
    }

    if (existing.itinerary.agentId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.traveler.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Traveler deleted successfully' });
  } catch (error) {
    console.error('Error deleting traveler:', error);
    return NextResponse.json(
      { error: 'Failed to delete traveler' },
      { status: 500 }
    );
  }
}
