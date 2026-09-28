import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  getMonthMatrix,
  formatDateKey,
  formatTime12h,
  formatFullDate,
  MonthDay,
} from '../../utils/dateUtils';
import { CATEGORIES, CalendarEvent } from '../../types/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const MonthlyView: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    filteredEvents,
    setViewingEvent,
    openAddModalForSlot,
    setIsAddModalOpen,
    setEditingEvent,
  } = useCalendar();

  const [activeDayDetails, setActiveDayDetails] = useState<MonthDay | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const matrix = getMonthMatrix(year, month);

  const monthTitle = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific cell
  const getEventsForCell = (dateKey: string) => {
    return filteredEvents.filter(
      (e) => e.startDate <= dateKey && e.endDate >= dateKey
    );
  };

  // Active day events for popup/drawer
  const activeDayEvents = activeDayDetails
    ? getEventsForCell(activeDayDetails.dateKey)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">
            Monthly Calendar Grid
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            {monthTitle}
          </h1>
        </div>

        {/* Navigation Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-white border border-neutral-200 rounded-lg shadow-2xs">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-neutral-200" />
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingEvent(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-all ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Monthly Grid Container */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/80 text-center py-2.5">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
            (dayName, i) => (
              <div key={i} className="text-xs font-bold text-neutral-600 uppercase tracking-wide">
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{dayName.slice(0, 3)}</span>
              </div>
            )
          )}
        </div>

        {/* Weeks Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-200">
          {matrix.flat().map((cell) => {
            const cellEvents = getEventsForCell(cell.dateKey);
            const MAX_VISIBLE = 3;
            const hasOverflow = cellEvents.length > MAX_VISIBLE;
            const visibleEvents = cellEvents.slice(0, MAX_VISIBLE);

            return (
              <div
                key={cell.dateKey}
                onClick={() => openAddModalForSlot(cell.dateKey, '09:00')}
                className={`min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between group cursor-pointer hover:bg-neutral-50/80 ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-neutral-50/40 text-neutral-400'
                }`}
              >
                {/* Day Header Row */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-mono font-semibold rounded-full ${
                      cell.isToday
                        ? 'bg-neutral-900 text-white font-bold'
                        : cell.isCurrentMonth
                        ? 'text-neutral-800'
                        : 'text-neutral-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {cellEvents.length > 0 && (
                    <span className="text-[10px] font-mono text-neutral-400 opacity-60 group-hover:opacity-100">
                      {cellEvents.length} evt{cellEvents.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                {/* Event Chips List */}
                <div className="space-y-1 flex-1">
                  {visibleEvents.map((evt) => {
                    const config = CATEGORIES[evt.category] || CATEGORIES.work;
                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingEvent(evt);
                        }}
                        className={`text-[11px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1.5 border border-l-2 transition-all hover:scale-[1.01] ${
                          evt.completed ? 'opacity-60 line-through' : ''
                        }`}
                        style={{
                          backgroundColor: config.badgeBg,
                          borderColor: config.color,
                          borderLeftColor: config.color,
                          color: '#18181b',
                        }}
                        title={`${evt.title} (${evt.isAllDay ? 'All Day' : evt.startTime})`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="font-mono text-[10px] text-neutral-500 shrink-0">
                          {evt.isAllDay ? 'All' : formatTime12h(evt.startTime).split(' ')[0]}
                        </span>
                        <span className="truncate">{evt.title}</span>
                      </div>
                    );
                  })}

                  {/* "+N more" badge */}
                  {hasOverflow && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDayDetails(cell);
                      }}
                      className="text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 hover:underline pt-0.5 block w-full text-left"
                    >
                      +{cellEvents.length - MAX_VISIBLE} more...
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Schedule Detail Drawer / Popover (when +N more is clicked) */}
      {activeDayDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/80">
              <div>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Schedule Overview
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  {formatFullDate(activeDayDetails.date)}
                </h3>
              </div>
              <button
                onClick={() => setActiveDayDetails(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-96 overflow-y-auto space-y-2">
              {activeDayEvents.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-6">
                  No events on this date.
                </p>
              ) : (
                activeDayEvents.map((evt) => {
                  const config = CATEGORIES[evt.category] || CATEGORIES.work;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setActiveDayDetails(null);
                        setViewingEvent(evt);
                      }}
                      className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg cursor-pointer transition-all flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="font-semibold text-neutral-800">
                            {config.label}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">
                            {evt.isAllDay
                              ? 'All Day'
                              : `${formatTime12h(evt.startTime)} – ${formatTime12h(evt.endTime)}`}
                          </span>
                        </div>
                        <h4
                          className={`text-xs font-bold text-neutral-900 ${
                            evt.completed ? 'line-through text-neutral-400' : ''
                          }`}
                        >
                          {evt.title}
                        </h4>
                        {evt.location && (
                          <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            <span>{evt.location}</span>
                          </div>
                        )}
                      </div>

                      {evt.completed && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => {
                  openAddModalForSlot(activeDayDetails.dateKey, '10:00');
                  setActiveDayDetails(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event on this Day</span>
              </button>
              <button
                onClick={() => setActiveDayDetails(null)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
