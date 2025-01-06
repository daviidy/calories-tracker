'use client';

import { useState } from 'react';
import { useChallenge } from '@/lib/hooks/useChallenge';
import { format, isToday } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import DailyProgress from '@/components/challenges/DailyProgress';
import { use } from 'react';
import { Challenge } from '@/lib/hooks/useChallenges';
import { toast } from 'react-hot-toast';

interface AddEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: { date: Date; value: boolean | number; notes?: string }) => Promise<void>;
  trackingType: 'Checkbox' | 'Numeric';
  frequency: 'Daily' | 'Weekly' | 'Monthly';
}

const AddEntryDialog = ({ isOpen, onClose, onSubmit, trackingType, frequency }: AddEntryDialogProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [value, setValue] = useState(trackingType === 'Checkbox' ? 'true' : '0');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const entryData = {
        date: new Date(date),
        value: trackingType === 'Checkbox' ? value === 'true' : Number(value),
        notes: notes.trim() || undefined
      };

      await onSubmit(entryData);
      onClose();
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Failed to add entry');
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Entry</h2>
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900 placeholder:text-gray-800"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900 placeholder:text-gray-800"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent placeholder:text-gray-800"
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
              {isSubmitting ? 'Adding...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  onSubmit: (data: Partial<Omit<Challenge, 'id' | 'entries'>>) => Promise<void>;
}

const EditChallengeDialog = ({ isOpen, onClose, challenge, onSubmit }: EditChallengeDialogProps) => {
  const [name, setName] = useState(challenge.name);
  const [type, setType] = useState(challenge.type);
  const [startDate, setStartDate] = useState(challenge.startDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(challenge.endDate.toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState(challenge.frequency);
  const [trackingType, setTrackingType] = useState(challenge.trackingType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        frequency,
        trackingType
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Challenge</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900 placeholder:text-gray-800"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as Challenge['type'])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent"
            >
              <option value="Fitness">Fitness</option>
              <option value="Intellectual">Intellectual</option>
              <option value="Spiritual">Spiritual</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Challenge['frequency'])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label htmlFor="trackingType" className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Type
            </label>
            <select
              id="trackingType"
              value={trackingType}
              onChange={(e) => setTrackingType(e.target.value as Challenge['trackingType'])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
            >
              <option value="Checkbox">Checkbox</option>
              <option value="Numeric">Numeric</option>
            </select>
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

const ChallengePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const { challenge, isLoading, error, addEntry, deleteEntry, updateChallenge } = useChallenge(resolvedParams.id);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isEditChallengeOpen, setIsEditChallengeOpen] = useState(false);

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'Fitness':
        return 'bg-green-100 text-green-800';
      case 'Intellectual':
        return 'bg-blue-100 text-blue-800';
      case 'Spiritual':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(entryId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          {error || 'Challenge not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{challenge.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getChallengeTypeColor(challenge.type)}`}>
              {challenge.type}
            </span>
            <span className="text-sm text-gray-500">
              {challenge.frequency} • {challenge.trackingType}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditChallengeOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsAddEntryOpen(true)}
            className="px-4 py-2 bg-[#4d90cc] text-white rounded-lg hover:bg-[#4d90cc]/90 transition-colors"
          >
            Add Entry
          </button>
        </div>
      </div>

      {/* Progress Section */}
      {challenge.frequency === 'Daily' && challenge.trackingType === 'Checkbox' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
          <DailyProgress
            startDate={challenge.startDate}
            endDate={challenge.endDate}
            entries={challenge.entries}
          />
        </div>
      )}

      {/* Entries List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Entries</h2>
        {challenge.entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No entries yet</p>
            <button
              onClick={() => setIsAddEntryOpen(true)}
              className="mt-4 text-[#4d90cc] hover:text-[#4d90cc]/90"
            >
              Add your first entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {challenge.entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {format(entry.date, 'MMMM d, yyyy')}
                    </span>
                    {isToday(entry.date) && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-sm text-gray-500">
                      {challenge.trackingType === 'Checkbox' 
                        ? entry.value 
                          ? '✅ Completed' 
                          : '❌ Not Completed'
                        : `Value: ${entry.value}`
                      }
                    </span>
                    {entry.notes && (
                      <span className="text-sm text-gray-500 ml-2">
                        • {entry.notes}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEntryDialog
        isOpen={isAddEntryOpen}
        onClose={() => setIsAddEntryOpen(false)}
        onSubmit={addEntry}
        trackingType={challenge.trackingType}
        frequency={challenge.frequency}
      />

      <EditChallengeDialog
        isOpen={isEditChallengeOpen}
        onClose={() => setIsEditChallengeOpen(false)}
        challenge={challenge}
        onSubmit={updateChallenge}
      />
    </div>
  );
};

export default ChallengePage; 