'use client';

import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, subMonths, startOfDay, startOfMonth, endOfMonth } from 'date-fns';
import * as Tooltip from '@radix-ui/react-tooltip';

interface DailyProgressProps {
  startDate: Date;
  endDate: Date;
  entries: Array<{ date: Date; value: boolean | number }>;
}

const DAYS = ['Mon', 'Wed', 'Fri'];

const DailyProgress = ({ startDate, endDate, entries }: DailyProgressProps) => {
  // Calculate the date range for the last 12 months (desktop view)
  const today = startOfDay(new Date());
  const elevenMonthsAgo = startOfDay(subMonths(today, 11));
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  // Generate weeks for full year (desktop view)
  const yearWeeks = useMemo(() => {
    const firstWeek = startOfWeek(elevenMonthsAgo, { weekStartsOn: 1 });
    const lastWeek = endOfWeek(today, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start: firstWeek, end: lastWeek });
    
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];
    
    allDays.forEach((day) => {
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(startOfDay(day));
    });
    
    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek);
    }
    
    return weeksArray;
  }, []);

  // Generate weeks for current month (mobile view)
  const monthWeeks = useMemo(() => {
    const firstWeek = startOfWeek(currentMonthStart, { weekStartsOn: 1 });
    const lastWeek = endOfWeek(currentMonthEnd, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start: firstWeek, end: lastWeek });
    
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];
    
    allDays.forEach((day) => {
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(startOfDay(day));
    });
    
    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek);
    }
    
    return weeksArray;
  }, []);

  const getEntryForDay = (day: Date) => {
    const normalizedDay = startOfDay(day);
    return entries.find(entry => {
      // Convert entry date to UTC to avoid timezone issues
      const entryDate = new Date(entry.date);
      entryDate.setUTCHours(0, 0, 0, 0);
      const compareDay = new Date(normalizedDay);
      compareDay.setUTCHours(0, 0, 0, 0);
      return entryDate.getTime() === compareDay.getTime();
    });
  };

  const getColorClass = (day: Date) => {
    const normalizedDay = startOfDay(day);
    const normalizedStartDate = startOfDay(startDate);
    const normalizedEndDate = startOfDay(endDate);

    // Check if the day is within the challenge's date range
    if (normalizedDay < normalizedStartDate || normalizedDay > normalizedEndDate) {
      return 'bg-[#161b22]';
    }

    const entry = getEntryForDay(normalizedDay);
    if (!entry) {
      return 'bg-[#161b22]';
    }

    // For checkbox-type challenges, highlight in green if value is true
    if (typeof entry.value === 'boolean' && entry.value === true) {
      return 'bg-[#39d353]';
    }

    return 'bg-[#161b22]';
  };

  // Get all months for desktop view
  const months = useMemo(() => {
    const uniqueMonths = new Set<string>();
    yearWeeks.forEach(week => {
      week.forEach(day => {
        uniqueMonths.add(format(day, 'MMM'));
      });
    });
    return Array.from(uniqueMonths);
  }, [yearWeeks]);

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="mt-4 bg-[#0d1117] p-4 rounded-lg">
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="flex text-[#7d8590] mb-2 pl-8 text-sm">
            {months.map((month) => (
              <div key={month} className="flex-1 text-center">{month}</div>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col justify-between text-[#7d8590] text-sm">
              {DAYS.map((day) => (
                <div key={day} style={{ height: '10px' }}>{day}</div>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="grid grid-flow-col gap-[3px] min-w-[750px]">
                {yearWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                    {week.map((day) => (
                      <Tooltip.Root key={day.toISOString()}>
                        <Tooltip.Trigger asChild>
                          <div
                            className={`w-[10px] h-[10px] rounded-sm ${getColorClass(day)}`}
                          />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="rounded-md bg-[#1b1f23] px-3 py-2 text-xs text-white shadow-md"
                            sideOffset={5}
                          >
                            {format(day, 'MMMM d, yyyy')}
                            {getEntryForDay(day)?.value && (
                              <span className="block text-[#39d353]">Completed</span>
                            )}
                            <Tooltip.Arrow className="fill-[#1b1f23]" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          <div className="text-[#7d8590] mb-2 text-center text-sm font-medium">
            {format(currentMonthStart, 'MMMM yyyy')}
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col justify-between text-[#7d8590] text-sm">
              {DAYS.map((day) => (
                <div key={day} style={{ height: '10px' }}>{day}</div>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="grid grid-flow-col gap-[3px]">
                {monthWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                    {week.map((day) => (
                      <Tooltip.Root key={day.toISOString()}>
                        <Tooltip.Trigger asChild>
                          <div
                            className={`w-[10px] h-[10px] rounded-sm ${getColorClass(day)}`}
                          />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="rounded-md bg-[#1b1f23] px-3 py-2 text-xs text-white shadow-md"
                            sideOffset={5}
                          >
                            {format(day, 'MMMM d, yyyy')}
                            {getEntryForDay(day)?.value && (
                              <span className="block text-[#39d353]">Completed</span>
                            )}
                            <Tooltip.Arrow className="fill-[#1b1f23]" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default DailyProgress; 