import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface EditEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: { date: Date; value: boolean | number; notes?: string }) => Promise<void>;
  entry: {
    date: Date;
    value: boolean | number;
    notes?: string;
  };
  trackingType: 'Checkbox' | 'Numeric';
  frequency: 'Daily' | 'Weekly' | 'Monthly';
}

const EditEntryDialog = ({ isOpen, onClose, onSubmit, entry, trackingType, frequency }: EditEntryDialogProps) => {
  const [date, setDate] = useState(entry.date.toISOString().split('T')[0]);
  const [value, setValue] = useState(trackingType === 'Checkbox' ? entry.value.toString() : entry.value.toString());
  const [notes, setNotes] = useState(entry.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const [year, month, day] = date.split('-').map(Number);
      const entryDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

      const entryData = {
        date: entryDate,
        value: trackingType === 'Checkbox' ? value === 'true' : Number(value),
        notes: notes.trim() || undefined
      };

      await onSubmit(entryData);
      onClose();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getDateLabel = () => {
    switch (frequency) {
      case 'Weekly':
        return 'Week Starting';
      case 'Monthly':
        return 'Month';
      default:
        return 'Date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              {getDateLabel()}
            </label>
            <input
              type={frequency === 'Monthly' ? 'month' : 'date'}
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
              {trackingType === 'Checkbox' ? 'Completed?' : 'Value'}
            </label>
            {trackingType === 'Checkbox' ? (
              <select
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : (
              <input
                type="number"
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
                min="0"
                required
              />
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent"
              rows={3}
              placeholder="Add any notes here..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4d90cc] text-white rounded-lg hover:bg-[#4d90cc]/90 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEntryDialog; 