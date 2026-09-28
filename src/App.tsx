import React from 'react';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { Navbar } from './components/layout/Navbar';
import { HomeView } from './components/views/HomeView';
import { CalendarHubView } from './components/views/CalendarHubView';
import { WeeklyView } from './components/views/WeeklyView';
import { MonthlyView } from './components/views/MonthlyView';
import { AgendaView } from './components/views/AgendaView';
import { AddEventView } from './components/views/AddEventView';
import { EventModal } from './components/modals/EventModal';
import { EventDetailModal } from './components/modals/EventDetailModal';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView } = useCalendar();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* 3-Zone Sticky Navigation */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && <HomeView />}
        {currentView === 'calendar' && <CalendarHubView />}
        {currentView === 'weekly' && <WeeklyView />}
        {currentView === 'monthly' && <MonthlyView />}
        {currentView === 'agenda' && <AgendaView />}
        {currentView === 'add-event' && <AddEventView />}
      </main>

      {/* Modals */}
      <EventModal />
      <EventDetailModal />

      {/* Quiet Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 tracking-tight">Chronos Calendar</span>
            <span aria-hidden="true">·</span>
            <span>Dynamic Schedule Engine</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-600">
            <button
              onClick={() => setCurrentView('home')}
              className="hover:text-neutral-900 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className="hover:text-neutral-900 transition-colors"
            >
              Calendar
            </button>
            <button
              onClick={() => setCurrentView('weekly')}
              className="hover:text-neutral-900 transition-colors"
            >
              Weekly
            </button>
            <button
              onClick={() => setCurrentView('monthly')}
              className="hover:text-neutral-900 transition-colors"
            >
              Monthly
            </button>
            <button
              onClick={() => setCurrentView('agenda')}
              className="hover:text-neutral-900 transition-colors"
            >
              Agenda
            </button>
            <button
              onClick={() => setCurrentView('add-event')}
              className="hover:text-neutral-900 transition-colors"
            >
              Add Event
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CalendarProvider>
      <AppContent />
    </CalendarProvider>
  );
}
