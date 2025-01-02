"use client";

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';

interface EditEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  entry: {
    id: string;
    consumed: number;
    burned: number;
    date: Date;
  };
}

const EditEntryDialog = ({ isOpen, onClose, onSuccess, entry }: EditEntryDialogProps) => {
  const [consumed, setConsumed] = useState(entry.consumed.toString());
  const [burned, setBurned] = useState(entry.burned.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setConsumed(entry.consumed.toString());
    setBurned(entry.burned.toString());
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateDoc(doc(db, 'calorieEntries', entry.id), {
        consumed: parseInt(consumed) || 0,
        expended: parseInt(burned) || 0,
      });

      toast.success('Entry updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            Edit Entry
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="consumed" className="block text-sm font-medium text-gray-700 mb-1">
                Calories Consumed
              </label>
              <input
                type="number"
                id="consumed"
                value={consumed}
                onChange={(e) => setConsumed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
                placeholder="Enter calories consumed"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="burned" className="block text-sm font-medium text-gray-700 mb-1">
                Calories Burned
              </label>
              <input
                type="number"
                id="burned"
                value={burned}
                onChange={(e) => setBurned(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
                placeholder="Enter calories burned"
                min="0"
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
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditEntryDialog; 