import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CATEGORIES, EventCategory, EventPriority } from '../../types/calendar';
import {
  formatDateKey,
  formatFullDate,
  formatTime12h,
  formatDuration,
} from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Check,
  Sparkles,
  ArrowLeft,
  CalendarCheck,
  AlertCircle,
  FileText,
  Sliders,
} from 'lucide-react';

export const AddEventView: React.FC = () => {
  const { addEvent, setCurrentView, selectedDate } = useCalendar();

  const todayKey = formatDateKey(new Date());
  const initialDate = selectedDate || todayKey;

  // Form State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(initialDate);
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('10:30');
  const [isAllDay, setIsAllDay] = useState(false);
  const [category, setCategory] = useState<EventCategory>('work');
  const [priority, setPriority] = useState<EventPriority>('medium');
  const [location, setLocation] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [reminder, setReminder] = useState('15m');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets: {
    name: string;
    title: string;
    cat: EventCategory;
    durMins: number;
    priority: EventPriority;
    desc: string;
  }[] = [
    {
      name: '1:1 Catchup',
      title: '1:1 Sync & Alignment',
      cat: 'meeting',
      durMins: 30,
      priority: 'medium',
      desc: 'Weekly 1:1 catchup to discuss project blockers, feedback, and priorities.',
    },
    {
      name: 'Team Standup',
      title: 'Daily Engineering Standup',
      cat: 'meeting',
      durMins: 15,
      priority: 'high',
      desc: 'Quick progress check-in, sprint board walk, and obstacle resolution.',
    },
    {
      name: 'Deep Focus Sprint',
      title: 'Deep Focus: Core Architecture',
      cat: 'focus',
      durMins: 90,
      priority: 'high',
      desc: 'Uninterrupted deep work sprint for system implementation and refactoring.',
    },
    {
      name: 'Strategy Session',
      title: 'Quarterly Strategic Planning',
      cat: 'work',
      durMins: 60,
      priority: 'high',
      desc: 'Review strategic deliverables, project timelines, and operational metrics.',
    },
    {
      name: 'Fitness & Cardio',
      title: 'Cardio & Strength Training',
      cat: 'health',
      durMins: 60,
      priority: 'low',
      desc: 'Daily physical training and mobility session.',
    },
  ];

  const handleApplyPreset = (preset: (typeof presets)[0]) => {
    setTitle(preset.title);
    setCategory(preset.cat);
    setPriority(preset.priority);
    setDescription(preset.desc);

    const [h, m] = startTime.split(':').map(Number);
    const totalMins = (h || 0) * 60 + (m || 0) + preset.durMins;
    const endH = Math.min(23, Math.floor(totalMins / 60));
    const endM = totalMins % 60;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  const handleGenerateMeet = () => {
    const slug = Math.random().toString(36).substring(2, 5) + '-' +
                 Math.random().toString(36).substring(2, 6) + '-' +
                 Math.random().toString(36).substring(2, 5);
    setMeetUrl(`https://meet.google.com/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please specify an event title');
      return;
    }

    if (!isAllDay && startTime >= endTime && startDate === endDate) {
      setErrorMsg('End time must be later than start time on the same date');
      return;
    }

    const created = addEvent({
      title: title.trim(),
      startDate,
      endDate: endDate < startDate ? startDate : endDate,
      startTime: isAllDay ? '00:00' : startTime,
      endTime: isAllDay ? '23:59' : endTime,
      isAllDay,
      category,
      priority,
      location: location.trim() || undefined,
      meetUrl: meetUrl.trim() || undefined,
      reminder,
      description: description.trim() || undefined,
      completed: false,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setCurrentView('weekly');
    }, 900);
  };

  const selectedCategoryConfig = CATEGORIES[category] || CATEGORIES.work;
  const durationText = isAllDay ? 'All Day' : formatDuration(startTime, endTime);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <button
            onClick={() => setCurrentView('calendar')}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Calendar</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Create Schedule Event
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Configure dynamic schedule parameters, categories, and calendar integrations.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Event scheduled! Redirecting to Weekly Grid...</span>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-2">
        <span className="text-xs font-bold text-neutral-700 tracking-tight block">
          One-Click Smart Templates:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 transition-colors"
            >
              {preset.name} ({preset.durMins}m)
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Layout: Form & Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container (2 cols) */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6"
          >
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cross-functional sprint kick-off"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:bg-white transition-all text-neutral-900 font-medium"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Event Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(CATEGORIES) as EventCategory[]).map((catKey) => {
                  const config = CATEGORIES[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: isSelected ? '#ffffff' : config.color,
                        }}
                      />
                      <span className="truncate">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time Settings */}
            <div className="space-y-4 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-neutral-500" />
                  Date & Time
                </span>
                <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                  />
                  <span>All-day event</span>
                </label>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate < e.target.value) setEndDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              {/* Times (if not all day) */}
              {!isAllDay && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="px-3 py-2 text-xs bg-neutral-100 rounded-lg text-neutral-600 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{durationText}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location & Meet Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Location / Room
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="e.g. Conference Room 4B"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-800">Video Call Link</label>
                  <button
                    type="button"
                    onClick={handleGenerateMeet}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    + Generate Link
                  </button>
                </div>
                <div className="relative">
                  <Video className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>
            </div>

            {/* Priority & Reminder */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as EventPriority)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Reminder Notification
                </label>
                <select
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="none">No reminder</option>
                  <option value="5m">5 minutes before</option>
                  <option value="10m">10 minutes before</option>
                  <option value="15m">15 minutes before</option>
                  <option value="30m">30 minutes before</option>
                  <option value="1h">1 hour before</option>
                  <option value="1d">1 day before</option>
                </select>
              </div>
            </div>

            {/* Notes / Agenda */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Agenda & Notes
              </label>
              <textarea
                rows={3}
                placeholder="Include agenda details, key discussion topics, or meeting prep..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentView('weekly')}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savedSuccess}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save and View Schedule</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Card Preview Column */}
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-xs font-bold text-neutral-900 tracking-tight">
                Live Preview
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">Dynamic Rendering</span>
            </div>

            {/* Preview Card */}
            <div
              className="rounded-xl border p-4 shadow-2xs space-y-3"
              style={{
                borderColor: selectedCategoryConfig.color,
                backgroundColor: '#ffffff',
                borderLeftWidth: '5px',
                borderLeftColor: selectedCategoryConfig.color,
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedCategoryConfig.color }}
                  />
                  <span className="font-semibold text-neutral-900">
                    {selectedCategoryConfig.label}
                  </span>
                  <span aria-hidden="true" className="text-neutral-400">·</span>
                  <span className="capitalize text-neutral-500">{priority}</span>
                </div>
                <span className="font-mono text-neutral-400 text-[11px]">Preview</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {title || 'Untitled Event'}
                </h3>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-600 font-mono tabular-nums">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{formatFullDate(startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>
                    {isAllDay
                      ? 'All Day'
                      : `${formatTime12h(startTime)} – ${formatTime12h(endTime)} (${durationText})`}
                  </span>
                </div>
                {location && (
                  <div className="flex items-center gap-2 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{location}</span>
                  </div>
                )}
                {meetUrl && (
                  <div className="flex items-center gap-2 font-sans text-blue-600">
                    <Video className="w-3.5 h-3.5" />
                    <span>Virtual Meeting Link</span>
                  </div>
                )}
              </div>

              {description && (
                <p className="text-xs text-neutral-600 border-t border-neutral-100 pt-2 line-clamp-3">
                  {description}
                </p>
              )}
            </div>

            <div className="text-[11px] text-neutral-500 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              💡 As soon as you save, this event will synchronize into your Home summary, Weekly time-grid, Month matrix, and Agenda stream.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
