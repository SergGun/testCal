import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent, EventCategory, EventPriority, CATEGORIES } from '../../types/calendar';
import { formatDateKey, formatDuration } from '../../utils/dateUtils';
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  Video,
  FileText,
  AlertCircle,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';

export const EventModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingEvent,
    setEditingEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    slotPrefill,
    selectedDate,
  } = useCalendar();

  const todayKey = formatDateKey(new Date());

  // Form State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(todayKey);
  const [endDate, setEndDate] = useState(todayKey);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [category, setCategory] = useState<EventCategory>('meeting');
  const [priority, setPriority] = useState<EventPriority>('medium');
  const [location, setLocation] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [reminder, setReminder] = useState('10m');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when opening modal
  useEffect(() => {
    if (!isAddModalOpen) return;

    if (editingEvent) {
      setTitle(editingEvent.title);
      setStartDate(editingEvent.startDate);
      setEndDate(editingEvent.endDate);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setIsAllDay(editingEvent.isAllDay);
      setCategory(editingEvent.category);
      setPriority(editingEvent.priority);
      setLocation(editingEvent.location || '');
      setMeetUrl(editingEvent.meetUrl || '');
      setReminder(editingEvent.reminder || 'none');
      setDescription(editingEvent.description || '');
      setErrorMsg('');
    } else if (slotPrefill) {
      setTitle('');
      setStartDate(slotPrefill.date);
      setEndDate(slotPrefill.date);
      setStartTime(slotPrefill.startTime);
      setEndTime(slotPrefill.endTime);
      setIsAllDay(false);
      setCategory('meeting');
      setPriority('medium');
      setLocation('');
      setMeetUrl('');
      setReminder('10m');
      setDescription('');
      setErrorMsg('');
    } else {
      // Default to selectedDate or today
      const defaultDate = selectedDate || todayKey;
      setTitle('');
      setStartDate(defaultDate);
      setEndDate(defaultDate);
      setStartTime('10:00');
      setEndTime('11:00');
      setIsAllDay(false);
      setCategory('work');
      setPriority('medium');
      setLocation('');
      setMeetUrl('');
      setReminder('15m');
      setDescription('');
      setErrorMsg('');
    }
  }, [isAddModalOpen, editingEvent, slotPrefill, selectedDate, todayKey]);

  if (!isAddModalOpen) return null;

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingEvent(null);
  };

  const handleApplyPreset = (preset: {
    title: string;
    cat: EventCategory;
    durMinutes: number;
    priority: EventPriority;
  }) => {
    setTitle(preset.title);
    setCategory(preset.cat);
    setPriority(preset.priority);
    
    // adjust end time based on durMinutes
    const [h, m] = startTime.split(':').map(Number);
    const totalMins = (h || 0) * 60 + (m || 0) + preset.durMinutes;
    const endH = Math.min(23, Math.floor(totalMins / 60));
    const endM = totalMins % 60;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Event title is required');
      return;
    }

    if (!isAllDay && startTime >= endTime && startDate === endDate) {
      setErrorMsg('End time must be after start time on the same date');
      return;
    }

    if (editingEvent) {
      updateEvent(editingEvent.id, {
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
      });
    } else {
      addEvent({
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
    }

    handleClose();
  };

  const handleDelete = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      handleClose();
    }
  };

  const durationStr = !isAllDay ? formatDuration(startTime, endTime) : 'All Day';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CATEGORIES[category]?.color || '#3b82f6' }}
            />
            <h2 className="text-base font-semibold text-neutral-900">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets (Only when creating new) */}
        {!editingEvent && (
          <div className="px-5 pt-3 pb-1 border-b border-neutral-100 bg-neutral-50/40">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
              <span className="text-neutral-600 shrink-0 font-medium">Quick presets:</span>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset({
                    title: '1:1 Catchup & Sync',
                    cat: 'meeting',
                    durMinutes: 30,
                    priority: 'medium',
                  })
                }
                className="px-2.5 py-1 bg-white border border-neutral-200 hover:border-neutral-300 rounded-md text-neutral-700 whitespace-nowrap transition-colors"
              >
                1:1 Sync (30m)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset({
                    title: 'Daily Team Standup',
                    cat: 'meeting',
                    durMinutes: 15,
                    priority: 'high',
                  })
                }
                className="px-2.5 py-1 bg-white border border-neutral-200 hover:border-neutral-300 rounded-md text-neutral-700 whitespace-nowrap transition-colors"
              >
                Standup (15m)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset({
                    title: 'Deep Focus Sprint',
                    cat: 'focus',
                    durMinutes: 90,
                    priority: 'high',
                  })
                }
                className="px-2.5 py-1 bg-white border border-neutral-200 hover:border-neutral-300 rounded-md text-neutral-700 whitespace-nowrap transition-colors"
              >
                Deep Focus (90m)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset({
                    title: 'Workout & Fitness Session',
                    cat: 'health',
                    durMinutes: 60,
                    priority: 'low',
                  })
                }
                className="px-2.5 py-1 bg-white border border-neutral-200 hover:border-neutral-300 rounded-md text-neutral-700 whitespace-nowrap transition-colors"
              >
                Workout (60m)
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Event Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Q4 Strategy Review"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              required
              className="w-full px-3 py-2 text-sm bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:bg-white transition-all font-medium text-neutral-900"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORIES) as EventCategory[]).map((catKey) => {
                const config = CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: isSelected ? '#ffffff' : config.color,
                      }}
                    />
                    <span className="truncate">{config.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-neutral-500" />
                Schedule
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

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate < e.target.value) {
                      setEndDate(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            {/* Time Pickers (if not all-day) */}
            {!isAllDay && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 pb-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-3 py-2 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono tabular-nums">{durationStr}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location & Video Call URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="e.g. Conference Room 3 / Paris"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Video Link
              </label>
              <div className="relative">
                <Video className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* Priority & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EventPriority)}
                className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Reminder
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
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

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Notes & Agenda
            </label>
            <textarea
              rows={2}
              placeholder="Add agenda items, meeting notes, links, or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
            {editingEvent ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingEvent ? 'Save Changes' : 'Create Event'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
