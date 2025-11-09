import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single itinerary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: {
        id: params.id,
      },
      include: {
        travelers: true,
        services: {
          orderBy: {
            order: 'asc',
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itinerary' },
      { status: 500 }
    );
  }
}

// PATCH update itinerary
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, customerName, startDate, endDate, currency, notes, termsConditions } = body;

    const itinerary = await prisma.itinerary.update({
      where: { id: params.id },
      data: {
        title,
        customerName,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        currency,
        notes,
        termsConditions,
      },
      include: {
        travelers: true,
        services: true,
      },
    });

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Error updating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to update itinerary' },
      { status: 500 }
    );
  }
}

// DELETE itinerary
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.itinerary.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to delete itinerary' },
      { status: 500 }
    );
  }
}
