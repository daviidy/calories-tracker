import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'react-hot-toast';

export interface Challenge {
  id: string;
  name: string;
  type: 'Fitness' | 'Intellectual' | 'Spiritual' | 'Custom';
  startDate: Date;
  endDate: Date;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  trackingType: 'Checkbox' | 'Numeric';
  entries: Array<{
    id: string;
    date: Date;
    value: boolean | number;
    notes?: string;
  }>;
}

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const challengesQuery = query(
        collection(db, 'challenges'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(challengesQuery);
      const challengesData = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Fetch entries for this challenge
        const entriesSnapshot = await getDocs(
          query(
            collection(db, `challenges/${doc.id}/entries`),
            orderBy('date', 'desc')
          )
        );

        const entries = entriesSnapshot.docs.map(entryDoc => ({
          id: entryDoc.id,
          date: entryDoc.data().date.toDate(),
          value: entryDoc.data().value,
          notes: entryDoc.data().notes
        }));

        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          frequency: data.frequency,
          trackingType: data.trackingType,
          entries
        };
      }));

      setChallenges(challengesData);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'challenges', challengeId));
      toast.success('Challenge deleted successfully');
      // Refresh challenges list
      fetchChallenges();
    } catch (err) {
      console.error('Error deleting challenge:', err);
      toast.error('Failed to delete challenge');
    }
  };

  useEffect(() => {
    if (user) {
      fetchChallenges();
    } else {
      setChallenges([]);
      setIsLoading(false);
    }
  }, [user]);

  return {
    challenges,
    isLoading,
    error,
    refresh: fetchChallenges,
    deleteChallenge
  };
}; 