import React, { useState, useMemo } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  formatFullDate,
  formatShortDate,
  formatTime12h,
  formatDuration,
  formatDateKey,
  downloadEventIcs,
} from '../../utils/dateUtils';
import { CATEGORIES, EventCategory, EventPriority, CalendarEvent } from '../../types/calendar';
import {
  Search,
  Plus,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  Circle,
  Edit2,
  Copy,
  Trash2,
  Download,
  Filter,
  X,
  Calendar,
} from 'lucide-react';

export const AgendaView: React.FC = () => {
  const {
    filteredEvents,
    setViewingEvent,
    setEditingEvent,
    setIsAddModalOpen,
    deleteEvent,
    duplicateEvent,
    toggleComplete,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategoryFilter,
  } = useCalendar();

  const [timeHorizon, setTimeHorizon] = useState<'upcoming' | 'all' | 'past'>('upcoming');
  const [priorityFilter, setPriorityFilter] = useState<'all' | EventPriority>('all');

  const todayKey = formatDateKey(new Date());

  // Filter based on horizon and priority
  const processedEvents = useMemo(() => {
    return filteredEvents
      .filter((evt) => {
        if (timeHorizon === 'upcoming' && evt.startDate < todayKey) return false;
        if (timeHorizon === 'past' && evt.startDate >= todayKey) return false;
        if (priorityFilter !== 'all' && evt.priority !== priorityFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.startDate !== b.startDate) {
          return a.startDate.localeCompare(b.startDate);
        }
        return a.startTime.localeCompare(b.startTime);
      });
  }, [filteredEvents, timeHorizon, priorityFilter, todayKey]);

  // Group by date key
  const groupedEvents = useMemo(() => {
    const groups: { dateKey: string; events: CalendarEvent[] }[] = [];
    const dateMap = new Map<string, CalendarEvent[]>();

    processedEvents.forEach((evt) => {
      const existing = dateMap.get(evt.startDate) || [];
      existing.push(evt);
      dateMap.set(evt.startDate, existing);
    });

    dateMap.forEach((evts, dateKey) => {
      groups.push({ dateKey, events: evts });
    });

    return groups;
  }, [processedEvents]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">
            Chronological Timeline
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Agenda Stream
          </h1>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search agenda by title, notes, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time Horizon Segmented Control */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setTimeHorizon('upcoming')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                timeHorizon === 'upcoming'
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeHorizon('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                timeHorizon === 'all'
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setTimeHorizon('past')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                timeHorizon === 'past'
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Categories Bar & Priority Filter */}
        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-neutral-500 font-medium mr-1">Categories:</span>
            {(Object.keys(CATEGORIES) as EventCategory[]).map((catKey) => {
              const config = CATEGORIES[catKey];
              const isSelected = selectedCategories.includes(catKey);
              return (
                <button
                  key={catKey}
                  onClick={() => toggleCategoryFilter(catKey)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] transition-colors ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isSelected ? '#ffffff' : config.color }}
                  />
                  <span>{config.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 text-xs focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stream List */}
      {groupedEvents.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-800">
            No events match your criteria
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search terms, categories, or switching from upcoming to all events.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map(({ dateKey, events: groupEvts }) => {
            const isToday = dateKey === todayKey;
            return (
              <section key={dateKey} className="space-y-3">
                {/* Date Group Header */}
                <div className="flex items-center gap-3 sticky top-16 bg-neutral-50/95 backdrop-blur-xs py-2 z-10">
                  <div
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isToday
                        ? 'bg-neutral-900 text-white font-mono'
                        : 'bg-neutral-200/80 text-neutral-700 font-mono'
                    }`}
                  >
                    {isToday ? 'Today' : formatShortDate(dateKey)}
                  </div>
                  <h2 className="text-sm font-semibold text-neutral-800">
                    {formatFullDate(dateKey)}
                  </h2>
                  <div className="flex-1 border-b border-neutral-200" />
                  <span className="text-xs font-mono text-neutral-400">
                    {groupEvts.length} event{groupEvts.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Event Cards */}
                <div className="space-y-2.5">
                  {groupEvts.map((event) => {
                    const config = CATEGORIES[event.category] || CATEGORIES.work;
                    return (
                      <div
                        key={event.id}
                        onClick={() => setViewingEvent(event)}
                        className={`group bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-4 transition-all hover:shadow-xs cursor-pointer ${
                          event.completed ? 'opacity-70 bg-neutral-50/50' : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {/* Complete toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleComplete(event.id);
                              }}
                              className="mt-0.5 text-neutral-400 hover:text-emerald-600 transition-colors"
                            >
                              {event.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>

                            <div className="space-y-1">
                              {/* Metadata unboxed */}
                              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: config.color }}
                                />
                                <span className="font-semibold text-neutral-800">
                                  {config.label}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums text-neutral-700">
                                  {event.isAllDay
                                    ? 'All Day'
                                    : `${formatTime12h(event.startTime)} – ${formatTime12h(event.endTime)}`}
                                </span>
                                {!event.isAllDay && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-mono text-neutral-500">
                                      {formatDuration(event.startTime, event.endTime)}
                                    </span>
                                  </>
                                )}
                                <span aria-hidden="true">·</span>
                                <span className="capitalize">{event.priority} Priority</span>
                              </div>

                              {/* Title */}
                              <h3
                                className={`text-base font-bold text-neutral-900 group-hover:text-neutral-800 ${
                                  event.completed ? 'line-through text-neutral-400' : ''
                                }`}
                              >
                                {event.title}
                              </h3>

                              {/* Description */}
                              {event.description && (
                                <p className="text-xs text-neutral-600 line-clamp-2 max-w-2xl pt-0.5">
                                  {event.description}
                                </p>
                              )}

                              {/* Location / Meet URL */}
                              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                {event.meetUrl && (
                                  <div className="flex items-center gap-1 text-blue-600 font-medium">
                                    <Video className="w-3.5 h-3.5" />
                                    <span>Virtual Video Link</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions (visible on hover / mobile) */}
                          <div className="flex items-center gap-1 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadEventIcs(event);
                              }}
                              title="Download iCal file (.ics)"
                              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateEvent(event.id);
                              }}
                              title="Duplicate event"
                              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingEvent(event);
                                setIsAddModalOpen(true);
                              }}
                              title="Edit event"
                              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.id);
                              }}
                              title="Delete event"
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
