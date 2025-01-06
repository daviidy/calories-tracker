'use client';

import QuickEntryForm from '@/components/dashboard/QuickEntryForm';
import { useCalorieData } from '@/lib/hooks/useCalorieData';
import { useActiveChallenges } from '@/lib/hooks/useActiveChallenges';
import DailyProgress from '@/components/challenges/DailyProgress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { useState } from 'react';

const DashboardPage = () => {
  const { summary, isLoading: isLoadingCalories, error: caloriesError } = useCalorieData();
  const { challenges, isLoading: isLoadingChallenges, error: challengesError } = useActiveChallenges();
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  // Helper function to calculate safe percentage
  const calculateSafePercentage = (value: number, max: number) => {
    return Math.min(Math.max((value / max) * 100, 0), 100);
  };

  // Helper function to get challenge type color
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

  const handleAddEntry = () => {
    setIsQuickEntryOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today&apos;s Summary Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Today&apos;s Summary</h2>
          {isLoadingCalories ? (
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : caloriesError ? (
            <div className="text-red-500 text-center py-4">{caloriesError}</div>
          ) : (
            <div className="space-y-6">
              {/* Calories Consumed */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Calories Consumed</span>
                  <span className="text-lg font-semibold text-gray-900">{summary.totalCalories}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateSafePercentage(summary.totalCalories, 2000)}%` }}
                  />
                </div>
              </div>

              {/* Calories Burned */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Calories Burned</span>
                  <span className="text-lg font-semibold text-gray-900">{summary.totalBurned}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateSafePercentage(summary.totalBurned, 1000)}%` }}
                  />
                </div>
              </div>

              {/* Net Calories */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Net Calories</span>
                  <span className="text-lg font-semibold text-gray-900">{summary.netCalories}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#4d90cc] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateSafePercentage(summary.netCalories, summary.calorieGoal)}%` }}
                  />
                </div>
              </div>

              {/* Goal Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Progress Towards Goal</span>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">{Math.round((summary.totalCalories / summary.calorieGoal) * 100)}%</span>
                    <span className="text-sm text-gray-500 ml-2">of {summary.calorieGoal} cal</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(Math.round((summary.totalCalories / summary.calorieGoal) * 100), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Challenges Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Active Challenges</h2>
            {challenges.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{challenges.length} active</span>
                {challenges.length > 2 && (
                  <a 
                    href="/challenges" 
                    className="text-sm text-[#4d90cc] hover:text-[#4d90cc]/90"
                  >
                    View All
                  </a>
                )}
              </div>
            )}
          </div>

          {isLoadingChallenges ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ) : challengesError ? (
            <div className="text-red-500 text-center py-4">{challengesError}</div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No active challenges</p>
              <button 
                onClick={handleAddEntry}
                className="mt-4 text-[#4d90cc] hover:text-[#4d90cc]/90"
              >
                Create a challenge
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {challenges.slice(0, 2).map((challenge) => (
                <div key={challenge.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{challenge.name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getChallengeTypeColor(challenge.type)}`}>
                        {challenge.type}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {challenge.daysLeft} {challenge.daysLeft === 1 ? 'day' : 'days'} left
                    </span>
                  </div>

                  {challenge.frequency === 'Daily' && challenge.trackingType === 'Checkbox' ? (
                    <DailyProgress
                      startDate={challenge.startDate}
                      endDate={challenge.endDate}
                      entries={challenge.entries}
                    />
                  ) : (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-[#4d90cc] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${challenge.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">
                          {challenge.frequency} • {challenge.trackingType}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{challenge.progress}%</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {challenges.length > 2 && (
                <a 
                  href="/challenges"
                  className="block text-center py-3 border border-gray-200 rounded-lg text-[#4d90cc] hover:text-[#4d90cc]/90 hover:border-gray-300 transition-colors"
                >
                  View {challenges.length - 2} more challenge{challenges.length - 2 !== 1 ? 's' : ''}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Today's Challenge */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Today&apos;s Challenge</h2>
          {isLoadingChallenges ? (
            <div className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ) : challengesError ? (
            <div className="text-red-500 text-center py-4">{challengesError}</div>
          ) : (
            <div className="space-y-4">
              {challenges
                .filter(challenge => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return !challenge.entries.some(entry => {
                    const entryDate = new Date(entry.date);
                    entryDate.setHours(0, 0, 0, 0);
                    return entryDate.getTime() === today.getTime();
                  });
                })
                .map(challenge => (
                  <div 
                    key={challenge.id} 
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{challenge.name}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getChallengeTypeColor(challenge.type)}`}>
                          {challenge.type}
                        </span>
                      </div>
                      <button 
                        onClick={handleAddEntry}
                        className="text-[#4d90cc] hover:text-[#4d90cc]/90 text-sm"
                      >
                        Add Entry
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {challenge.frequency} • {challenge.trackingType}
                    </p>
                  </div>
                ))
              }
              {challenges.filter(challenge => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return !challenge.entries.some(entry => {
                  const entryDate = new Date(entry.date);
                  entryDate.setHours(0, 0, 0, 0);
                  return entryDate.getTime() === today.getTime();
                });
              }).length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">All Challenges Completed!</h3>
                  <p className="text-gray-500">You&apos;ve completed all your challenges for today. Great job! 🎉</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Progress</h2>
          {isLoadingCalories ? (
            <div className="animate-pulse">
              <div className="h-[300px] bg-gray-200 rounded-lg"></div>
            </div>
          ) : caloriesError ? (
            <div className="text-red-500 text-center py-4">{caloriesError}</div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Array.from({ length: 7 }, (_, i) => {
                    const date = subDays(new Date(), 6 - i);
                    const formattedDate = format(date, 'MMM d');
                    return {
                      date: formattedDate,
                      consumed: summary.weeklyData?.[formattedDate]?.consumed || 0,
                      burned: summary.weeklyData?.[formattedDate]?.burned || 0,
                      net: summary.weeklyData?.[formattedDate]?.net || 0,
                    };
                  })}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="consumed" 
                    stroke="#22c55e" 
                    name="Calories Consumed"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="burned" 
                    stroke="#3b82f6" 
                    name="Calories Burned"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#ef4444" 
                    name="Net Calories"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Streak Information */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Streak Information</h2>
          {isLoadingCalories || isLoadingChallenges ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ) : caloriesError || challengesError ? (
            <div className="text-red-500 text-center py-4">
              {caloriesError || challengesError}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calorie Streak */}
              <div className="flex items-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="flex-shrink-0 p-3 bg-green-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20v-6M6 20V10M18 20V4" />
                  </svg>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-900">Calorie Tracking Streak</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-bold text-green-600">{summary.calorieStreak}</p>
                    <p className="ml-2 text-sm text-gray-600">days</p>
                  </div>
                </div>
              </div>

              {/* Challenge Streak */}
              <div className="flex items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="flex-shrink-0 p-3 bg-blue-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6v12M16 6v12M12 3v18M3 12h18" />
                  </svg>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-900">Challenge Completion Streak</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-bold text-blue-600">{summary.challengeStreak}</p>
                    <p className="ml-2 text-sm text-gray-600">days</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <QuickEntryForm 
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
      />
    </div>
  );
};

export default DashboardPage; 