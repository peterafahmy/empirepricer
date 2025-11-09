import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST add service to itinerary
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
    const {
      type,
      name,
      description,
      date,
      pricingType,
      basePrice,
      quantity,
      taxRate,
      discount,
      supplierCost,
      notes,
      order,
    } = body;

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

    const service = await prisma.service.create({
      data: {
        type,
        name,
        description,
        date: date ? new Date(date) : null,
        pricingType,
        basePrice: parseFloat(basePrice),
        quantity: parseInt(quantity) || 1,
        taxRate: parseFloat(taxRate) || 0,
        discount: parseFloat(discount) || 0,
        supplierCost: supplierCost ? parseFloat(supplierCost) : null,
        notes,
        order: order || 0,
        itineraryId: params.id,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error adding service:', error);
    return NextResponse.json(
      { error: 'Failed to add service' },
      { status: 500 }
    );
  }
}
