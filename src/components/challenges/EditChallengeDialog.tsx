import { useState, useEffect } from 'react';
import { Challenge } from '@/lib/hooks/useChallenges';
import { toast } from 'react-hot-toast';

interface EditChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  onSubmit: (data: Partial<Omit<Challenge, 'id' | 'entries'>>) => Promise<void>;
}

export const EditChallengeDialog = ({ isOpen, onClose, challenge, onSubmit }: EditChallengeDialogProps) => {
  const [name, setName] = useState<string>(challenge.name);
  const [type, setType] = useState<"Fitness" | "Intellectual" | "Spiritual" | "Custom">(challenge.type);
  const [startDate, setStartDate] = useState(challenge.startDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(challenge.endDate.toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState<"Daily" | "Weekly" | "Monthly">(challenge.frequency);
  const [trackingType, setTrackingType] = useState<"Checkbox" | "Numeric">(challenge.trackingType || "Checkbox");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when challenge changes
  useEffect(() => {
    setName(challenge.name);
    setType(challenge.type);
    setStartDate(challenge.startDate.toISOString().split('T')[0]);
    setEndDate(challenge.endDate.toISOString().split('T')[0]);
    setFrequency(challenge.frequency);
    setTrackingType(challenge.trackingType || "Checkbox");
  }, [challenge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        name: name.trim(),
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        frequency,
        trackingType: trackingType as "Checkbox" | "Numeric" // Ensure proper type
      };

      console.log('Submitting data:', updateData); // Debug log
      await onSubmit(updateData);
      onClose();
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update challenge');
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
              placeholder="Enter challenge name"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
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