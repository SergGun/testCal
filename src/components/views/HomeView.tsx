import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { MiniCalendar } from '../calendar/MiniCalendar';
import { CATEGORIES, EventCategory } from '../../types/calendar';
import {
  formatDateKey,
  formatFullDate,
  formatShortDate,
  formatTime12h,
  formatDuration,
  parseTimeToMinutes,
} from '../../utils/dateUtils';
import {
  Calendar,
  CalendarRange,
  CalendarDays,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Video,
  MapPin,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    events,
    filteredEvents,
    setViewingEvent,
    setIsAddModalOpen,
    setEditingEvent,
    setCurrentView,
    toggleComplete,
    selectedCategories,
    toggleCategoryFilter,
  } = useCalendar();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayKey = formatDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndKey = formatDateKey(weekEnd);

  // Filter events by period
  const todayEvents = events.filter((e) => e.startDate === todayKey);
  const tomorrowEvents = events.filter((e) => e.startDate === tomorrowKey);
  const thisWeekEvents = events.filter(
    (e) => e.startDate >= todayKey && e.startDate <= weekEndKey
  );

  let displayedUpcoming = todayEvents;
  if (filterPeriod === 'tomorrow') displayedUpcoming = tomorrowEvents;
  else if (filterPeriod === 'week') displayedUpcoming = thisWeekEvents;
  else if (filterPeriod === 'all') displayedUpcoming = events.filter((e) => e.startDate >= todayKey);

  // Daily Summary Calculations
  const todayCompleted = todayEvents.filter((e) => e.completed).length;
  const todayTotal = todayEvents.length;
  const completionPercent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  let totalMeetingMinutes = 0;
  let totalFocusMinutes = 0;
  let totalWorkMinutes = 0;

  todayEvents.forEach((evt) => {
    if (evt.isAllDay) return;
    const dur = Math.max(0, parseTimeToMinutes(evt.endTime) - parseTimeToMinutes(evt.startTime));
    if (evt.category === 'meeting') totalMeetingMinutes += dur;
    else if (evt.category === 'focus') totalFocusMinutes += dur;
    else totalWorkMinutes += dur;
  });

  const meetingHoursStr = (totalMeetingMinutes / 60).toFixed(1).replace('.0', '') + 'h';
  const focusHoursStr = (totalFocusMinutes / 60).toFixed(1).replace('.0', '') + 'h';

  // Find Next Upcoming Event for today
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nextEvent = todayEvents
    .filter((e) => !e.completed && !e.isAllDay && parseTimeToMinutes(e.startTime) >= currentMinutes)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime))[0];

  // Greeting
  const currentHour = currentTime.getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            <span className="font-mono tabular-nums">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatFullDate(currentTime)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            {greeting}, Sergei
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            You have <strong className="text-neutral-900">{todayTotal - todayCompleted} pending</strong> event{todayTotal - todayCompleted === 1 ? '' : 's'} on your schedule today.
          </p>
        </div>

        {/* Quick View Navigation */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setCurrentView('weekly')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
          >
            <CalendarRange className="w-3.5 h-3.5 text-neutral-500" />
            <span>Weekly Grid</span>
          </button>
          <button
            onClick={() => setCurrentView('monthly')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 text-neutral-500" />
            <span>Monthly View</span>
          </button>
          <button
            onClick={() => setCurrentView('agenda')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Agenda Stream</span>
          </button>
          <button
            onClick={() => {
              setEditingEvent(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Daily Summaries Card & Status Grid */}
      <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neutral-700" />
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
              Daily Summary & Focus Metrics
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-mono tabular-nums">
            {todayCompleted} of {todayTotal} Completed ({completionPercent}%)
          </span>
        </div>

        {/* Next Meeting Countdown Highlight (if any) */}
        {nextEvent && (
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-10 rounded-full"
                style={{ backgroundColor: CATEGORIES[nextEvent.category]?.color || '#3b82f6' }}
              />
              <div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <span className="font-semibold text-neutral-900 uppercase tracking-wide">
                    Up Next Today
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {formatTime12h(nextEvent.startTime)} – {formatTime12h(nextEvent.endTime)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDuration(nextEvent.startTime, nextEvent.endTime)}</span>
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{nextEvent.title}</h3>
                {nextEvent.location && (
                  <p className="text-xs text-neutral-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>{nextEvent.location}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {nextEvent.meetUrl && (
                <a
                  href={nextEvent.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Call</span>
                </a>
              )}
              <button
                onClick={() => setViewingEvent(nextEvent)}
                className="px-3 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-medium rounded-md transition-colors"
              >
                Details
              </button>
            </div>
          </div>
        )}

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-neutral-50/60 rounded-lg border border-neutral-100">
            <span className="text-xs text-neutral-500 block mb-1">Today's Total Events</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                {todayTotal}
              </span>
              <span className="text-xs text-neutral-500">
                ({todayCompleted} done · {todayTotal - todayCompleted} open)
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-neutral-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-neutral-50/60 rounded-lg border border-neutral-100">
            <span className="text-xs text-neutral-500 block mb-1">Meeting Commitments</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                {meetingHoursStr}
              </span>
              <span className="text-xs text-neutral-500">
                across {todayEvents.filter((e) => e.category === 'meeting').length} sessions
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Coordinated team syncs & briefings</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50/60 rounded-lg border border-neutral-100">
            <span className="text-xs text-neutral-500 block mb-1">Protected Focus Time</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                {focusHoursStr}
              </span>
              <span className="text-xs text-neutral-500">uninterrupted work</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Deep architecture & refactoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Section: Upcoming Events Feed & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upcoming Events Placeholder & Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Upcoming Events Feed
              </h2>
              <p className="text-xs text-neutral-500">
                Dynamic view of scheduled commitments and quick status actions
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg self-start sm:self-auto text-xs font-medium">
              <button
                onClick={() => setFilterPeriod('today')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterPeriod === 'today'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Today ({todayEvents.length})
              </button>
              <button
                onClick={() => setFilterPeriod('tomorrow')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterPeriod === 'tomorrow'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Tomorrow ({tomorrowEvents.length})
              </button>
              <button
                onClick={() => setFilterPeriod('week')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterPeriod === 'week'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Next 7 Days ({thisWeekEvents.length})
              </button>
              <button
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterPeriod === 'all'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All Future
              </button>
            </div>
          </div>

          {/* Event List / Placeholder */}
          {displayedUpcoming.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800">
                No events found for this filter
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No events match this timeframe. Create an event or switch your filter to see other upcoming dates.
              </p>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedUpcoming.map((event) => {
                const config = CATEGORIES[event.category] || CATEGORIES.work;
                return (
                  <div
                    key={event.id}
                    onClick={() => setViewingEvent(event)}
                    className={`group bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-4 transition-all hover:shadow-xs cursor-pointer flex items-start justify-between gap-3 ${
                      event.completed ? 'opacity-70 bg-neutral-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(event.id);
                        }}
                        className="mt-0.5 text-neutral-400 hover:text-emerald-600 transition-colors"
                        title={event.completed ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {event.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      {/* Content */}
                      <div>
                        {/* Metadata row */}
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="font-medium text-neutral-800">{config.label}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-neutral-700">
                            {event.startDate !== todayKey && (
                              <span className="mr-1">{formatShortDate(event.startDate)} ·</span>
                            )}
                            {event.isAllDay ? (
                              'All Day'
                            ) : (
                              `${formatTime12h(event.startTime)} – ${formatTime12h(event.endTime)}`
                            )}
                          </span>
                          {!event.isAllDay && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-neutral-500 font-mono">
                                {formatDuration(event.startTime, event.endTime)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          className={`text-sm font-semibold text-neutral-900 group-hover:text-neutral-800 ${
                            event.completed ? 'line-through text-neutral-400' : ''
                          }`}
                        >
                          {event.title}
                        </h4>

                        {/* Sub-meta: Location / Meet URL */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-neutral-400" />
                              <span>{event.location}</span>
                            </span>
                          )}
                          {event.meetUrl && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Video className="w-3 h-3" />
                              <span>Virtual Call</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right action on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingEvent(event);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Mini Calendar & Category Distribution */}
        <div className="space-y-6">
          {/* Mini Calendar Card */}
          <MiniCalendar />

          {/* Category Breakdown */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="text-xs font-bold text-neutral-900 tracking-tight">
                Filter by Category
              </span>
              <span className="text-[11px] text-neutral-500">
                {selectedCategories.length} active
              </span>
            </div>

            <div className="space-y-1.5">
              {(Object.keys(CATEGORIES) as EventCategory[]).map((catKey) => {
                const config = CATEGORIES[catKey];
                const count = events.filter((e) => e.category === catKey).length;
                const isSelected = selectedCategories.includes(catKey);

                return (
                  <button
                    key={catKey}
                    onClick={() => toggleCategoryFilter(catKey)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-neutral-50 text-neutral-900 font-medium hover:bg-neutral-100'
                        : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: isSelected ? config.color : '#d4d4d8',
                        }}
                      />
                      <span>{config.label}</span>
                    </div>
                    <span className="font-mono tabular-nums text-neutral-500">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Jump Links */}
          <div className="bg-neutral-900 text-white rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold tracking-tight">Need a broad overview?</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Explore your week in an interactive 24-hour time grid, browse by month, or run agenda filters.
            </p>
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setCurrentView('weekly')}
                className="w-full flex items-center justify-between px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <span>Full-time Weekly Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentView('monthly')}
                className="w-full flex items-center justify-between px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <span>Full Monthly Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentView('agenda')}
                className="w-full flex items-center justify-between px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <span>Agenda Stream & Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
