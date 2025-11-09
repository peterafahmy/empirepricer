import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET pricing rules (get default)
export async function GET() {
  try {
    const defaultRule = await prisma.pricingRule.findFirst({
      where: { isDefault: true },
    });

    if (!defaultRule) {
      // Return sensible defaults if none exist
      return NextResponse.json({
        singleSupplementFlat: 50,
        singleSupplementPercent: 30,
        tripleDiscountFlat: 0,
        tripleDiscountPercent: 15,
        childDiscountPercent: 25,
        childAgeLimit: 12,
        defaultTaxRate: 10,
      });
    }

    return NextResponse.json(defaultRule);
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing rules' },
      { status: 500 }
    );
  }
}

// PATCH update pricing rules (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const defaultRule = await prisma.pricingRule.findFirst({
      where: { isDefault: true },
    });

    if (!defaultRule) {
      // Create if doesn't exist
      const newRule = await prisma.pricingRule.create({
        data: {
          ...body,
          name: 'Default Pricing Rules',
          isDefault: true,
        },
      });
      return NextResponse.json(newRule);
    }

    const updated = await prisma.pricingRule.update({
      where: { id: defaultRule.id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating pricing rules:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing rules' },
      { status: 500 }
    );
  }
}
