import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { getMonthMatrix, formatDateKey } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MiniCalendar: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    events,
    setCurrentView,
  } = useCalendar();

  const [viewDate, setViewDate] = useState<Date>(() => new Date(currentDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const matrix = getMonthMatrix(year, month);

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (date: Date, key: string) => {
    setSelectedDate(key);
    setCurrentDate(date);
  };

  const todayKey = formatDateKey(new Date());

  // Set of dates with events
  const datesWithEvents = new Set(events.map((e) => e.startDate));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-neutral-900 tracking-tight">
          {monthLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-[11px] font-semibold text-neutral-400 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="space-y-1">
        {matrix.map((week, wIndex) => (
          <div key={wIndex} className="grid grid-cols-7 gap-1">
            {week.map((cell) => {
              const isSelected = cell.dateKey === selectedDate;
              const hasEvents = datesWithEvents.has(cell.dateKey);

              return (
                <button
                  key={cell.dateKey}
                  onClick={() => handleSelectDay(cell.date, cell.dateKey)}
                  className={`h-7 w-full rounded-md text-xs font-medium relative flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                      : cell.isToday
                      ? 'bg-neutral-100 text-neutral-900 font-bold border border-neutral-300'
                      : cell.isCurrentMonth
                      ? 'text-neutral-700 hover:bg-neutral-100'
                      : 'text-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <span className="font-mono tabular-nums leading-none">
                    {cell.dayNumber}
                  </span>
                  {hasEvents && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-neutral-900'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Quick View Jumper */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
        <button
          onClick={() => {
            const now = new Date();
            setViewDate(now);
            setCurrentDate(now);
            setSelectedDate(formatDateKey(now));
          }}
          className="text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
        >
          Jump to Today
        </button>
        <button
          onClick={() => setCurrentView('monthly')}
          className="text-neutral-900 hover:underline font-semibold transition-colors"
        >
          Full Month →
        </button>
      </div>
    </div>
  );
};
