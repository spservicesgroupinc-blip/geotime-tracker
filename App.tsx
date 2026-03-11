import React, { useState, useMemo } from 'react';
import { UserProfile, TimeEntry, Coordinates } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import ProfileSetup from './components/ProfileSetup';
import TimeLog from './components/TimeLog';
import { getCurrentPosition } from './services/locationService';
import { generatePayReport } from './services/pdfService';

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const App: React.FC = () => {
    const [profile, setProfile] = useLocalStorage<UserProfile | null>('user-profile', null);
    const [timeEntries, setTimeEntries] = useLocalStorage<TimeEntry[]>('time-entries', []);
    const [projects, setProjects] = useLocalStorage<string[]>('projects', ['General']);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedProject, setSelectedProject] = useState<string>(projects[0] || 'General');

    const isClockedIn = useMemo(() => {
        const lastEntry = timeEntries.length > 0 ? timeEntries[timeEntries.length - 1] : null;
        return !!lastEntry && !lastEntry.clockOut;
    }, [timeEntries]);

    const currentClockedInProject = useMemo(() => {
        if (!isClockedIn) return null;
        const lastEntry = timeEntries[timeEntries.length - 1];
        return lastEntry.projectName || 'General';
    }, [isClockedIn, timeEntries]);

    const handleClockToggle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const location: Coordinates = await getCurrentPosition();
            if (isClockedIn) {
                const lastEntry = timeEntries[timeEntries.length - 1];
                const updatedEntry: TimeEntry = {
                    ...lastEntry,
                    clockOut: new Date().toISOString(),
                    clockOutLocation: location,
                };
                setTimeEntries([...timeEntries.slice(0, timeEntries.length - 1), updatedEntry]);
            } else {
                const newEntry: TimeEntry = {
                    id: new Date().toISOString(),
                    projectName: selectedProject,
                    clockIn: new Date().toISOString(),
                    clockInLocation: location,
                };
                setTimeEntries([...timeEntries, newEntry]);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitchJob = async () => {
        if (!isClockedIn || selectedProject === currentClockedInProject) return;
        if (!window.confirm(`Switch from "${currentClockedInProject}" to "${selectedProject}"? This will clock you out and back in immediately.`)) return;
        setIsLoading(true);
        setError(null);
        try {
            const location: Coordinates = await getCurrentPosition();
            const now = new Date().toISOString();
            const lastEntry = timeEntries[timeEntries.length - 1];
            const closedEntry: TimeEntry = { ...lastEntry, clockOut: now, clockOutLocation: location };
            const newEntry: TimeEntry = { id: now, projectName: selectedProject, clockIn: now, clockInLocation: location };
            setTimeEntries([...timeEntries.slice(0, timeEntries.length - 1), closedEntry, newEntry]);
        } catch (err: any) {
            setError(err.message || 'Failed to switch job.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetProfile = () => {
        if (window.confirm('Reset your profile? All time entries will be cleared.')) {
            setProfile(null);
            setTimeEntries([]);
        }
    };

    const handleAddProject = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newProjectName.trim();
        if (trimmed && !projects.includes(trimmed)) {
            setProjects([...projects, trimmed]);
            setNewProjectName('');
            if (projects.length === 0) setSelectedProject(trimmed);
        }
    };

    const handleDeleteProject = (proj: string) => {
        if (window.confirm(`Delete project "${proj}"? Past entries will retain this name.`)) {
            const updated = projects.filter(p => p !== proj);
            setProjects(updated);
            if (selectedProject === proj && updated.length > 0) setSelectedProject(updated[0]);
            else if (selectedProject === proj) setSelectedProject('General');
        }
    };

    if (!profile) {
        return <ProfileSetup onProfileSave={setProfile} />;
    }

    return (
        <div className="min-h-screen bg-navy-950 text-slate-200">
            <header className="bg-navy-900 border-b border-navy-700 px-4 py-4 shadow-lg">
                <div className="container mx-auto flex items-center justify-between max-w-6xl">
                    <h1 className="font-display text-2xl font-bold text-gold-400 tracking-wide">
                        GeoTime Tracker
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-300">{profile.name}</span>
                        <span className="text-slate-700 select-none">|</span>
                        <button
                            onClick={handleResetProfile}
                            className="text-xs text-slate-500 hover:text-gold-400 transition-colors duration-200 tracking-widest uppercase"
                        >
                            Switch Profile
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 max-w-6xl">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-1">

                        {/* Time Clock Card */}
                        <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-xl">
                            <h2 className="font-display text-lg font-semibold text-gold-400 mb-5 tracking-wide">
                                Time Clock
                            </h2>

                            <div className="mb-5">
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                                    {isClockedIn ? 'Switch Project' : 'Select Project'}
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedProject}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-navy-800 border border-navy-700 text-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors cursor-pointer appearance-none pr-8"
                                    >
                                        {projects.map(p => (
                                            <option key={p} value={p} style={{ backgroundColor: '#161930' }}>{p}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <button
                                onClick={handleClockToggle}
                                disabled={isLoading}
                                className={`w-full flex items-center justify-center px-6 py-3.5 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 disabled:opacity-50 disabled:cursor-wait ${
                                    isClockedIn
                                        ? 'bg-crimson-500 hover:bg-crimson-400 text-white focus:ring-crimson-500'
                                        : 'bg-gold-500 hover:bg-gold-400 text-navy-950 focus:ring-gold-500'
                                }`}
                            >
                                <ClockIcon />
                                {isLoading ? 'Locating...' : (isClockedIn ? 'Clock Out' : 'Clock In')}
                            </button>

                            {isClockedIn && selectedProject !== currentClockedInProject && (
                                <button
                                    onClick={handleSwitchJob}
                                    disabled={isLoading}
                                    className="w-full mt-3 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-steel-400 border border-steel-500/40 rounded-lg hover:bg-navy-800 hover:border-steel-400 transition-all duration-200 disabled:opacity-50"
                                >
                                    Switch to &quot;{selectedProject}&quot;
                                </button>
                            )}

                            {isClockedIn && (
                                <div className="mt-4 p-3.5 rounded-lg border" style={{ backgroundColor: 'rgba(28,19,7,0.6)', borderColor: 'rgba(201,160,58,0.2)' }}>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse flex-shrink-0"></span>
                                        <p className="text-sm font-medium text-gold-300">{currentClockedInProject}</p>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1 ml-4">
                                        Since {new Date(timeEntries[timeEntries.length - 1].clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="mt-3 px-3 py-2 rounded-lg border" style={{ backgroundColor: 'rgba(28,9,9,0.6)', borderColor: 'rgba(184,79,79,0.25)' }}>
                                    <p className="text-sm text-crimson-400">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Project Management */}
                        <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-xl">
                            <h2 className="font-display text-lg font-semibold text-gold-400 mb-5 tracking-wide">
                                Projects
                            </h2>
                            <form onSubmit={handleAddProject} className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="New project name"
                                    className="flex-1 min-w-0 px-3 py-2 bg-navy-800 border border-navy-700 text-slate-200 placeholder-slate-600 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!newProjectName.trim()}
                                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-navy-700 border border-navy-600 rounded-lg hover:bg-navy-600 hover:border-navy-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gold-500"
                                >
                                    Add
                                </button>
                            </form>
                            <ul className="divide-y divide-navy-700 max-h-48 overflow-y-auto">
                                {projects.map(proj => (
                                    <li key={proj} className="py-2.5 flex justify-between items-center group">
                                        <span className={`text-sm transition-colors ${selectedProject === proj ? 'text-gold-400 font-medium' : 'text-slate-400'}`}>
                                            {proj}
                                        </span>
                                        {projects.length > 1 && (
                                            <button
                                                onClick={() => handleDeleteProject(proj)}
                                                className="text-navy-600 hover:text-crimson-400 p-1 opacity-0 group-hover:opacity-100 transition-all duration-150"
                                                title="Delete project"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Reports */}
                        <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 shadow-xl">
                            <h2 className="font-display text-lg font-semibold text-gold-400 mb-5 tracking-wide">
                                Reports
                            </h2>
                            <button
                                onClick={() => generatePayReport(profile, timeEntries)}
                                disabled={timeEntries.length === 0}
                                className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gold-400 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gold-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-gold-300"
                                style={{ borderColor: 'rgba(201,160,58,0.35)' }}
                                onMouseEnter={(e) => { if (timeEntries.length > 0) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(28,19,7,0.5)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
                            >
                                <DownloadIcon />
                                Download Pay Report
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <TimeLog timeEntries={timeEntries} profile={profile} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
