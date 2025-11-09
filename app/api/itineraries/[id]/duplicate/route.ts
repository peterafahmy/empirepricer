import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST duplicate itinerary
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get original itinerary
    const original = await prisma.itinerary.findUnique({
      where: { id: params.id },
      include: {
        travelers: true,
        services: true,
      },
    });

    if (!original) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    if (original.agentId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create duplicate
    const duplicate = await prisma.itinerary.create({
      data: {
        title: `${original.title} (Copy)`,
        customerName: original.customerName,
        startDate: original.startDate,
        endDate: original.endDate,
        currency: original.currency,
        notes: original.notes,
        termsConditions: original.termsConditions,
        agentId: session.user.id,
        travelers: {
          create: original.travelers.map((t: any) => ({
            name: t.name,
            age: t.age,
            roomType: t.roomType,
            roomNumber: t.roomNumber,
            isSingleOccupancy: t.isSingleOccupancy,
          })),
        },
        services: {
          create: original.services.map((s: any) => ({
            type: s.type,
            name: s.name,
            description: s.description,
            date: s.date,
            pricingType: s.pricingType,
            basePrice: s.basePrice,
            quantity: s.quantity,
            taxRate: s.taxRate,
            discount: s.discount,
            supplierCost: s.supplierCost,
            notes: s.notes,
            order: s.order,
          })),
        },
      },
      include: {
        travelers: true,
        services: true,
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error('Error duplicating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate itinerary' },
      { status: 500 }
    );
  }
}
