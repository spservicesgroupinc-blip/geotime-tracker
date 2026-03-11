
import React from 'react';
import { TimeEntry, UserProfile } from '../types';

interface TimeLogProps {
  timeEntries: TimeEntry[];
  profile: UserProfile;
}

const LocationLink: React.FC<{ location?: { latitude: number; longitude: number } }> = ({ location }) => {
  if (!location) return <span style={{ color: '#2e3a52' }}>—</span>;
  const { latitude, longitude } = location;
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-steel-400 hover:text-steel-300 transition-colors"
      style={{ fontSize: '0.7rem', textDecoration: 'underline', textUnderlineOffset: '2px' }}
    >
      Map
    </a>
  );
};

const TimeLog: React.FC<TimeLogProps> = ({ timeEntries, profile }) => {
  const calculateDuration = (clockIn: string, clockOut?: string): number => {
    if (!clockOut) return 0;
    return (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / (1000 * 60 * 60);
  };

  const sortedEntries = [...timeEntries].sort(
    (a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
  );

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-xl shadow-xl" style={{ minHeight: '200px' }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #1d2140' }}>
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-lg font-semibold text-gold-400 tracking-wide">
          Time Log
        </h3>
        {sortedEntries.length > 0 && (
          <span className="text-xs text-slate-600 font-medium tabular-nums">
            {sortedEntries.length} {sortedEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {/* Entries */}
      {sortedEntries.length > 0 ? (
        <div className="divide-y" style={{ divideColor: '#1d2140' }}>
          {sortedEntries.map((entry) => {
            const duration = calculateDuration(entry.clockIn, entry.clockOut);
            const pay = duration * profile.hourlyWage;
            const isInProgress = !entry.clockOut;

            return (
              <div
                key={entry.id}
                className="px-6 py-5 transition-colors"
                style={{ borderBottom: '1px solid #1d2140' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(22,25,48,0.5)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Left side */}
                  <div className="flex-1 min-w-0">
                    {/* Date + badge row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-slate-200">
                        {new Date(entry.clockIn).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#1d2140', border: '1px solid #252a50', color: '#9ab8e0' }}
                      >
                        {entry.projectName || 'General'}
                      </span>
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-400">
                          <span
                            className="rounded-full animate-pulse"
                            style={{ width: '6px', height: '6px', backgroundColor: '#dfc05e', display: 'inline-block', flexShrink: 0 }}
                          ></span>
                          Active
                        </span>
                      )}
                    </div>

                    {/* Time rows */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3" style={{ fontSize: '0.78rem' }}>
                        <span className="font-medium uppercase tracking-widest" style={{ color: '#333a68', width: '18px', flexShrink: 0 }}>In</span>
                        <span className="text-slate-300">
                          {new Date(entry.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <LocationLink location={entry.clockInLocation} />
                      </div>
                      <div className="flex items-center gap-3" style={{ fontSize: '0.78rem' }}>
                        <span className="font-medium uppercase tracking-widest" style={{ color: '#333a68', width: '18px', flexShrink: 0 }}>Out</span>
                        <span className="text-slate-300">
                          {entry.clockOut
                            ? new Date(entry.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : <span style={{ color: '#252a50' }}>—</span>
                          }
                        </span>
                        {entry.clockOut && <LocationLink location={entry.clockOutLocation} />}
                      </div>
                    </div>
                  </div>

                  {/* Right side — duration & pay */}
                  <div className="sm:text-right flex-shrink-0 sm:pl-4">
                    {duration > 0 ? (
                      <>
                        <p className="text-sm font-semibold text-slate-200 tabular-nums">
                          {duration.toFixed(2)} hrs
                        </p>
                        <p className="text-sm font-medium tabular-nums" style={{ color: '#dfc05e' }}>
                          ${pay.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs italic" style={{ color: '#333a68' }}>In progress</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center px-6">
          <p className="text-sm text-slate-600">No time entries yet.</p>
          <p className="text-xs mt-1" style={{ color: '#252a50' }}>
            Select a project and clock in to begin tracking.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeLog;
