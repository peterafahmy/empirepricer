import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all itineraries for the logged-in agent
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itineraries = await prisma.itinerary.findMany({
      where: {
        agentId: session.user.id,
      },
      include: {
        travelers: true,
        services: true,
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itineraries' },
      { status: 500 }
    );
  }
}

// POST create new itinerary
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, customerName, startDate, endDate, currency, notes, termsConditions } = body;

    const itinerary = await prisma.itinerary.create({
      data: {
        title,
        customerName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        currency: currency || 'USD',
        notes,
        termsConditions,
        agentId: session.user.id,
      },
      include: {
        travelers: true,
        services: true,
      },
    });

    return NextResponse.json(itinerary, { status: 201 });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to create itinerary' },
      { status: 500 }
    );
  }
}
