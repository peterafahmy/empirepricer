import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH update service
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

    // Check ownership through itinerary
    const existing = await prisma.service.findUnique({
      where: { id: params.id },
      include: { itinerary: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (existing.itinerary.agentId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...body,
        basePrice: body.basePrice !== undefined ? parseFloat(body.basePrice) : undefined,
        quantity: body.quantity !== undefined ? parseInt(body.quantity) : undefined,
        taxRate: body.taxRate !== undefined ? parseFloat(body.taxRate) : undefined,
        discount: body.discount !== undefined ? parseFloat(body.discount) : undefined,
        supplierCost: body.supplierCost !== undefined ? parseFloat(body.supplierCost) : undefined,
        date: body.date ? new Date(body.date) : undefined,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE service
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
    const existing = await prisma.service.findUnique({
      where: { id: params.id },
      include: { itinerary: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (existing.itinerary.agentId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.service.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
