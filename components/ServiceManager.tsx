'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';
import { ServiceType, PricingType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Service {
  id: string;
  type: ServiceType;
  name: string;
  description?: string | null;
  date?: string | null;
  pricingType: PricingType;
  basePrice: number;
  quantity: number;
  taxRate: number;
  discount: number;
  supplierCost?: number | null;
  notes?: string | null;
  order: number;
}

interface ServiceManagerProps {
  itineraryId: string;
  services: Service[];
  onUpdate: () => void;
}

export default function ServiceManager({ itineraryId, services, onUpdate }: ServiceManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'ACCOMMODATION' as ServiceType,
    name: '',
    description: '',
    date: '',
    pricingType: 'PER_PERSON' as PricingType,
    basePrice: '',
    quantity: '1',
    taxRate: '10',
    discount: '0',
    supplierCost: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      type: 'ACCOMMODATION' as ServiceType,
      name: '',
      description: '',
      date: '',
      pricingType: 'PER_PERSON' as PricingType,
      basePrice: '',
      quantity: '1',
      taxRate: '10',
      discount: '0',
      supplierCost: '',
      notes: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    try {
      const res = await fetch(`/api/itineraries/${itineraryId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          basePrice: parseFloat(formData.basePrice),
          quantity: parseInt(formData.quantity),
          taxRate: parseFloat(formData.taxRate),
          discount: parseFloat(formData.discount),
          supplierCost: formData.supplierCost ? parseFloat(formData.supplierCost) : null,
          date: formData.date || null,
        }),
      });

      if (res.ok) {
        resetForm();
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          basePrice: parseFloat(formData.basePrice),
          quantity: parseInt(formData.quantity),
          taxRate: parseFloat(formData.taxRate),
          discount: parseFloat(formData.discount),
          supplierCost: formData.supplierCost ? parseFloat(formData.supplierCost) : null,
          date: formData.date || null,
        }),
      });

      if (res.ok) {
        resetForm();
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this service?')) return;

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const startEdit = (service: Service) => {
    setFormData({
      type: service.type,
      name: service.name,
      description: service.description || '',
      date: service.date ? service.date.split('T')[0] : '',
      pricingType: service.pricingType,
      basePrice: service.basePrice.toString(),
      quantity: service.quantity.toString(),
      taxRate: service.taxRate.toString(),
      discount: service.discount.toString(),
      supplierCost: service.supplierCost?.toString() || '',
      notes: service.notes || '',
    });
    setEditingId(service.id);
    setIsAdding(false);
  };

  const servicesByType = {
    ACCOMMODATION: services.filter(s => s.type === 'ACCOMMODATION'),
    TRANSFER: services.filter(s => s.type === 'TRANSFER'),
    TOUR: services.filter(s => s.type === 'TOUR'),
    MISCELLANEOUS: services.filter(s => s.type === 'MISCELLANEOUS'),
  };

  const getServiceIcon = (type: ServiceType) => {
    const icons = {
      ACCOMMODATION: '🏨',
      TRANSFER: '🚗',
      TOUR: '🎯',
      MISCELLANEOUS: '📋',
    };
    return icons[type];
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Briefcase className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Services</h2>
          <span className="ml-2 text-sm text-gray-500">({services.length})</span>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn btn-primary text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </button>
        )}
      </div>

      {/* Service Form */}
      {(isAdding || editingId) && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Service' : 'Add Service'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Service Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceType })}
                className="input"
              >
                <option value="ACCOMMODATION">Accommodation</option>
                <option value="TRANSFER">Transfer</option>
                <option value="TOUR">Tour</option>
                <option value="MISCELLANEOUS">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Service name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={2}
                placeholder="Service details..."
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Pricing Type *</label>
              <select
                value={formData.pricingType}
                onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as PricingType })}
                className="input"
              >
                <option value="PER_PERSON">Per Person</option>
                <option value="PER_ROOM">Per Room</option>
                <option value="PER_GROUP">Per Group</option>
              </select>
            </div>
            <div>
              <label className="label">Base Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Discount (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Supplier Cost (optional, hidden from client)</label>
              <input
                type="number"
                step="0.01"
                value={formData.supplierCost}
                onChange={(e) => setFormData({ ...formData, supplierCost: e.target.value })}
                className="input"
                placeholder="Internal cost tracking"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
              className="btn btn-primary text-sm"
            >
              {editingId ? 'Update' : 'Add'}
            </button>
            <button
              onClick={resetForm}
              className="btn btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No services added yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(servicesByType).map(([type, typeServices]) => {
            if (typeServices.length === 0) return null;
            return (
              <div key={type}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">{getServiceIcon(type as ServiceType)}</span>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </h3>
                <div className="space-y-2">
                  {typeServices.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{service.name}</div>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                            <span className="font-medium">
                              {formatCurrency(service.basePrice)}
                            </span>
                            <span>•</span>
                            <span>{service.pricingType.replace('_', ' ').toLowerCase()}</span>
                            {service.quantity > 1 && (
                              <>
                                <span>•</span>
                                <span>Qty: {service.quantity}</span>
                              </>
                            )}
                            {service.taxRate > 0 && (
                              <>
                                <span>•</span>
                                <span>Tax: {service.taxRate}%</span>
                              </>
                            )}
                            {service.discount > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">Discount: {service.discount}%</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEdit(service)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
