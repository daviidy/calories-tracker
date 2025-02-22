"use client";

import { useState, useEffect } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "react-hot-toast";

type EntryType = 'calories' | 'goals' | 'challenges';
type ChallengeType = 'Fitness' | 'Intellectual' | 'Spiritual' | 'Custom';
type ChallengeFrequency = 'Daily' | 'Weekly' | 'Monthly';
type TrackingType = 'Checkbox' | 'Numeric';

interface ChallengeFormData {
  name: string;
  type: ChallengeType;
  startDate: string;
  endDate: string;
  frequency: ChallengeFrequency;
  trackingType: TrackingType;
}

interface QuickEntryFormProps {
  editEntry?: {
    id: string;
    consumed: number;
    expended: number;
    timestamp: Date;
  };
  onClose?: () => void;
  isOpen?: boolean;
  refresh?: () => void;
}

const QuickEntryForm = ({ editEntry, onClose, isOpen: propIsOpen, refresh }: QuickEntryFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<EntryType | null>(null);
  const [consumed, setConsumed] = useState(editEntry?.consumed.toString() || '');
  const [expended, setExpended] = useState(editEntry?.expended.toString() || '');
  const [target, setTarget] = useState('');
  const [entryDate, setEntryDate] = useState(editEntry?.timestamp.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]);
  const [challengeData, setChallengeData] = useState<ChallengeFormData>({
    name: '',
    type: 'Fitness',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    frequency: 'Daily',
    trackingType: 'Checkbox'
  });
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen]);

  useEffect(() => {
    if (editEntry) {
      setIsOpen(true);
      setType('calories');
      setConsumed(editEntry.consumed.toString());
      setExpended(editEntry.expended.toString());
    }
  }, [editEntry]);

  const handleOpenForm = (initialType?: EntryType) => {
    setIsOpen(true);
    setType(initialType || null);
  };

  const handleCloseForm = () => {
    setIsOpen(false);
    setType(null);
    setConsumed('');
    setExpended('');
    setTarget('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setChallengeData({
      name: '',
      type: 'Fitness',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      frequency: 'Daily',
      trackingType: 'Checkbox'
    });
    if (onClose) onClose();
  };

  const handleBackToMenu = () => {
    setType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      const entryData = {
        userId: user.uid,
        consumed: parseInt(consumed) || 0,
        expended: parseInt(expended) || 0,
        timestamp: editEntry?.timestamp || (() => {
          // Create a Firestore timestamp for the selected date at 12:00 PM local time
          const [year, month, day] = entryDate.split('-').map(Number);
          const date = new Date(year, month - 1, day, 12, 0, 0);
          return Timestamp.fromDate(date);
        })(),
      };

      if (editEntry) {
        // Update existing entry
        await updateDoc(doc(db, 'calorieEntries', editEntry.id), entryData);
        toast.success('Entry updated successfully');
      } else {
        // Create new entry
        await addDoc(collection(db, 'calorieEntries'), entryData);
        toast.success('Entry added successfully');
      }

      setIsOpen(false);
      setConsumed('');
      setExpended('');
      if (refresh) refresh();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalorieGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !target) {
      toast.error('Please enter a target value');
      return;
    }

    try {
      setIsSubmitting(true);
      const docRef = await addDoc(collection(db, 'calorieGoals'), {
        userId: user.uid,
        target: parseInt(target),
        timestamp: new Date()
      });

      if (docRef.id) {
        toast.success('Goal updated successfully!');
        // Reset form
        setIsOpen(false);
        setType('calories');
        setTarget('');
      }
    } catch (error) {
      console.error('Error setting goal:', error);
      toast.error('Failed to update goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!challengeData.name.trim()) {
      toast.error('Please enter a challenge name');
      return;
    }

    try {
      setIsSubmitting(true);
      const docRef = await addDoc(collection(db, 'challenges'), {
        userId: user.uid,
        name: challengeData.name,
        type: challengeData.type,
        startDate: new Date(challengeData.startDate),
        endDate: new Date(challengeData.endDate),
        frequency: challengeData.frequency,
        trackingType: challengeData.trackingType,
        createdAt: new Date()
      });

      if (docRef.id) {
        toast.success('Challenge created successfully!');
        // Reset form
        setIsOpen(false);
        setType('calories');
        setChallengeData({
          name: '',
          type: 'Fitness',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          frequency: 'Daily',
          trackingType: 'Checkbox'
        });
        // Refresh challenges list
        if (refresh) {
          refresh();
        }
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Failed to create challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'calories':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                id="entryDate"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
              />
            </div>

            <div>
              <label htmlFor="consumed" className="block text-sm font-medium text-gray-700 mb-1">
                Calories Consumed
              </label>
              <input
                id="consumed"
                type="number"
                min="0"
                placeholder="Enter calories consumed"
                value={consumed}
                onChange={(e) => setConsumed(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
              />
            </div>

            <div>
              <label htmlFor="expended" className="block text-sm font-medium text-gray-700 mb-1">
                Calories Expended
              </label>
              <input
                id="expended"
                type="number"
                min="0"
                placeholder="Enter calories expended"
                value={expended}
                onChange={(e) => setExpended(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white
                ${isSubmitting 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:opacity-90'
                }`}
              style={{ backgroundColor: '#4d90cc' }}
            >
              {isSubmitting ? 'Adding...' : 'Add Entry'}
            </button>
          </form>
        );
      case 'goals':
        return (
          <form onSubmit={handleCalorieGoalSubmit} className="space-y-4">
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                Daily Calorie Target
              </label>
              <input
                id="target"
                type="number"
                min="0"
                required
                placeholder="Enter your daily calorie target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be your new daily calorie target
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white
                ${isSubmitting 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:opacity-90'
                }`}
              style={{ backgroundColor: '#4d90cc' }}
            >
              {isSubmitting ? 'Updating...' : 'Update Goal'}
            </button>
          </form>
        );
      case 'challenges':
        return (
          <form onSubmit={handleChallengeSubmit} className="space-y-4">
            <div>
              <label htmlFor="challengeName" className="block text-sm font-medium text-gray-700 mb-1">
                Challenge Name
              </label>
              <input
                id="challengeName"
                type="text"
                required
                maxLength={100}
                placeholder="Enter challenge name"
                value={challengeData.name}
                onChange={(e) => setChallengeData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
              />
            </div>

            <div>
              <label htmlFor="challengeType" className="block text-sm font-medium text-gray-700 mb-1">
                Challenge Type
              </label>
              <select
                id="challengeType"
                value={challengeData.type}
                onChange={(e) => setChallengeData(prev => ({ ...prev, type: e.target.value as ChallengeType }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
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
                  id="startDate"
                  type="date"
                  required
                  value={challengeData.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                  style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  required
                  value={challengeData.endDate}
                  min={challengeData.startDate}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                  style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
                />
              </div>
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                id="frequency"
                value={challengeData.frequency}
                onChange={(e) => setChallengeData(prev => ({ ...prev, frequency: e.target.value as ChallengeFrequency }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
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
                value={challengeData.trackingType}
                onChange={(e) => setChallengeData(prev => ({ ...prev, trackingType: e.target.value as TrackingType }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#4d90cc] text-gray-900"
                style={{ '--tw-ring-color': '#4d90cc' } as React.CSSProperties}
              >
                <option value="Checkbox">Checkbox (Yes/No)</option>
                <option value="Numeric">Numeric (Value)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white
                ${isSubmitting 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:opacity-90'
                }`}
              style={{ backgroundColor: '#4d90cc' }}
            >
              {isSubmitting ? 'Creating...' : 'Create Challenge'}
            </button>
          </form>
        );
      default:
        return (
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setType('calories')}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <h3 className="font-medium text-gray-900">Calories Entry</h3>
              <p className="text-sm text-gray-500">Log your daily calorie intake and expenditure</p>
            </button>
            <button
              onClick={() => setType('goals')}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <h3 className="font-medium text-gray-900">Calorie Goals</h3>
              <p className="text-sm text-gray-500">Set or update your calorie goals</p>
            </button>
            <button
              onClick={() => setType('challenges')}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <h3 className="font-medium text-gray-900">New Challenge</h3>
              <p className="text-sm text-gray-500">Create a new personal challenge</p>
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <button
        onClick={() => handleOpenForm()}
        className="fixed bottom-6 right-6 text-white rounded-full p-4 shadow-lg transition-colors hover:opacity-90"
        style={{ backgroundColor: '#4d90cc' }}
        aria-label="Add new entry"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {type && (
                  <button
                    onClick={handleBackToMenu}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Back"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h2 className="text-xl font-bold text-gray-900">
                  {type ? `Add ${type.charAt(0).toUpperCase() + type.slice(1)}` : 'Quick Entry'}
                </h2>
              </div>
              <button 
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {type === null ? (
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setType('calories')}
                  className="p-4 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">Calories Entry</h3>
                  <p className="text-sm text-gray-500">Log your daily calorie intake and expenditure</p>
                </button>
                <button
                  onClick={() => setType('goals')}
                  className="p-4 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">Calorie Goals</h3>
                  <p className="text-sm text-gray-500">Set or update your calorie goals</p>
                </button>
                <button
                  onClick={() => setType('challenges')}
                  className="p-4 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">New Challenge</h3>
                  <p className="text-sm text-gray-500">Create a new personal challenge</p>
                </button>
              </div>
            ) : (
              renderForm()
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QuickEntryForm;
