import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserProfile, TimeEntry, Coordinates } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import ProfileSetup from './components/ProfileSetup';
import TimeLog from './components/TimeLog';
import { getCurrentPosition } from './services/locationService';
import { generatePayReport } from './services/pdfService';

const App: React.FC = () => {
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
        <div className="min-h-screen bg-void-950 text-cream-200">
            {/* Header */}
            <header className="border-b border-void-700 bg-void-900/80 backdrop-blur-sm sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#c9a03a' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth={2.5} style={{ color: '#171717' }}>
                                <circle cx="12" cy="12" r="9" />
                                <path strokeLinecap="round" d="M12 7v5l3 3" />
                            </svg>
                        </div>
                        <span className="font-display text-xl tracking-widest text-cream-200">GEOTIME</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-cream-500">{profile.name}</span>
                        <span className="text-void-400 select-none">·</span>
                        <button
                            onClick={handleResetProfile}
                            className="text-xs text-void-300 hover:text-cream-300 transition-colors tracking-widest uppercase"
                        >
                            Switch Profile
                        </button>
                    </div>
                </div>
                <div className="gold-line opacity-40" />
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-5 py-6">
                <div className="flex flex-col md:flex-row gap-5">

                    {/* ── Left Panel ── */}
                    <div className="md:w-80 flex-shrink-0 space-y-4">

                        {/* Clock Card */}
                        <div className="bg-void-900 border border-void-700 rounded-2xl overflow-hidden">

                            {/* Status / Time display */}
                            <div className="px-6 pt-6 pb-5 border-b border-void-700">
                                {isClockedIn ? (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                                                style={{ backgroundColor: '#c9a03a' }}
                                            />
                                            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#c9a03a' }}>
                                                Active — {currentClockedInProject}
                                            </span>
                                        </div>
                                        <div
                                            className="font-mono text-5xl font-semibold tracking-tight leading-none elapsed-tick"
                                            style={{ color: '#e8e4d8' }}
                                        >
                                            {elapsed}
                                        </div>
                                        <div className="mt-2 text-sm" style={{ color: '#5a5549' }}>
                                            Since{' '}
                                            <span style={{ color: '#857f6f' }}>
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
                                            <span className="w-2 h-2 rounded-full bg-void-500 flex-shrink-0" />
                                            <span className="text-xs text-void-300 tracking-widest uppercase">
                                                Not clocked in
                                            </span>
                                        </div>
                                        <div className="font-mono text-4xl font-medium text-cream-200 tracking-tight leading-none">
                                            {timeDisplay}
                                        </div>
                                        <div className="mt-1.5 text-sm text-void-300">{dateDisplay}</div>
                                    </div>
                                )}
                            </div>

                            {/* Project selector */}
                            <div className="px-6 py-4 border-b border-void-700">
                                <div className="text-[10px] text-void-300 uppercase tracking-widest mb-3 font-medium">
                                    {isClockedIn ? 'Switch Project' : 'Select Project'}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {projects.map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setSelectedProject(p)}
                                            className={`group relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                                                selectedProject === p
                                                    ? 'text-void-950'
                                                    : 'bg-void-800 text-cream-500 hover:bg-void-700 hover:text-cream-300'
                                            }`}
                                            style={selectedProject === p ? { backgroundColor: '#c9a03a' } : undefined}
                                        >
                                            {p}
                                            {projects.length > 1 && (
                                                <span
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(p); }}
                                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full hidden group-hover:flex items-center justify-center text-[10px] cursor-pointer transition-colors"
                                                    style={{ backgroundColor: '#4b4b4b', color: '#857f6f' }}
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = '#b84f4f';
                                                        (e.currentTarget as HTMLElement).style.color = '#f5f0e8';
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = '#4b4b4b';
                                                        (e.currentTarget as HTMLElement).style.color = '#857f6f';
                                                    }}
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
                                                className="px-3 py-1.5 rounded-full text-sm bg-void-800 text-cream-200 placeholder-void-300 focus:outline-none transition-colors w-32"
                                                style={{ border: '1px solid rgba(201,160,58,0.4)' }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newProjectName.trim()}
                                                className="px-3 py-1.5 rounded-full text-xs font-semibold disabled:opacity-40 transition-opacity"
                                                style={{ backgroundColor: '#c9a03a', color: '#171717' }}
                                            >
                                                Add
                                            </button>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => setIsAddingProject(true)}
                                            className="px-3.5 py-1.5 rounded-full text-sm text-void-300 border border-dashed border-void-500 hover:border-void-400 hover:text-cream-500 transition-all duration-150"
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
                                    className={`relative w-full py-5 rounded-xl font-display text-2xl tracking-widest transition-all duration-200 focus:outline-none disabled:opacity-60 ${
                                        isClockedIn ? 'text-cream-200 clock-out-pulse' : 'clock-in-pulse'
                                    }`}
                                    style={
                                        isClockedIn
                                            ? { backgroundColor: '#b84f4f' }
                                            : { backgroundColor: '#c9a03a', color: '#171717' }
                                    }
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
                                        className="w-full py-3 rounded-xl text-sm font-medium text-cream-400 border border-void-600 hover:border-void-400 hover:text-cream-200 transition-all duration-150 disabled:opacity-50"
                                    >
                                        Switch to &quot;{selectedProject}&quot;
                                    </button>
                                )}

                                {error && (
                                    <div
                                        className="px-4 py-3 rounded-xl text-sm"
                                        style={{
                                            backgroundColor: 'rgba(184,79,79,0.1)',
                                            border: '1px solid rgba(184,79,79,0.25)',
                                            color: '#d46a6a',
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Earnings Summary */}
                        <div className="bg-void-900 border border-void-700 rounded-2xl p-6">
                            <div className="text-[10px] text-void-300 uppercase tracking-widest mb-4 font-medium">
                                Earnings Summary
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div>
                                    <div className="text-xs text-void-300 mb-1.5">Today</div>
                                    <div className="font-mono text-2xl font-semibold text-cream-200 leading-none">
                                        {stats.todayHours.toFixed(1)}
                                        <span className="text-sm text-void-300 ml-1">h</span>
                                    </div>
                                    <div className="font-mono text-base font-medium mt-1" style={{ color: '#c9a03a' }}>
                                        ${stats.todayEarnings.toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-void-300 mb-1.5">All Time</div>
                                    <div className="font-mono text-2xl font-semibold text-cream-200 leading-none">
                                        {stats.totalHours.toFixed(1)}
                                        <span className="text-sm text-void-300 ml-1">h</span>
                                    </div>
                                    <div className="font-mono text-base font-medium mt-1" style={{ color: '#c9a03a' }}>
                                        ${stats.totalEarnings.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-void-700 text-xs text-void-300">
                                @ ${profile.hourlyWage.toFixed(2)} / hr
                            </div>
                        </div>

                        {/* Pay Report */}
                        <button
                            onClick={() => generatePayReport(profile, timeEntries)}
                            disabled={timeEntries.length === 0}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                color: '#c9a03a',
                                border: '1px solid rgba(201,160,58,0.25)',
                            }}
                            onMouseEnter={e => {
                                if (timeEntries.length > 0) {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,160,58,0.5)';
                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201,160,58,0.05)';
                                }
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,160,58,0.25)';
                                (e.currentTarget as HTMLElement).style.backgroundColor = '';
                            }}
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
