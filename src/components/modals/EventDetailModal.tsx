import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CATEGORIES } from '../../types/calendar';
import {
  formatFullDate,
  formatTime12h,
  formatDuration,
  downloadEventIcs,
} from '../../utils/dateUtils';
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  Video,
  CheckCircle2,
  Circle,
  Edit2,
  Copy,
  Trash2,
  Download,
  ExternalLink,
  Bell,
  AlertTriangle,
} from 'lucide-react';

export const EventDetailModal: React.FC = () => {
  const {
    viewingEvent,
    setViewingEvent,
    setEditingEvent,
    setIsAddModalOpen,
    deleteEvent,
    duplicateEvent,
    toggleComplete,
  } = useCalendar();

  if (!viewingEvent) return null;

  const categoryConfig = CATEGORIES[viewingEvent.category] || CATEGORIES.work;

  const handleEdit = () => {
    setEditingEvent(viewingEvent);
    setViewingEvent(null);
    setIsAddModalOpen(true);
  };

  const handleDuplicate = () => {
    duplicateEvent(viewingEvent.id);
    setViewingEvent(null);
  };

  const handleDelete = () => {
    deleteEvent(viewingEvent.id);
  };

  const handleToggleComplete = () => {
    toggleComplete(viewingEvent.id);
  };

  const handleDownload = () => {
    downloadEventIcs(viewingEvent);
  };

  const isMultiDay = viewingEvent.startDate !== viewingEvent.endDate;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top color strip */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: categoryConfig.color }}
        />

        {/* Header bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {/* Category label unboxed */}
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: categoryConfig.color }}
            />
            <span className="font-semibold text-neutral-900">
              {categoryConfig.label}
            </span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{viewingEvent.priority} Priority</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleComplete}
              title={viewingEvent.completed ? 'Mark uncompleted' : 'Mark completed'}
              className="p-1.5 text-neutral-500 hover:text-emerald-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              {viewingEvent.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setViewingEvent(null)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-3 space-y-4">
          {/* Title */}
          <div>
            <h1
              className={`text-xl font-bold tracking-tight text-neutral-900 ${
                viewingEvent.completed ? 'line-through text-neutral-400' : ''
              }`}
            >
              {viewingEvent.title}
            </h1>
          </div>

          {/* Date & Time metadata */}
          <div className="space-y-2 py-2 border-y border-neutral-100 text-xs text-neutral-600">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4 h-4 text-neutral-400 shrink-0" />
              <div className="font-medium text-neutral-800">
                {isMultiDay ? (
                  <span>
                    {formatFullDate(viewingEvent.startDate)} –{' '}
                    {formatFullDate(viewingEvent.endDate)}
                  </span>
                ) : (
                  <span>{formatFullDate(viewingEvent.startDate)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
              <div className="flex items-center gap-2 font-mono tabular-nums text-neutral-700">
                {viewingEvent.isAllDay ? (
                  <span className="font-sans font-medium text-neutral-800">
                    All-day Event
                  </span>
                ) : (
                  <>
                    <span>
                      {formatTime12h(viewingEvent.startTime)} –{' '}
                      {formatTime12h(viewingEvent.endTime)}
                    </span>
                    <span aria-hidden="true" className="font-sans">·</span>
                    <span className="text-neutral-500">
                      {formatDuration(viewingEvent.startTime, viewingEvent.endTime)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {viewingEvent.location && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-800">{viewingEvent.location}</span>
              </div>
            )}

            {viewingEvent.reminder && viewingEvent.reminder !== 'none' && (
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>Alert set for {viewingEvent.reminder} prior</span>
              </div>
            )}
          </div>

          {/* Video Conference CTA if URL is present */}
          {viewingEvent.meetUrl && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-800 truncate mr-2">
                <Video className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{viewingEvent.meetUrl}</span>
              </div>
              <a
                href={viewingEvent.meetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0"
              >
                <span>Join Call</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Description / Notes */}
          {viewingEvent.description && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-neutral-700">Agenda / Details</h3>
              <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap bg-neutral-50/60 p-3 rounded-lg border border-neutral-100">
                {viewingEvent.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-3 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              title="Delete event"
              className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={handleDuplicate}
              title="Duplicate event"
              className="flex items-center gap-1 px-2.5 py-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-md transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handleDownload}
              title="Export .ics file"
              className="flex items-center gap-1 px-2.5 py-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.ics</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-md shadow-xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
