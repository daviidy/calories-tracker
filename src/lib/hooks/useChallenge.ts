import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'react-hot-toast';
import { Challenge } from './useChallenges';

interface ChallengeEntry {
  id: string;
  date: Date;
  value: boolean | number;
  notes?: string;
}

interface FirestoreEntry {
  date: Timestamp;
  value: boolean | number;
  notes: string | null;
}

type FirestoreUpdateData = {
  name?: string;
  type?: Challenge['type'];
  startDate?: Timestamp;
  endDate?: Timestamp;
  frequency?: Challenge['frequency'];
  trackingType?: Challenge['trackingType'];
  updatedAt: Timestamp;
};

interface UseChallengeReturn {
  challenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
  addEntry: (entry: Omit<ChallengeEntry, 'id'>) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  updateEntry: (entryId: string, entry: Partial<Omit<ChallengeEntry, 'id'>>) => Promise<void>;
  updateChallenge: (data: Partial<Omit<Challenge, 'id' | 'entries'>>) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useChallenge = (challengeId: string): UseChallengeReturn => {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = async () => {
    if (!user || !challengeId) return;

    try {
      setIsLoading(true);
      setError(null);

      const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
      
      if (!challengeDoc.exists()) {
        setError('Challenge not found');
        return;
      }

      const data = challengeDoc.data();

      // Fetch entries
      const entriesSnapshot = await getDocs(
        query(
          collection(db, `challenges/${challengeId}/entries`),
          orderBy('date', 'desc')
        )
      );

      const entries = entriesSnapshot.docs.map(doc => ({
        id: doc.id,
        date: doc.data().date.toDate(),
        value: doc.data().value,
        notes: doc.data().notes
      }));

      setChallenge({
        id: challengeDoc.id,
        name: data.name,
        type: data.type,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        frequency: data.frequency,
        trackingType: data.trackingType,
        entries
      });
    } catch (err) {
      console.error('Error fetching challenge:', err);
      setError('Failed to load challenge');
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = async (entry: Omit<ChallengeEntry, 'id'>) => {
    if (!user || !challengeId) return;

    try {
      const entryData: FirestoreEntry = {
        date: Timestamp.fromDate(entry.date),
        value: entry.value,
        notes: entry.notes || null
      };

      await addDoc(collection(db, `challenges/${challengeId}/entries`), entryData);

      toast.success('Entry added successfully');
      await fetchChallenge();
    } catch (err) {
      console.error('Error adding entry:', err);
      toast.error('Failed to add entry');
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!user || !challengeId) return;

    try {
      await deleteDoc(doc(db, `challenges/${challengeId}/entries`, entryId));
      toast.success('Entry deleted successfully');
      await fetchChallenge();
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('Failed to delete entry');
    }
  };

  const updateEntry = async (entryId: string, entry: Partial<Omit<ChallengeEntry, 'id'>>) => {
    if (!user || !challengeId) return;

    try {
      const updateData: Partial<FirestoreEntry> = {
        value: entry.value,
        notes: entry.notes || null
      };

      if (entry.date) {
        updateData.date = Timestamp.fromDate(entry.date);
      }

      await updateDoc(doc(db, `challenges/${challengeId}/entries`, entryId), updateData);

      toast.success('Entry updated successfully');
      await fetchChallenge();
    } catch (err) {
      console.error('Error updating entry:', err);
      toast.error('Failed to update entry');
    }
  };

  const updateChallenge = async (data: Partial<Omit<Challenge, 'id' | 'entries'>>) => {
    if (!user || !challengeId) return;

    try {
      const updateData: FirestoreUpdateData = {
        name: data.name,
        type: data.type,
        frequency: data.frequency,
        trackingType: data.trackingType,
        updatedAt: Timestamp.now()
      };

      if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = Timestamp.fromDate(data.endDate);
      }

      await updateDoc(doc(db, 'challenges', challengeId), updateData);

      toast.success('Challenge updated successfully');
      await fetchChallenge();
    } catch (err) {
      console.error('Error updating challenge:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update challenge');
    }
  };

  useEffect(() => {
    if (user && challengeId) {
      fetchChallenge();
    }
  }, [user, challengeId]);

  return {
    challenge,
    isLoading,
    error,
    addEntry,
    deleteEntry,
    updateEntry,
    updateChallenge,
    refresh: fetchChallenge
  };
}; 