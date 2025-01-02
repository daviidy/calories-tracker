'use client';

import { useMemo } from 'react';
import { isSameDay, isYesterday, startOfDay, parseISO } from 'date-fns';

interface StreakData {
  calorieStreak: number;
  challengeStreak: number;
}

export const useStreakData = (
  calorieEntries: Array<{ date: Date }>,
  challengeEntries: Array<{ date: Date }>
): StreakData => {
  return useMemo(() => {
    // Ensure we're using the same date reference on both server and client
    const now = new Date();
    const today = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

    // Calculate calorie streak
    let calorieStreak = 0;
    let currentDate = today;
    let hasEntryToday = false;

    // Check if there's an entry today
    hasEntryToday = calorieEntries.some(entry => {
      const entryDate = entry.date instanceof Date ? entry.date : parseISO(entry.date as unknown as string);
      return isSameDay(entryDate, today);
    });

    if (!hasEntryToday) {
      // If no entry today, check if there was one yesterday to continue the streak
      const hadEntryYesterday = calorieEntries.some(entry => {
        const entryDate = entry.date instanceof Date ? entry.date : parseISO(entry.date as unknown as string);
        return isYesterday(entryDate);
      });
      if (!hadEntryYesterday) {
        return { calorieStreak: 0, challengeStreak: 0 };
      }
      currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Count consecutive days
    while (true) {
      const hasEntry = calorieEntries.some(entry => {
        const entryDate = entry.date instanceof Date ? entry.date : parseISO(entry.date as unknown as string);
        return isSameDay(entryDate, currentDate);
      });
      if (!hasEntry) break;
      calorieStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Calculate challenge streak
    let challengeStreak = 0;
    currentDate = today;
    hasEntryToday = false;

    // Check if there's an entry today
    hasEntryToday = challengeEntries.some(entry => {
      const entryDate = entry.date instanceof Date ? entry.date : parseISO(entry.date as unknown as string);
      return isSameDay(entryDate, today);
    });

    if (!hasEntryToday) {
      // If no entry today, check if there was one yesterday to continue the streak
      const hadEntryYesterday = challengeEntries.some(entry => {
        const entryDate = entry.date instanceof Date ? entry.date : parseISO(entry.date as unknown as string);
        return isYesterday(entryDate);
      });
      if (!hadEntryYesterday) {
        return { calorieStreak, challengeStreak: 0 };
      }
      currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Count consecutive days
    while (true) {
      const hasEntry = challengeEntries.some(entry => {
        const entryDate = entry.date instanceof Date ? entry.date : parseISO(entry.date as unknown as string);
        return isSameDay(entryDate, currentDate);
      });
      if (!hasEntry) break;
      challengeStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return { calorieStreak, challengeStreak };
  }, [calorieEntries, challengeEntries]);
}; 