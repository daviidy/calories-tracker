'use client';

import { useState, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfDay } from 'date-fns';
import QuickEntryForm from '@/components/dashboard/QuickEntryForm';
import DateSearch from '@/components/calories/DateSearch';
import { useCalorieLog, CalorieLogEntry } from '@/lib/hooks/useCalorieLog';
import { useCalorieChartData } from '@/lib/hooks/useCalorieChartData';
import EditEntryDialog from '@/components/calories/EditEntryDialog';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';

const CalorieLogPage = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<CalorieLogEntry | null>(null);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const { entries, isLoading, error, hasMore, loadMore, refresh } = useCalorieLog();
  const { chartData, isLoading: isLoadingChart, error: chartError } = useCalorieChartData(timeRange);
  const observer = useRef<IntersectionObserver | null>(null);
  const entriesRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Last element ref callback for infinite scrolling
  const lastEntryRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  }, [isLoading, hasMore, loadMore]);

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (!date) return;

    const selectedDateKey = startOfDay(parseISO(date)).toISOString();
    const entryElement = entriesRef.current.get(selectedDateKey);
    
    if (entryElement) {
      entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      entryElement.classList.add('ring-2', 'ring-[#4d90cc]');
      setTimeout(() => {
        entryElement.classList.remove('ring-2', 'ring-[#4d90cc]');
      }, 2000);
    }
  };

  const handleEditSuccess = () => {
    refresh();
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteDoc(doc(db, 'calorieEntries', entryId));
      toast.success('Entry deleted successfully');
      refresh();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleAddEntry = () => {
    setIsQuickEntryOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calorie Log</h1>
        <div className="flex items-center gap-4">
          <DateSearch
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
          <button
            onClick={handleAddEntry}
            className="px-4 py-2 bg-[#4d90cc] text-white rounded-lg hover:bg-[#4d90cc]/90 transition-colors"
          >
            Add Entry
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Progress Chart</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d90cc] focus:border-transparent text-gray-900"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        <div className="h-[300px]">
          {isLoadingChart ? (
            <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse" />
          ) : chartError ? (
            <div className="flex items-center justify-center w-full h-full text-red-500">
              {chartError}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickFormatter={(value) => value}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                  formatter={(value: number) => value.toLocaleString()}
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
          )}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-6">
        {error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : entries.length === 0 && !isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500">No entries found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                ref={(node) => {
                  if (node) {
                    entriesRef.current.set(startOfDay(entry.date).toISOString(), node);
                  }
                  if (index === entries.length - 1) {
                    lastEntryRef(node);
                  }
                }}
                className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {format(entry.date, 'MMMM d, yyyy h:mm a')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Edit entry"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Delete entry"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Calories Consumed</span>
                    <span className="font-medium text-gray-900">{entry.consumed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Calories Burned</span>
                    <span className="font-medium text-gray-900">{entry.burned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Net Calories</span>
                    <span className="font-medium text-gray-900">{entry.net.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <QuickEntryForm 
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
      />
      
      {selectedEntry && (
        <EditEntryDialog
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onSuccess={handleEditSuccess}
          entry={{
            id: selectedEntry.id,
            consumed: selectedEntry.consumed,
            burned: selectedEntry.burned,
            date: selectedEntry.date,
          }}
        />
      )}
    </div>
  );
};

export default CalorieLogPage; 