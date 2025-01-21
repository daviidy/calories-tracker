'use client';

import { useState } from 'react';
import { useChallenges, Challenge } from '@/lib/hooks/useChallenges';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import QuickEntryForm from '@/components/dashboard/QuickEntryForm';
import { EditChallengeDialog } from '@/components/challenges/EditChallengeDialog';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const ChallengesPage = () => {
  const { challenges, isLoading, error, deleteChallenge, refresh } = useChallenges();
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isEditChallengeOpen, setIsEditChallengeOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [deleteChallengeId, setDeleteChallengeId] = useState<string | null>(null);

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

  const handleDelete = async (challengeId: string) => {
    setDeleteChallengeId(challengeId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteChallengeId) return;

    try {
      await deleteChallenge(deleteChallengeId);
      toast.success('Challenge deleted successfully');
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Failed to delete challenge');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Challenges</h1>
        <button
          onClick={() => setIsQuickEntryOpen(true)}
          className="px-4 py-2 bg-[#4d90cc] text-white rounded-lg hover:bg-[#4d90cc]/90 transition-colors"
        >
          New Challenge
        </button>
      </div>

      {/* Challenges List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500">No challenges found</p>
          <button
            onClick={() => setIsQuickEntryOpen(true)}
            className="mt-4 text-[#4d90cc] hover:text-[#4d90cc]/90"
          >
            Create your first challenge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link 
                    href={`/challenges/${challenge.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-[#4d90cc]"
                  >
                    {challenge.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
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
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      setIsEditChallengeOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(challenge.id)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-gray-900">
                    {format(challenge.startDate, 'MMM d, yyyy')} - {format(challenge.endDate, 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Entries</span>
                  <span className="text-gray-900">{challenge.entries.length}</span>
                </div>
                <Link
                  href={`/challenges/${challenge.id}`}
                  className="block w-full py-2 text-center text-[#4d90cc] hover:text-[#4d90cc]/90 border border-[#4d90cc] rounded-lg hover:bg-[#4d90cc]/5 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <QuickEntryForm 
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        refresh={refresh}
      />

      {selectedChallenge && (
        <EditChallengeDialog
          isOpen={isEditChallengeOpen}
          onClose={() => {
            setIsEditChallengeOpen(false);
            setSelectedChallenge(null);
          }}
          challenge={selectedChallenge}
          onSubmit={async (data: Partial<Omit<Challenge, 'id' | 'entries'>>) => {
            try {
              await updateDoc(doc(db, 'challenges', selectedChallenge.id), {
                ...data,
                updatedAt: new Date()
              });
              toast.success('Challenge updated successfully');
              refresh();
              setIsEditChallengeOpen(false);
              setSelectedChallenge(null);
            } catch (err) {
              console.error('Error updating challenge:', err);
              toast.error('Failed to update challenge');
            }
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteChallengeId}
        onClose={() => setDeleteChallengeId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Challenge"
        message="Are you sure you want to delete this challenge? This action cannot be undone."
      />
    </div>
  );
};

export default ChallengesPage; 