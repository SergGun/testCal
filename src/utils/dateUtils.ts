import { CalendarEvent } from '../types/calendar';

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD string to Date object (local timezone)
 */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Format date for friendly display (e.g. "Monday, September 28, 2026")
 */
export function formatFullDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format short date (e.g. "Mon, Sep 28")
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format month & year (e.g. "September 2026")
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Check if a date string is today
 */
export function isTodayDate(dateStr: string): boolean {
  return dateStr === formatDateKey(new Date());
}

/**
 * Check if two dates represent the same calendar day
 */
export function isSameDay(d1: Date | string, d2: Date | string): boolean {
  const k1 = typeof d1 === 'string' ? d1 : formatDateKey(d1);
  const k2 = typeof d2 === 'string' ? d2 : formatDateKey(d2);
  return k1 === k2;
}

/**
 * Convert 24h "HH:mm" to 12h display e.g. "09:00" -> "9:00 AM", "14:30" -> "2:30 PM"
 */
export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  if (isNaN(hours)) return time24;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12 AM
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Convert "HH:mm" to total minutes from midnight (0 - 1439)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Convert minutes from midnight back to "HH:mm"
 */
export function minutesToTimeStr(minutes: number): string {
  const clamped = Math.max(0, Math.min(1439, Math.floor(minutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Format duration between start and end time e.g. "1h 30m"
 */
export function formatDuration(startTime: string, endTime: string): string {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const diff = Math.max(0, end - start);
  
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Get the 7 dates of the week containing `date` (Monday to Sunday)
 */
export function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  // Distance to Monday (if day is 0/Sunday, Monday was 6 days ago)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(nextDay);
  }
  return days;
}

export interface MonthDay {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Generate 35 or 42 grid slots for a given month view (Monday to Sunday columns)
 */
export function getMonthMatrix(year: number, month: number): MonthDay[][] {
  const todayKey = formatDateKey(new Date());
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week for first day (0=Sunday, 1=Monday... 6=Saturday)
  let firstDayWeekIndex = firstDayOfMonth.getDay();
  // Adjust so Monday = 0, Sunday = 6
  firstDayWeekIndex = firstDayWeekIndex === 0 ? 6 : firstDayWeekIndex - 1;

  const daysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells: MonthDay[] = [];

  // Previous month trailing days
  for (let i = firstDayWeekIndex - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, d);
    const key = formatDateKey(dateObj);
    cells.push({
      date: dateObj,
      dateKey: key,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: key === todayKey,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const key = formatDateKey(dateObj);
    cells.push({
      date: dateObj,
      dateKey: key,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: key === todayKey,
    });
  }

  // Next month leading days to complete full weeks
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(year, month + 1, d);
    const key = formatDateKey(dateObj);
    cells.push({
      date: dateObj,
      dateKey: key,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: key === todayKey,
    });
  }

  // Split into rows of 7
  const weeks: MonthDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

/**
 * Generate iCalendar standard format (.ics) for an event
 */
export function generateIcs(event: CalendarEvent): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  
  const [sYear, sMonth, sDay] = event.startDate.split('-').map(Number);
  const [eYear, eMonth, eDay] = event.endDate.split('-').map(Number);

  let dtStart = '';
  let dtEnd = '';

  if (event.isAllDay) {
    dtStart = `VALUE=DATE:${sYear}${pad(sMonth)}${pad(sDay)}`;
    // All day end date is exclusive in iCal (next day)
    const nextDay = new Date(eYear, eMonth - 1, eDay + 1);
    dtEnd = `VALUE=DATE:${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;
  } else {
    const [sH, sM] = event.startTime.split(':').map(Number);
    const [eH, eM] = event.endTime.split(':').map(Number);
    dtStart = `${sYear}${pad(sMonth)}${pad(sDay)}T${pad(sH)}${pad(sM)}00`;
    dtEnd = `${eYear}${pad(eMonth)}${pad(eDay)}T${pad(eH)}${pad(eM)}00`;
  }

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chronos Dynamic Calendar//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@chronos.calendar`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;${dtStart}`,
    `DTEND;${dtEnd}`,
    `SUMMARY:${event.title.replace(/[,;]/g, ' ')}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location.replace(/[,;]/g, ' ')}` : '',
    event.meetUrl ? `URL:${event.meetUrl}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return icsLines.join('\r\n');
}

/**
 * Trigger file download of .ics event
 */
export function downloadEventIcs(event: CalendarEvent): void {
  const icsContent = generateIcs(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
