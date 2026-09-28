import React, { useRef, useEffect, useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  getWeekDays,
  formatDateKey,
  formatTime12h,
  formatDuration,
  parseTimeToMinutes,
  isTodayDate,
} from '../../utils/dateUtils';
import { CATEGORIES, CalendarEvent } from '../../types/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const HOUR_HEIGHT = 56; // px per hour
const START_HOUR = 0;   // 00:00
const END_HOUR = 24;    // 24:00
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const WeeklyView: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    events,
    filteredEvents,
    setViewingEvent,
    openAddModalForSlot,
    setIsAddModalOpen,
    setEditingEvent,
  } = useCalendar();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  // Update current time indicator every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentMinutes(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to 08:00 on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 8 * HOUR_HEIGHT;
    }
  }, []);

  const weekDays = getWeekDays(currentDate);
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];

  // Header Title
  const weekTitle = `${firstDay.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${lastDay.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group events by date
  const eventsByDate = weekDays.map((day) => {
    const dateKey = formatDateKey(day);
    const dayEvents = filteredEvents.filter(
      (e) => e.startDate <= dateKey && e.endDate >= dateKey
    );
    const timed = dayEvents.filter((e) => !e.isAllDay);
    const allDay = dayEvents.filter((e) => e.isAllDay);
    return {
      date: day,
      dateKey,
      isToday: isTodayDate(dateKey),
      timed,
      allDay,
    };
  });

  // Check if any day has all-day events
  const hasAnyAllDay = eventsByDate.some((d) => d.allDay.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 shrink-0">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">
            Full-Time Grid Layout
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            {weekTitle}
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
              onClick={handlePrevWeek}
              aria-label="Previous week"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-neutral-200" />
            <button
              onClick={handleNextWeek}
              aria-label="Next week"
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

      {/* Main Grid Viewport Container */}
      <div className="flex-1 mt-4 flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs min-h-0">
        
        {/* Days Header Row (Sticky) */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] sm:grid-cols-[70px_repeat(7,1fr)] border-b border-neutral-200 bg-neutral-50/90 shrink-0 z-20">
          <div className="py-2.5 border-r border-neutral-200 text-center text-[11px] font-mono text-neutral-400 flex items-center justify-center">
            GMT
          </div>

          {eventsByDate.map(({ date, isToday }, idx) => {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();

            return (
              <div
                key={idx}
                className={`py-2 px-1 text-center border-r border-neutral-200 last:border-r-0 ${
                  isToday ? 'bg-neutral-100/70' : ''
                }`}
              >
                <div className="text-[11px] font-semibold text-neutral-500 uppercase">
                  {dayName}
                </div>
                <div
                  className={`inline-flex items-center justify-center w-7 h-7 text-xs font-mono font-bold mt-0.5 rounded-full ${
                    isToday
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'text-neutral-800'
                  }`}
                >
                  {dayNum}
                </div>
              </div>
            );
          })}
        </div>

        {/* All-Day Events Strip (if any exists this week) */}
        {hasAnyAllDay && (
          <div className="grid grid-cols-[56px_repeat(7,1fr)] sm:grid-cols-[70px_repeat(7,1fr)] border-b border-neutral-200 bg-neutral-50/40 shrink-0 z-10 text-xs">
            <div className="py-1 px-2 border-r border-neutral-200 text-[10px] font-semibold text-neutral-400 uppercase tracking-tight flex items-center justify-center">
              All Day
            </div>
            {eventsByDate.map(({ allDay, dateKey }, idx) => (
              <div
                key={idx}
                className="p-1 border-r border-neutral-200 last:border-r-0 space-y-1 min-h-[32px]"
              >
                {allDay.map((evt) => {
                  const config = CATEGORIES[evt.category] || CATEGORIES.work;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => setViewingEvent(evt)}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-semibold truncate border transition-all hover:brightness-95"
                      style={{
                        backgroundColor: config.accentBg,
                        borderColor: config.color,
                        color: '#18181b',
                      }}
                    >
                      {evt.title}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Scrollable 24-Hour Time Grid */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          style={{ height: '100%' }}
        >
          <div
            className="grid grid-cols-[56px_repeat(7,1fr)] sm:grid-cols-[70px_repeat(7,1fr)] relative"
            style={{ height: `${24 * HOUR_HEIGHT}px` }}
          >
            {/* Left Time Gutter Column */}
            <div className="border-r border-neutral-200 relative select-none bg-neutral-50/30">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full pr-2 text-right text-[11px] font-mono text-neutral-400 -translate-y-2.5"
                  style={{ top: `${hour * HOUR_HEIGHT}px` }}
                >
                  {hour === 0 ? '' : formatTime12h(`${String(hour).padStart(2, '0')}:00`)}
                </div>
              ))}
            </div>

            {/* 7 Days Columns */}
            {eventsByDate.map(({ date, dateKey, isToday, timed }, colIdx) => (
              <div
                key={colIdx}
                className={`border-r border-neutral-200 last:border-r-0 relative group/col ${
                  isToday ? 'bg-neutral-50/20' : ''
                }`}
              >
                {/* Background Hour Lines & Clickable Slots */}
                {HOURS.map((hour) => {
                  const hourStr = `${String(hour).padStart(2, '0')}:00`;
                  return (
                    <div
                      key={hour}
                      onClick={() => openAddModalForSlot(dateKey, hourStr)}
                      title={`Click to schedule event at ${hourStr}`}
                      className="absolute w-full border-b border-neutral-100 hover:bg-neutral-100/50 cursor-pointer transition-colors"
                      style={{
                        top: `${hour * HOUR_HEIGHT}px`,
                        height: `${HOUR_HEIGHT}px`,
                      }}
                    >
                      {/* Half-hour dashed divider */}
                      <div className="w-full border-b border-dashed border-neutral-100/70 h-1/2" />
                    </div>
                  );
                })}

                {/* Red Current Time Line (if column is Today) */}
                {isToday && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{
                      top: `${(currentMinutes / 60) * HOUR_HEIGHT}px`,
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-1.5 shadow-xs animate-pulse" />
                    <div className="h-[2px] w-full bg-red-600" />
                  </div>
                )}

                {/* Timed Event Blocks */}
                {timed.map((event) => {
                  const startMin = parseTimeToMinutes(event.startTime);
                  const endMin = parseTimeToMinutes(event.endTime);
                  const duration = Math.max(20, endMin - startMin);

                  const top = (startMin / 60) * HOUR_HEIGHT;
                  const height = Math.max(28, (duration / 60) * HOUR_HEIGHT);

                  const config = CATEGORIES[event.category] || CATEGORIES.work;

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingEvent(event);
                      }}
                      className={`absolute left-0.5 right-1 rounded-md p-1.5 overflow-hidden text-left border-l-4 shadow-2xs cursor-pointer transition-all hover:z-30 hover:shadow-md select-none ${
                        event.completed ? 'opacity-65' : ''
                      }`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: '#ffffff',
                        borderLeftColor: config.color,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-1 leading-tight">
                        <h4
                          className={`text-xs font-bold text-neutral-900 truncate ${
                            event.completed ? 'line-through text-neutral-400' : ''
                          }`}
                        >
                          {event.title}
                        </h4>
                        {event.completed && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </div>

                      {height > 38 && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-600 mt-0.5">
                          <span>
                            {formatTime12h(event.startTime)} – {formatTime12h(event.endTime)}
                          </span>
                        </div>
                      )}

                      {height > 58 && event.location && (
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-1 truncate">
                          <MapPin className="w-2.5 h-2.5 shrink-0 text-neutral-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      {height > 65 && event.meetUrl && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-0.5">
                          <Video className="w-2.5 h-2.5 shrink-0" />
                          <span>Call Link</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info strip */}
        <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50/70 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>Current Time Line</span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              Click any open slot to schedule an event
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono tabular-nums">
            <span>{filteredEvents.length} events active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
