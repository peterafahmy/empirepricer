'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TravelerManager from '@/components/TravelerManager';
import ServiceManager from '@/components/ServiceManager';
import PricingSummary from '@/components/PricingSummary';
import { Save, FileDown } from 'lucide-react';
import { generateItineraryPDF } from '@/lib/pdf-generator';

interface Itinerary {
  id: string;
  title: string;
  customerName: string;
  startDate: string;
  endDate: string;
  currency: string;
  notes?: string;
  termsConditions?: string;
  travelers: any[];
  services: any[];
}

export default function ItineraryEditPage() {
  const router = useRouter();
  const params = useParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItinerary();
  }, []);

  const fetchItinerary = async () => {
    try {
      const res = await fetch(`/api/itineraries/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setItinerary(data);
      } else if (res.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItinerary = async (updates: Partial<Itinerary>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/itineraries/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated = await res.json();
        setItinerary(updated);
      }
    } catch (error) {
      console.error('Error updating itinerary:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!itinerary) return;

    try {
      // Fetch pricing rules
      const pricingRes = await fetch('/api/pricing-rules');
      const pricingRules = await pricingRes.json();

      await generateItineraryPDF(itinerary, pricingRules);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
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

  if (!itinerary) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{itinerary.title}</h1>
              <p className="text-gray-600 mt-1">{itinerary.customerName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGeneratePDF}
                className="btn btn-secondary flex items-center"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={itinerary.title}
                  onChange={(e) => handleUpdateItinerary({ title: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Customer Name</label>
                <input
                  type="text"
                  value={itinerary.customerName}
                  onChange={(e) => handleUpdateItinerary({ customerName: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Currency</label>
                <select
                  value={itinerary.currency}
                  onChange={(e) => handleUpdateItinerary({ currency: e.target.value })}
                  className="input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Travelers & Services */}
          <div className="lg:col-span-2 space-y-8">
            <TravelerManager
              itineraryId={itinerary.id}
              travelers={itinerary.travelers}
              onUpdate={fetchItinerary}
            />

            <ServiceManager
              itineraryId={itinerary.id}
              services={itinerary.services}
              onUpdate={fetchItinerary}
            />
          </div>

          {/* Right Column - Pricing Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PricingSummary
                travelers={itinerary.travelers}
                services={itinerary.services}
                currency={itinerary.currency}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
