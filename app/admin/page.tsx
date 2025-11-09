'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Settings, DollarSign } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [pricingRules, setPricingRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPricingRules();
  }, []);

  const fetchPricingRules = async () => {
    try {
      const res = await fetch('/api/pricing-rules');
      if (res.ok) {
        const data = await res.json();
        setPricingRules(data);
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/pricing-rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingRules),
      });

      if (res.ok) {
        alert('Pricing rules updated successfully!');
      }
    } catch (error) {
      console.error('Error updating pricing rules:', error);
      alert('Failed to update pricing rules');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pricingRules) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage pricing rules and templates</p>
            </div>
          </div>
        </div>

        {/* Pricing Rules */}
        <div className="card mb-8">
          <div className="flex items-center mb-6">
            <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Pricing Rules</h2>
          </div>

          <div className="space-y-6">
            {/* Single Supplement */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Single Room Supplement</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Flat Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingRules.singleSupplementFlat}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        singleSupplementFlat: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingRules.singleSupplementPercent}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        singleSupplementPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Applied to rooms with single occupancy (both flat + percentage)
              </p>
            </div>

            {/* Triple Discount */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Triple Room Discount</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Flat Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingRules.tripleDiscountFlat}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        tripleDiscountFlat: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingRules.tripleDiscountPercent}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        tripleDiscountPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Discount applied to triple rooms (both flat + percentage)
              </p>
            </div>

            {/* Child Discount */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Child Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Child Age Limit</label>
                  <input
                    type="number"
                    value={pricingRules.childAgeLimit}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        childAgeLimit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Child Discount (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingRules.childDiscountPercent}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        childDiscountPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Children under the age limit receive the specified discount on per-person pricing
              </p>
            </div>

            {/* Default Tax Rate */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Default Tax Rate</h3>
              <div className="max-w-xs">
                <label className="label">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={pricingRules.defaultTaxRate}
                  onChange={(e) =>
                    setPricingRules({
                      ...pricingRules,
                      defaultTaxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default tax rate applied to new services (can be overridden per service)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Pricing Rules'}
            </button>
          </div>
        </div>

        {/* Templates Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Templates</h2>
          <p className="text-gray-600 mb-6">
            Template management (accommodations, transfers, tours) will be available in a future update.
            For now, templates are seeded in the database and can be accessed via the API.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Quick Guide</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Templates are pre-configured service options</li>
              <li>• Agents can use templates when adding services to itineraries</li>
              <li>• Templates include default pricing, tax rates, and descriptions</li>
              <li>• You can add more templates by seeding the database or via API</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
