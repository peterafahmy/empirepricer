'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { RoomType } from '@prisma/client';

interface Traveler {
  id: string;
  name: string;
  age?: number | null;
  roomType: RoomType;
  roomNumber: number;
  isSingleOccupancy: boolean;
}

interface TravelerManagerProps {
  itineraryId: string;
  travelers: Traveler[];
  onUpdate: () => void;
}

export default function TravelerManager({ itineraryId, travelers, onUpdate }: TravelerManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    roomType: 'DOUBLE' as RoomType,
    roomNumber: 1,
    isSingleOccupancy: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      roomType: 'DOUBLE' as RoomType,
      roomNumber: 1,
      isSingleOccupancy: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    try {
      const res = await fetch(`/api/itineraries/${itineraryId}/travelers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
        }),
      });

      if (res.ok) {
        resetForm();
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding traveler:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/travelers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
        }),
      });

      if (res.ok) {
        resetForm();
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating traveler:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this traveler?')) return;

    try {
      const res = await fetch(`/api/travelers/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting traveler:', error);
    }
  };

  const startEdit = (traveler: Traveler) => {
    setFormData({
      name: traveler.name,
      age: traveler.age?.toString() || '',
      roomType: traveler.roomType,
      roomNumber: traveler.roomNumber,
      isSingleOccupancy: traveler.isSingleOccupancy,
    });
    setEditingId(traveler.id);
    setIsAdding(false);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Travelers</h2>
          <span className="ml-2 text-sm text-gray-500">({travelers.length})</span>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn btn-primary text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Traveler
          </button>
        )}
      </div>

      {/* Traveler Form */}
      {(isAdding || editingId) && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Traveler' : 'Add Traveler'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="label">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="label">Room Type *</label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
                className="input"
              >
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="TWIN">Twin</option>
                <option value="TRIPLE">Triple</option>
                <option value="FAMILY">Family</option>
              </select>
            </div>
            <div>
              <label className="label">Room Number *</label>
              <input
                type="number"
                min="1"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: parseInt(e.target.value) })}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isSingleOccupancy}
                  onChange={(e) => setFormData({ ...formData, isSingleOccupancy: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Single Occupancy (applies supplement)</span>
              </label>
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

      {/* Travelers List */}
      {travelers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No travelers added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {travelers.map((traveler) => (
            <div
              key={traveler.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{traveler.name}</span>
                  {traveler.age && (
                    <span className="text-sm text-gray-600">({traveler.age} years)</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Room {traveler.roomNumber} - {traveler.roomType.toLowerCase()}
                  {traveler.isSingleOccupancy && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      Single occupancy
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(traveler)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(traveler.id)}
                  className="text-red-600 hover:text-red-800 p-1"
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
  );
}
