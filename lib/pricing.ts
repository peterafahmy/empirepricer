import { PricingType, RoomType } from '@prisma/client';

export interface TravelerData {
  id: string;
  name: string;
  age?: number | null;
  roomType: RoomType;
  roomNumber: number;
  isSingleOccupancy: boolean;
}

export interface ServiceData {
  id: string;
  type: string;
  name: string;
  pricingType: PricingType;
  basePrice: number;
  quantity: number;
  taxRate: number;
  discount: number;
  supplierCost?: number | null;
}

export interface PricingRuleData {
  singleSupplementFlat: number;
  singleSupplementPercent: number;
  tripleDiscountFlat: number;
  tripleDiscountPercent: number;
  childDiscountPercent: number;
  childAgeLimit: number;
  defaultTaxRate: number;
}

export interface PricingBreakdown {
  subtotal: number;
  taxes: number;
  discounts: number;
  supplements: number;
  total: number;
  perPerson: number;
  serviceBreakdowns: ServiceBreakdown[];
}

export interface ServiceBreakdown {
  serviceId: string;
  serviceName: string;
  baseAmount: number;
  taxAmount: number;
  discountAmount: number;
  supplementAmount: number;
  total: number;
  details: string;
}

export class PricingEngine {
  private travelers: TravelerData[];
  private services: ServiceData[];
  private pricingRules: PricingRuleData;

  constructor(
    travelers: TravelerData[],
    services: ServiceData[],
    pricingRules: PricingRuleData
  ) {
    this.travelers = travelers;
    this.services = services;
    this.pricingRules = pricingRules;
  }

  /**
   * Calculate total pricing breakdown for the itinerary
   */
  calculateTotal(): PricingBreakdown {
    const serviceBreakdowns: ServiceBreakdown[] = [];
    let totalSubtotal = 0;
    let totalTaxes = 0;
    let totalDiscounts = 0;
    let totalSupplements = 0;

    // Calculate each service
    for (const service of this.services) {
      const breakdown = this.calculateService(service);
      serviceBreakdowns.push(breakdown);

      totalSubtotal += breakdown.baseAmount;
      totalTaxes += breakdown.taxAmount;
      totalDiscounts += breakdown.discountAmount;
      totalSupplements += breakdown.supplementAmount;
    }

    const total = totalSubtotal + totalTaxes + totalSupplements - totalDiscounts;
    const travelerCount = this.travelers.length;
    const perPerson = travelerCount > 0 ? total / travelerCount : 0;

    return {
      subtotal: totalSubtotal,
      taxes: totalTaxes,
      discounts: totalDiscounts,
      supplements: totalSupplements,
      total,
      perPerson,
      serviceBreakdowns,
    };
  }

  /**
   * Calculate pricing for a single service
   */
  private calculateService(service: ServiceData): ServiceBreakdown {
    let baseAmount = 0;
    let supplementAmount = 0;
    let discountAmount = 0;
    let details = '';

    const travelerCount = this.travelers.length;
    const adults = this.travelers.filter(
      (t) => !t.age || t.age >= this.pricingRules.childAgeLimit
    );
    const children = this.travelers.filter(
      (t) => t.age && t.age < this.pricingRules.childAgeLimit
    );

    // Calculate base amount based on pricing type
    switch (service.pricingType) {
      case PricingType.PER_PERSON:
        baseAmount = service.basePrice * travelerCount * service.quantity;
        details = `${service.basePrice} × ${travelerCount} travelers × ${service.quantity}`;

        // Apply child discounts for per-person pricing
        if (children.length > 0) {
          const childDiscount =
            (service.basePrice *
              children.length *
              service.quantity *
              this.pricingRules.childDiscountPercent) /
            100;
          discountAmount += childDiscount;
          details += ` (${children.length} children get ${this.pricingRules.childDiscountPercent}% off)`;
        }
        break;

      case PricingType.PER_ROOM:
        const rooms = this.getRoomBreakdown();
        baseAmount = service.basePrice * rooms.length * service.quantity;
        details = `${service.basePrice} × ${rooms.length} rooms × ${service.quantity}`;

        // Apply single supplements and triple discounts
        rooms.forEach((room) => {
          if (room.type === RoomType.SINGLE || room.isSingleOccupancy) {
            const supplement =
              this.pricingRules.singleSupplementFlat +
              (service.basePrice * this.pricingRules.singleSupplementPercent) / 100;
            supplementAmount += supplement * service.quantity;
          } else if (room.type === RoomType.TRIPLE) {
            const discount =
              this.pricingRules.tripleDiscountFlat +
              (service.basePrice * this.pricingRules.tripleDiscountPercent) / 100;
            discountAmount += discount * service.quantity;
          }
        });
        break;

      case PricingType.PER_GROUP:
        baseAmount = service.basePrice * service.quantity;
        details = `${service.basePrice} × ${service.quantity}`;
        break;
    }

    // Apply service-specific discount
    if (service.discount > 0) {
      const serviceDiscount = (baseAmount * service.discount) / 100;
      discountAmount += serviceDiscount;
      details += ` (${service.discount}% discount)`;
    }

    // Calculate tax
    const taxableAmount = baseAmount + supplementAmount - discountAmount;
    const taxAmount = (taxableAmount * service.taxRate) / 100;

    const total = baseAmount + supplementAmount + taxAmount - discountAmount;

    return {
      serviceId: service.id,
      serviceName: service.name,
      baseAmount,
      taxAmount,
      discountAmount,
      supplementAmount,
      total,
      details,
    };
  }

  /**
   * Get room breakdown from travelers
   */
  private getRoomBreakdown(): Array<{
    roomNumber: number;
    type: RoomType;
    travelers: TravelerData[];
    isSingleOccupancy: boolean;
  }> {
    const roomMap = new Map<number, TravelerData[]>();

    // Group travelers by room number
    this.travelers.forEach((traveler) => {
      const roomTravelers = roomMap.get(traveler.roomNumber) || [];
      roomTravelers.push(traveler);
      roomMap.set(traveler.roomNumber, roomTravelers);
    });

    // Create room breakdown
    const rooms: Array<{
      roomNumber: number;
      type: RoomType;
      travelers: TravelerData[];
      isSingleOccupancy: boolean;
    }> = [];

    roomMap.forEach((travelers, roomNumber) => {
      const isSingleOccupancy = travelers.some((t) => t.isSingleOccupancy);
      const roomType = travelers[0]?.roomType || RoomType.DOUBLE;

      rooms.push({
        roomNumber,
        type: roomType,
        travelers,
        isSingleOccupancy,
      });
    });

    return rooms;
  }

  /**
   * Get room summary for display
   */
  getRoomSummary(): string {
    const rooms = this.getRoomBreakdown();
    const summary = rooms.map((room) => {
      const occupancy = room.travelers.length;
      const type = room.type.toLowerCase();
      return `${occupancy}× ${type}`;
    });
    return summary.join(', ');
  }
}

/**
 * Helper function to create pricing engine instance
 */
export function createPricingEngine(
  travelers: TravelerData[],
  services: ServiceData[],
  pricingRules: PricingRuleData
): PricingEngine {
  return new PricingEngine(travelers, services, pricingRules);
}
