import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CalendarEvent, ViewMode, EventCategory } from '../types/calendar';
import { generateSeedEvents } from '../data/seedEvents';
import { formatDateKey, minutesToTimeStr, parseTimeToMinutes } from '../utils/dateUtils';

interface SlotData {
  date: string;
  startTime: string;
  endTime: string;
}

interface CalendarContextType {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;
  toggleComplete: (id: string) => void;
  
  // Navigation & Date State
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  navigateDate: (direction: 'prev' | 'next' | 'today') => void;
  
  // View State
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  
  // Modals & Forms
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingEvent: CalendarEvent | null;
  setEditingEvent: (event: CalendarEvent | null) => void;
  viewingEvent: CalendarEvent | null;
  setViewingEvent: (event: CalendarEvent | null) => void;
  slotPrefill: SlotData | null;
  openAddModalForSlot: (date: string, startTime?: string, endTime?: string) => void;
  
  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: EventCategory[];
  toggleCategoryFilter: (category: EventCategory) => void;
  clearFilters: () => void;
  
  // Reset
  resetToSampleData: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const STORAGE_KEY = 'chronos_calendar_events_v2';

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse cached events:', e);
    }
    return generateSeedEvents();
  });

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateKey(new Date()));
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [slotPrefill, setSlotPrefill] = useState<SlotData | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([
    'work',
    'meeting',
    'focus',
    'personal',
    'health',
    'deadline',
  ]);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to persist events:', e);
    }
  }, [events]);

  const addEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, ...updates } : evt))
    );
    if (viewingEvent && viewingEvent.id === id) {
      setViewingEvent((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    if (viewingEvent?.id === id) {
      setViewingEvent(null);
    }
    if (editingEvent?.id === id) {
      setEditingEvent(null);
      setIsAddModalOpen(false);
    }
  };

  const duplicateEvent = (id: string) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;
    const duplicated: CalendarEvent = {
      ...target,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${target.title} (Copy)`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [duplicated, ...prev]);
  };

  const toggleComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === id ? { ...evt, completed: !evt.completed } : evt
      )
    );
    if (viewingEvent && viewingEvent.id === id) {
      setViewingEvent((prev) =>
        prev ? { ...prev, completed: !prev.completed } : null
      );
    }
  };

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      const now = new Date();
      setCurrentDate(now);
      setSelectedDate(formatDateKey(now));
      return;
    }

    setCurrentDate((prev) => {
      const next = new Date(prev);
      const step = direction === 'next' ? 1 : -1;

      if (currentView === 'weekly') {
        next.setDate(next.getDate() + step * 7);
      } else if (currentView === 'monthly') {
        next.setMonth(next.getMonth() + step);
      } else {
        // Daily or Home or Agenda
        next.setDate(next.getDate() + step);
      }
      return next;
    });
  };

  const openAddModalForSlot = (date: string, startTime?: string, endTime?: string) => {
    const defaultStart = startTime || '09:00';
    let defaultEnd = endTime;
    if (!defaultEnd) {
      const startMins = parseTimeToMinutes(defaultStart);
      defaultEnd = minutesToTimeStr(startMins + 60);
    }

    setSlotPrefill({
      date,
      startTime: defaultStart,
      endTime: defaultEnd,
    });
    setEditingEvent(null);
    setIsAddModalOpen(true);
  };

  const toggleCategoryFilter = (category: EventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([
      'work',
      'meeting',
      'focus',
      'personal',
      'health',
      'deadline',
    ]);
  };

  const resetToSampleData = () => {
    const fresh = generateSeedEvents();
    setEvents(fresh);
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(formatDateKey(now));
  };

  // Filtered events memo
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Category filter
      if (!selectedCategories.includes(evt.category)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = evt.title.toLowerCase().includes(query);
        const matchDesc = evt.description?.toLowerCase().includes(query) || false;
        const matchLoc = evt.location?.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchDesc && !matchLoc) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedCategories, searchQuery]);

  return (
    <CalendarContext.Provider
      value={{
        events,
        filteredEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        duplicateEvent,
        toggleComplete,
        currentDate,
        setCurrentDate,
        selectedDate,
        setSelectedDate,
        navigateDate,
        currentView,
        setCurrentView,
        isAddModalOpen,
        setIsAddModalOpen,
        editingEvent,
        setEditingEvent,
        viewingEvent,
        setViewingEvent,
        slotPrefill,
        openAddModalForSlot,
        searchQuery,
        setSearchQuery,
        selectedCategories,
        toggleCategoryFilter,
        clearFilters,
        resetToSampleData,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export function useCalendar(): CalendarContextType {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
