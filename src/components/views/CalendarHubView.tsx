import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { WeeklyView } from './WeeklyView';
import { MonthlyView } from './MonthlyView';
import { AgendaView } from './AgendaView';
import { CATEGORIES, EventCategory } from '../../types/calendar';
import {
  CalendarRange,
  CalendarDays,
  Clock,
  Plus,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';

export const CalendarHubView: React.FC = () => {
  const {
    setIsAddModalOpen,
    setEditingEvent,
    selectedCategories,
    toggleCategoryFilter,
    events,
  } = useCalendar();

  const [activeSubView, setActiveSubView] = useState<'weekly' | 'monthly' | 'agenda'>('weekly');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  return (
    <div className="space-y-4">
      {/* Calendar Hub Top Subnav Bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Sub-view switcher tabs */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveSubView('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeSubView === 'weekly'
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-neutral-500" />
              <span>Weekly Grid</span>
            </button>

            <button
              onClick={() => setActiveSubView('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeSubView === 'monthly'
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-neutral-500" />
              <span>Monthly Matrix</span>
            </button>

            <button
              onClick={() => setActiveSubView('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeSubView === 'agenda'
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Agenda Timeline</span>
            </button>
          </div>

          {/* Quick Category Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5">
              {(Object.keys(CATEGORIES) as EventCategory[]).map((catKey) => {
                const config = CATEGORIES[catKey];
                const isSelected = selectedCategories.includes(catKey);
                return (
                  <button
                    key={catKey}
                    onClick={() => toggleCategoryFilter(catKey)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-500 border-neutral-200 hover:text-neutral-800'
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

            <button
              onClick={() => {
                setEditingEvent(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render the Active Calendar View */}
      {activeSubView === 'weekly' && <WeeklyView />}
      {activeSubView === 'monthly' && <MonthlyView />}
      {activeSubView === 'agenda' && <AgendaView />}
    </div>
  );
};
