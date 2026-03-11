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
            className="inline-flex items-center gap-1 transition-colors text-xs text-slate-400 hover:text-red-600"
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
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">Time Log</h3>
                {sorted.length > 0 && (
                    <span className="text-xs text-slate-400 tabular-nums font-medium">
                        {sorted.length} {sorted.length === 1 ? 'entry' : 'entries'}
                    </span>
                )}
            </div>

            {/* Empty state */}
            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-slate-50 border border-slate-200">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8 text-slate-300">
                            <circle cx="12" cy="12" r="9" />
                            <path strokeLinecap="round" d="M12 7v5l3 3" />
                        </svg>
                    </div>
                    <p className="font-medium text-slate-500">No time entries yet</p>
                    <p className="text-sm mt-1.5 text-slate-400">
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
                                <div className="px-6 py-3 flex items-center justify-between sticky top-14 bg-slate-50 border-b border-slate-100 border-t border-t-slate-100">
                                    <span className="text-sm font-semibold text-slate-700">{date}</span>
                                    {dayTotal > 0 && (
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="font-mono text-slate-500">{dayTotal.toFixed(2)}h</span>
                                            <span className="font-mono font-semibold text-green-600">
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
                                            className="group px-6 py-4 fade-up transition-colors duration-100 border-b border-slate-100 hover:bg-slate-50"
                                            style={{ animationDelay: `${idx * 25}ms` }}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Status bar */}
                                                <div
                                                    className="w-0.5 self-stretch rounded-full mt-0.5 flex-shrink-0"
                                                    style={{ backgroundColor: active ? '#22c55e' : '#e2e8f0' }}
                                                />

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2.5">
                                                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                                                            {entry.projectName || 'General'}
                                                        </span>
                                                        {active && (
                                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                                                                <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-500 flex-shrink-0" />
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-300" style={{ width: '16px' }}>
                                                                In
                                                            </span>
                                                            <span className="font-mono text-sm text-slate-700">
                                                                {new Date(entry.clockIn).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                            <LocationLink location={entry.clockInLocation} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-300" style={{ width: '16px' }}>
                                                                Out
                                                            </span>
                                                            {entry.clockOut ? (
                                                                <>
                                                                    <span className="font-mono text-sm text-slate-700">
                                                                        {new Date(entry.clockOut).toLocaleTimeString([], {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </span>
                                                                    <LocationLink location={entry.clockOutLocation} />
                                                                </>
                                                            ) : (
                                                                <span className="text-slate-300">—</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: stats + delete */}
                                                <div className="text-right flex-shrink-0 pl-2">
                                                    {duration > 0 ? (
                                                        <>
                                                            <div className="font-mono text-sm font-medium text-slate-700 tabular-nums">
                                                                {duration.toFixed(2)}h
                                                            </div>
                                                            <div className="font-mono text-sm font-semibold tabular-nums text-green-600">
                                                                ${pay.toFixed(2)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-xs italic text-slate-400">
                                                            Active
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteClick(entry.id)}
                                                        className={`mt-2 text-xs px-2 py-0.5 rounded transition-all ${
                                                            confirmDeleteId === entry.id
                                                                ? 'opacity-100 text-red-600 bg-red-50 border border-red-200'
                                                                : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600'
                                                        }`}
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
