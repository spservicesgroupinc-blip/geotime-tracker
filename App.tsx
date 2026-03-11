import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserProfile, TimeEntry, Coordinates } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import ProfileSetup from './components/ProfileSetup';
import TimeLog from './components/TimeLog';
import { getCurrentPosition } from './services/locationService';
import { generatePayReport } from './services/pdfService';

const App: React.FC = () => {
    const isOnline = useOnlineStatus();
    const [profile, setProfile] = useLocalStorage<UserProfile | null>('user-profile', null);
    const [timeEntries, setTimeEntries] = useLocalStorage<TimeEntry[]>('time-entries', []);
    const [projects, setProjects] = useLocalStorage<string[]>('projects', ['General']);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<string>(projects[0] || 'General');
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [now, setNow] = useState(new Date());
    const addInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isAddingProject && addInputRef.current) {
            addInputRef.current.focus();
        }
    }, [isAddingProject]);

    const isClockedIn = useMemo(() => {
        const last = timeEntries.length > 0 ? timeEntries[timeEntries.length - 1] : null;
        return !!last && !last.clockOut;
    }, [timeEntries]);

    const currentEntry = useMemo(() => {
        if (!isClockedIn) return null;
        return timeEntries[timeEntries.length - 1];
    }, [isClockedIn, timeEntries]);

    const currentClockedInProject = currentEntry?.projectName || 'General';

    const elapsed = useMemo(() => {
        if (!currentEntry) return null;
        const ms = now.getTime() - new Date(currentEntry.clockIn).getTime();
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, [currentEntry, now]);

    const stats = useMemo(() => {
        const today = now.toLocaleDateString();
        let todayH = 0, totalH = 0;
        for (const e of timeEntries) {
            if (!e.clockOut) continue;
            const h = (new Date(e.clockOut).getTime() - new Date(e.clockIn).getTime()) / 3600000;
            totalH += h;
            if (new Date(e.clockIn).toLocaleDateString() === today) todayH += h;
        }
        const wage = profile?.hourlyWage || 0;
        return {
            todayHours: todayH,
            todayEarnings: todayH * wage,
            totalHours: totalH,
            totalEarnings: totalH * wage,
        };
    }, [timeEntries, now, profile]);

    const handleClockToggle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const location: Coordinates = await getCurrentPosition();
            if (isClockedIn) {
                const last = timeEntries[timeEntries.length - 1];
                const updated: TimeEntry = {
                    ...last,
                    clockOut: new Date().toISOString(),
                    clockOutLocation: location,
                };
                setTimeEntries([...timeEntries.slice(0, -1), updated]);
            } else {
                const entry: TimeEntry = {
                    id: new Date().toISOString(),
                    projectName: selectedProject,
                    clockIn: new Date().toISOString(),
                    clockInLocation: location,
                };
                setTimeEntries([...timeEntries, entry]);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitchJob = async () => {
        if (!isClockedIn || selectedProject === currentClockedInProject) return;
        if (!window.confirm(`Switch from "${currentClockedInProject}" to "${selectedProject}"?`)) return;
        setIsLoading(true);
        setError(null);
        try {
            const location: Coordinates = await getCurrentPosition();
            const ts = new Date().toISOString();
            const last = timeEntries[timeEntries.length - 1];
            const closed: TimeEntry = { ...last, clockOut: ts, clockOutLocation: location };
            const next: TimeEntry = { id: ts, projectName: selectedProject, clockIn: ts, clockInLocation: location };
            setTimeEntries([...timeEntries.slice(0, -1), closed, next]);
        } catch (err: any) {
            setError(err.message || 'Failed to switch job.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProject = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newProjectName.trim();
        if (name && !projects.includes(name)) {
            setProjects([...projects, name]);
            setSelectedProject(name);
        }
        setNewProjectName('');
        setIsAddingProject(false);
    };

    const handleDeleteProject = (proj: string) => {
        if (projects.length <= 1) return;
        if (!window.confirm(`Remove project "${proj}"? Past entries keep this name.`)) return;
        const updated = projects.filter(p => p !== proj);
        setProjects(updated);
        if (selectedProject === proj) setSelectedProject(updated[0]);
    };

    const handleDeleteEntry = (id: string) => {
        setTimeEntries(timeEntries.filter(e => e.id !== id));
    };

    const handleResetProfile = () => {
        if (window.confirm('Reset profile? All time entries will be cleared.')) {
            setProfile(null);
            setTimeEntries([]);
        }
    };

    if (!profile) return <ProfileSetup onProfileSave={setProfile} />;

    const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateDisplay = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            {/* Offline Banner */}
            {!isOnline && (
                <div className="offline-banner bg-slate-800 text-white text-center text-xs font-medium py-1.5 px-4 sticky top-0 z-30">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                        You're offline — data is saved locally
                    </span>
                </div>
            )}
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-600">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4.5 h-4.5 text-white" strokeWidth={2.5}>
                                <circle cx="12" cy="12" r="9" />
                                <path strokeLinecap="round" d="M12 7v5l3 3" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold tracking-wide text-slate-900">GeoTime</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">{profile.name}</span>
                        <span className="text-slate-300 select-none">·</span>
                        <button
                            onClick={handleResetProfile}
                            className="text-xs text-slate-400 hover:text-red-600 transition-colors font-medium"
                        >
                            Switch Profile
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-5 py-6">
                <div className="flex flex-col md:flex-row gap-5">

                    {/* ── Left Panel ── */}
                    <div className="md:w-80 flex-shrink-0 space-y-4">

                        {/* Clock Card — dark navy like the screenshot's top cards */}
                        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: '#0f172a' }}>

                            {/* Status / Time display */}
                            <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid #1e293b' }}>
                                {isClockedIn ? (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse bg-green-500" />
                                            <span className="text-xs font-semibold tracking-widest uppercase text-green-400">
                                                Active — {currentClockedInProject}
                                            </span>
                                        </div>
                                        <div className="font-mono text-5xl font-semibold tracking-tight leading-none text-white elapsed-tick">
                                            {elapsed}
                                        </div>
                                        <div className="mt-2 text-sm text-slate-400">
                                            Since{' '}
                                            <span className="text-slate-300">
                                                {new Date(currentEntry!.clockIn).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
                                            <span className="text-xs text-slate-400 tracking-widest uppercase font-medium">
                                                Not clocked in
                                            </span>
                                        </div>
                                        <div className="font-mono text-4xl font-medium text-white tracking-tight leading-none">
                                            {timeDisplay}
                                        </div>
                                        <div className="mt-1.5 text-sm text-slate-400">{dateDisplay}</div>
                                    </div>
                                )}
                            </div>

                            {/* Project selector */}
                            <div className="px-6 py-4" style={{ borderBottom: '1px solid #1e293b' }}>
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-semibold">
                                    {isClockedIn ? 'Switch Project' : 'Select Project'}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {projects.map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setSelectedProject(p)}
                                            className={`group relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                                                selectedProject === p
                                                    ? 'bg-red-600 text-white'
                                                    : 'text-slate-300 hover:text-white'
                                            }`}
                                            style={selectedProject !== p ? { backgroundColor: '#1e293b' } : undefined}
                                        >
                                            {p}
                                            {projects.length > 1 && (
                                                <span
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(p); }}
                                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full hidden group-hover:flex items-center justify-center text-[10px] cursor-pointer transition-colors bg-slate-600 text-slate-300 hover:bg-red-500 hover:text-white"
                                                >
                                                    ×
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    {isAddingProject ? (
                                        <form onSubmit={handleAddProject} className="flex items-center gap-1.5">
                                            <input
                                                ref={addInputRef}
                                                type="text"
                                                value={newProjectName}
                                                onChange={e => setNewProjectName(e.target.value)}
                                                onBlur={() => {
                                                    if (!newProjectName.trim()) setIsAddingProject(false);
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Escape') {
                                                        setIsAddingProject(false);
                                                        setNewProjectName('');
                                                    }
                                                }}
                                                placeholder="Project name"
                                                className="px-3 py-1.5 rounded-full text-sm text-white placeholder-slate-500 focus:outline-none transition-colors w-32"
                                                style={{ backgroundColor: '#1e293b', border: '1px solid rgba(220,38,38,0.4)' }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newProjectName.trim()}
                                                className="px-3 py-1.5 rounded-full text-xs font-semibold disabled:opacity-40 transition-opacity bg-red-600 text-white"
                                            >
                                                Add
                                            </button>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => setIsAddingProject(true)}
                                            className="px-3.5 py-1.5 rounded-full text-sm text-slate-400 border border-dashed border-slate-600 hover:border-slate-400 hover:text-white transition-all duration-150"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Clock button */}
                            <div className="p-5 space-y-3">
                                <button
                                    onClick={handleClockToggle}
                                    disabled={isLoading}
                                    className={`relative w-full py-5 rounded-xl text-lg font-bold tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-60 ${
                                        isClockedIn ? 'text-white clock-out-pulse bg-red-600 hover:bg-red-700' : 'clock-in-pulse bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                            </svg>
                                            Locating...
                                        </span>
                                    ) : isClockedIn ? '■  CLOCK OUT' : '▶  CLOCK IN'}
                                </button>

                                {isClockedIn && selectedProject !== currentClockedInProject && (
                                    <button
                                        onClick={handleSwitchJob}
                                        disabled={isLoading}
                                        className="w-full py-3 rounded-xl text-sm font-medium text-slate-300 border border-slate-600 hover:border-slate-400 hover:text-white transition-all duration-150 disabled:opacity-50"
                                    >
                                        Switch to &quot;{selectedProject}&quot;
                                    </button>
                                )}

                                {error && (
                                    <div className="px-4 py-3 rounded-xl text-sm bg-red-500/10 border border-red-500/25 text-red-400">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Earnings Summary — white card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-4 font-semibold">
                                Earnings Summary
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div>
                                    <div className="text-xs text-slate-400 mb-1.5">Today</div>
                                    <div className="font-mono text-2xl font-semibold text-slate-900 leading-none">
                                        {stats.todayHours.toFixed(1)}
                                        <span className="text-sm text-slate-400 ml-1">h</span>
                                    </div>
                                    <div className="font-mono text-base font-semibold mt-1 text-green-600">
                                        ${stats.todayEarnings.toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 mb-1.5">All Time</div>
                                    <div className="font-mono text-2xl font-semibold text-slate-900 leading-none">
                                        {stats.totalHours.toFixed(1)}
                                        <span className="text-sm text-slate-400 ml-1">h</span>
                                    </div>
                                    <div className="font-mono text-base font-semibold mt-1 text-green-600">
                                        ${stats.totalEarnings.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                                @ ${profile.hourlyWage.toFixed(2)} / hr
                            </div>
                        </div>

                        {/* Pay Report */}
                        <button
                            onClick={() => generatePayReport(profile, timeEntries)}
                            disabled={timeEntries.length === 0}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-700"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Pay Report
                        </button>
                    </div>

                    {/* ── Time Log ── */}
                    <div className="flex-1 min-w-0">
                        <TimeLog
                            timeEntries={timeEntries}
                            profile={profile}
                            onDeleteEntry={handleDeleteEntry}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
