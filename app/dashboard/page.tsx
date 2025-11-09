'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Plus, Edit, Trash2, Copy, FileText } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Itinerary {
  id: string;
  title: string;
  customerName: string;
  startDate: string;
  endDate: string;
  currency: string;
  travelers: any[];
  services: any[];
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const res = await fetch('/api/itineraries');
      if (res.ok) {
        const data = await res.json();
        setItineraries(data);
      }
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return;

    try {
      const res = await fetch(`/api/itineraries/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchItineraries();
      }
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/itineraries/${id}/duplicate`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchItineraries();
      }
    } catch (error) {
      console.error('Error duplicating itinerary:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Itineraries</h1>
            <p className="text-gray-600 mt-1">
              Manage your travel itineraries and pricing
            </p>
          </div>
          <button
            onClick={() => router.push('/itineraries/new')}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Itinerary
          </button>
        </div>

        {itineraries.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No itineraries yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first itinerary
            </p>
            <button
              onClick={() => router.push('/itineraries/new')}
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Itinerary
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {itineraries.map((itinerary) => (
              <div key={itinerary.id} className="card hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {itinerary.title}
                  </h3>
                  <p className="text-sm text-gray-600">{itinerary.customerName}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Dates:</span>{' '}
                    {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                  </p>
                  <p>
                    <span className="font-medium">Travelers:</span>{' '}
                    {itinerary.travelers.length}
                  </p>
                  <p>
                    <span className="font-medium">Services:</span>{' '}
                    {itinerary.services.length}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push(`/itineraries/${itinerary.id}`)}
                    className="flex-1 btn btn-primary text-sm flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(itinerary.id)}
                    className="btn btn-secondary text-sm"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(itinerary.id)}
                    className="btn btn-danger text-sm"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
