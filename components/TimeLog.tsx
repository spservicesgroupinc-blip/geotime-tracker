import React, { useState } from 'react';
import { TimeEntry, UserProfile } from '../types';

interface TimeLogProps {
    timeEntries: TimeEntry[];
    profile: UserProfile;
    onDeleteEntry: (id: string) => void;
}

const LocationLink: React.FC<{ location?: { latitude: number; longitude: number } }> = ({ location }) => {
    if (!location) return null;
    return (
        <a
            href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors text-xs"
            style={{ color: '#5a5549', textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c9a03a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5a5549'; }}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Map
        </a>
    );
};

const TimeLog: React.FC<TimeLogProps> = ({ timeEntries, profile, onDeleteEntry }) => {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const calcDuration = (clockIn: string, clockOut?: string): number => {
        if (!clockOut) return 0;
        return (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 3600000;
    };

    const sorted = [...timeEntries].sort(
        (a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
    );

    // Group by date
    const groups: { date: string; entries: typeof sorted }[] = [];
    const seenDates = new Set<string>();
    for (const e of sorted) {
        const date = new Date(e.clockIn).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        if (!seenDates.has(date)) {
            seenDates.add(date);
            groups.push({ date, entries: [] });
        }
        groups[groups.length - 1].entries.push(e);
    }

    const handleDeleteClick = (id: string) => {
        if (confirmDeleteId === id) {
            onDeleteEntry(id);
            setConfirmDeleteId(null);
        } else {
            setConfirmDeleteId(id);
            setTimeout(() => setConfirmDeleteId(null), 3000);
        }
    };

    return (
        <div className="bg-void-900 border border-void-700 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #242424' }}>
                <h3 className="font-display text-2xl tracking-widest text-cream-200">TIME LOG</h3>
                {sorted.length > 0 && (
                    <span className="text-xs text-void-300 tabular-nums">
                        {sorted.length} {sorted.length === 1 ? 'entry' : 'entries'}
                    </span>
                )}
            </div>

            {/* Empty state */}
            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                        style={{ backgroundColor: '#1f1f1f', border: '1px solid #313131' }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8" style={{ color: '#4b4b4b' }}>
                            <circle cx="12" cy="12" r="9" />
                            <path strokeLinecap="round" d="M12 7v5l3 3" />
                        </svg>
                    </div>
                    <p className="font-medium text-cream-500">No time entries yet</p>
                    <p className="text-sm mt-1.5" style={{ color: '#4b4b4b' }}>
                        Select a project and clock in to start tracking.
                    </p>
                </div>
            ) : (
                <div>
                    {groups.map(({ date, entries }) => {
                        const dayTotal = entries.reduce((sum, e) => sum + calcDuration(e.clockIn, e.clockOut), 0);
                        const dayEarnings = dayTotal * profile.hourlyWage;

                        return (
                            <div key={date}>
                                {/* Day header */}
                                <div
                                    className="px-6 py-3 flex items-center justify-between sticky top-14"
                                    style={{
                                        backgroundColor: '#171717',
                                        borderBottom: '1px solid #282828',
                                        borderTop: '1px solid #282828',
                                    }}
                                >
                                    <span className="text-sm font-semibold text-cream-300">{date}</span>
                                    {dayTotal > 0 && (
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="font-mono text-cream-500">{dayTotal.toFixed(2)}h</span>
                                            <span className="font-mono font-medium" style={{ color: '#c9a03a' }}>
                                                ${dayEarnings.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Entries */}
                                {entries.map((entry, idx) => {
                                    const duration = calcDuration(entry.clockIn, entry.clockOut);
                                    const pay = duration * profile.hourlyWage;
                                    const active = !entry.clockOut;

                                    return (
                                        <div
                                            key={entry.id}
                                            className="group px-6 py-4 fade-up transition-colors duration-100"
                                            style={{
                                                borderBottom: '1px solid #282828',
                                                animationDelay: `${idx * 25}ms`,
                                            }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.015)';
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLElement).style.backgroundColor = '';
                                            }}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Status bar */}
                                                <div
                                                    className="w-0.5 self-stretch rounded-full mt-0.5 flex-shrink-0"
                                                    style={{ backgroundColor: active ? '#c9a03a' : '#3b3b3b' }}
                                                />

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2.5">
                                                        <span
                                                            className="text-xs font-medium px-2.5 py-0.5 rounded-md"
                                                            style={{
                                                                backgroundColor: '#1f1f1f',
                                                                border: '1px solid #3b3b3b',
                                                                color: '#857f6f',
                                                            }}
                                                        >
                                                            {entry.projectName || 'General'}
                                                        </span>
                                                        {active && (
                                                            <span
                                                                className="flex items-center gap-1.5 text-xs font-medium"
                                                                style={{ color: '#c9a03a' }}
                                                            >
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                                                                    style={{ backgroundColor: '#c9a03a' }}
                                                                />
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="text-[10px] uppercase tracking-widest font-medium"
                                                                style={{ color: '#4b4b4b', width: '16px' }}
                                                            >
                                                                In
                                                            </span>
                                                            <span className="font-mono text-sm text-cream-300">
                                                                {new Date(entry.clockIn).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                            <LocationLink location={entry.clockInLocation} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="text-[10px] uppercase tracking-widest font-medium"
                                                                style={{ color: '#4b4b4b', width: '16px' }}
                                                            >
                                                                Out
                                                            </span>
                                                            {entry.clockOut ? (
                                                                <>
                                                                    <span className="font-mono text-sm text-cream-300">
                                                                        {new Date(entry.clockOut).toLocaleTimeString([], {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </span>
                                                                    <LocationLink location={entry.clockOutLocation} />
                                                                </>
                                                            ) : (
                                                                <span style={{ color: '#3b3b3b' }}>—</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: stats + delete */}
                                                <div className="text-right flex-shrink-0 pl-2">
                                                    {duration > 0 ? (
                                                        <>
                                                            <div className="font-mono text-sm font-medium text-cream-300 tabular-nums">
                                                                {duration.toFixed(2)}h
                                                            </div>
                                                            <div
                                                                className="font-mono text-sm font-medium tabular-nums"
                                                                style={{ color: '#c9a03a' }}
                                                            >
                                                                ${pay.toFixed(2)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-xs italic" style={{ color: '#4b4b4b' }}>
                                                            Active
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteClick(entry.id)}
                                                        className="mt-2 text-xs px-2 py-0.5 rounded transition-all opacity-0 group-hover:opacity-100"
                                                        style={
                                                            confirmDeleteId === entry.id
                                                                ? {
                                                                      color: '#d46a6a',
                                                                      backgroundColor: 'rgba(184,79,79,0.1)',
                                                                      border: '1px solid rgba(184,79,79,0.2)',
                                                                      opacity: 1,
                                                                  }
                                                                : { color: '#5a5549' }
                                                        }
                                                    >
                                                        {confirmDeleteId === entry.id ? 'Confirm?' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TimeLog;
