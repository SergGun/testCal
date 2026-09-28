export type EventCategory = 'work' | 'personal' | 'meeting' | 'focus' | 'health' | 'deadline';

export type EventPriority = 'low' | 'medium' | 'high';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour format)
  endTime: string;   // HH:mm (24-hour format)
  isAllDay: boolean;
  category: EventCategory;
  priority: EventPriority;
  location?: string;
  meetUrl?: string;
  color?: string;
  reminder?: string;
  completed?: boolean;
  createdAt: string;
}

export type ViewMode = 'home' | 'calendar' | 'weekly' | 'monthly' | 'agenda' | 'add-event';

export interface CategoryInfo {
  label: string;
  color: string;
  accentBg: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

export const CATEGORIES: Record<EventCategory, CategoryInfo> = {
  work: {
    label: 'Work & Projects',
    color: '#3b82f6', // blue-500
    accentBg: 'bg-blue-50/70',
    accentBorder: 'border-l-blue-500 border-blue-200',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  meeting: {
    label: 'Meetings & Syncs',
    color: '#6366f1', // indigo-500
    accentBg: 'bg-indigo-50/70',
    accentBorder: 'border-l-indigo-500 border-indigo-200',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    dotColor: 'bg-indigo-500',
  },
  focus: {
    label: 'Focus & Deep Work',
    color: '#8b5cf6', // purple-500
    accentBg: 'bg-purple-50/70',
    accentBorder: 'border-l-purple-500 border-purple-200',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    dotColor: 'bg-purple-500',
  },
  personal: {
    label: 'Personal & Life',
    color: '#10b981', // emerald-500
    accentBg: 'bg-emerald-50/70',
    accentBorder: 'border-l-emerald-500 border-emerald-200',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  health: {
    label: 'Health & Fitness',
    color: '#f59e0b', // amber-500
    accentBg: 'bg-amber-50/70',
    accentBorder: 'border-l-amber-500 border-amber-200',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  deadline: {
    label: 'Milestone / Deadline',
    color: '#ef4444', // red-500
    accentBg: 'bg-red-50/70',
    accentBorder: 'border-l-red-500 border-red-200',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    dotColor: 'bg-red-500',
  },
};
