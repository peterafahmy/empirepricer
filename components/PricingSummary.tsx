'use client';

import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createPricingEngine } from '@/lib/pricing';

interface PricingSummaryProps {
  travelers: any[];
  services: any[];
  currency: string;
}

export default function PricingSummary({ travelers, services, currency }: PricingSummaryProps) {
  const [breakdown, setBreakdown] = useState<any>(null);
  const [pricingRules, setPricingRules] = useState<any>(null);

  useEffect(() => {
    fetchPricingRules();
  }, []);

  useEffect(() => {
    if (pricingRules) {
      calculatePricing();
    }
  }, [travelers, services, pricingRules]);

  const fetchPricingRules = async () => {
    try {
      const res = await fetch('/api/pricing-rules');
      if (res.ok) {
        const rules = await res.json();
        setPricingRules(rules);
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    }
  };

  const calculatePricing = () => {
    if (!pricingRules) return;

    const engine = createPricingEngine(travelers, services, pricingRules);
    const result = engine.calculateTotal();
    setBreakdown(result);
  };

  if (!breakdown) {
    return (
      <div className="card">
        <div className="flex items-center mb-4">
          <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Pricing Summary</h2>
        </div>
        <p className="text-gray-500 text-center py-8">Loading...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Pricing Summary</h2>
      </div>

      <div className="space-y-4">
        {/* Total */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="text-sm text-gray-600 mb-1">Total Price</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(breakdown.total, currency)}
          </div>
          {travelers.length > 0 && (
            <div className="text-sm text-gray-600 mt-2">
              {formatCurrency(breakdown.perPerson, currency)} per person
              <span className="text-gray-500"> ({travelers.length} travelers)</span>
            </div>
          )}
        </div>

        {/* Breakdown */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(breakdown.subtotal, currency)}
            </span>
          </div>

          {breakdown.supplements > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Supplements</span>
              <span className="font-medium text-orange-600">
                +{formatCurrency(breakdown.supplements, currency)}
              </span>
            </div>
          )}

          {breakdown.discounts > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discounts</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(breakdown.discounts, currency)}
              </span>
            </div>
          )}

          {breakdown.taxes > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(breakdown.taxes, currency)}
              </span>
            </div>
          )}
        </div>

        {/* Service Breakdown */}
        {breakdown.serviceBreakdowns && breakdown.serviceBreakdowns.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Service Details</h3>
            <div className="space-y-3">
              {breakdown.serviceBreakdowns.map((service: any) => (
                <div key={service.serviceId} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-900">{service.serviceName}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(service.total, currency)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{service.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
