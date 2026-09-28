import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { ViewMode } from '../../types/calendar';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  Home,
  Plus,
  RotateCcw,
  Search,
  Menu,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setIsAddModalOpen,
    setEditingEvent,
    resetToSampleData,
    searchQuery,
    setSearchQuery,
  } = useCalendar();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const navLinks: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { mode: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { mode: 'weekly', label: 'Weekly View', icon: <CalendarRange className="w-4 h-4" /> },
    { mode: 'monthly', label: 'Monthly View', icon: <CalendarDays className="w-4 h-4" /> },
    { mode: 'agenda', label: 'Agenda View', icon: <Clock className="w-4 h-4" /> },
    { mode: 'add-event', label: 'Add Event', icon: <Plus className="w-4 h-4" /> },
  ];

  const handleOpenNewModal = () => {
    setEditingEvent(null);
    setIsAddModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('home')}
              className="text-left group flex items-center gap-2.5 focus-visible:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-neutral-800 transition-colors">
                C
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900">
                Chronos
              </span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentView === link.mode;
              return (
                <button
                  key={link.mode}
                  onClick={() => setCurrentView(link.mode)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <span className={isActive ? 'text-neutral-900' : 'text-neutral-400'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick search button / input */}
            {showSearchInput ? (
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery) setShowSearchInput(false);
                  }}
                  className="pl-8 pr-7 py-1.5 text-xs bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-36 sm:w-48 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                title="Search events"
                className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Search events"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Reset sample data button */}
            <button
              onClick={resetToSampleData}
              title="Reset sample schedule data"
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors hidden sm:flex items-center"
              aria-label="Reset sample data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={handleOpenNewModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = currentView === link.mode;
            return (
              <button
                key={link.mode}
                onClick={() => {
                  setCurrentView(link.mode);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span className={isActive ? 'text-neutral-900' : 'text-neutral-400'}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between px-3 text-xs text-neutral-500">
            <span>Reset schedule demo</span>
            <button
              onClick={() => {
                resetToSampleData();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 text-neutral-700 hover:text-neutral-900 font-medium py-1 px-2 rounded hover:bg-neutral-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
