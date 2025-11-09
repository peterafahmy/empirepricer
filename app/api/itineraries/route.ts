import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all itineraries
export async function GET(request: NextRequest) {
  try {
    const itineraries = await prisma.itinerary.findMany({
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
    const body = await request.json();
    const { title, customerName, startDate, endDate, currency, notes, termsConditions } = body;

    // Get or create a default user for public access
    let defaultUser = await prisma.user.findFirst({ where: { email: 'public@empiretravel.com' } });
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'public@empiretravel.com',
          name: 'Public User',
          password: 'none',
          role: 'AGENT',
        },
      });
    }

    const itinerary = await prisma.itinerary.create({
      data: {
        title,
        customerName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        currency: currency || 'USD',
        notes,
        termsConditions,
        agentId: defaultUser.id,
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
