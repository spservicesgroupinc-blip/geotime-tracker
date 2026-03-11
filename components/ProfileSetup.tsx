import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileSetupProps {
    onProfileSave: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileSave }) => {
    const [name, setName] = useState('');
    const [hourlyWage, setHourlyWage] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState<1 | 2>(1);

    const handleNameNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Your name is required.');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const wage = parseFloat(hourlyWage);
        if (isNaN(wage) || wage <= 0) {
            setError('Enter a valid hourly rate.');
            return;
        }
        setError('');
        onProfileSave({ name: name.trim(), hourlyWage: wage });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">

            <div className="relative w-full max-w-md">
                {/* Logo area */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 bg-red-600 shadow-lg">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="w-8 h-8 text-white"
                            strokeWidth={2.5}
                        >
                            <circle cx="12" cy="12" r="9" />
                            <path strokeLinecap="round" d="M12 7v5l3 3" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        GeoTime
                    </h1>
                    <p className="text-sm mt-1.5 text-slate-400 font-medium">
                        Time · Jobs · Payroll
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-200">
                    {/* Step progress bar */}
                    <div className="flex" style={{ height: '3px' }}>
                        <div
                            className="transition-all duration-500 bg-red-600"
                            style={{ width: step >= 1 ? '50%' : '0%' }}
                        />
                        <div
                            className="transition-all duration-500 bg-red-600"
                            style={{ width: step >= 2 ? '50%' : '0%' }}
                        />
                        <div className="flex-1 bg-slate-100" />
                    </div>

                    <div className="p-8">
                        {step === 1 ? (
                            <form onSubmit={handleNameNext}>
                                <div className="mb-7">
                                    <div className="text-[10px] tracking-widest uppercase mb-1 text-slate-400 font-semibold">
                                        Step 1 of 2
                                    </div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        What&apos;s your name?
                                    </h2>
                                    <p className="text-sm mt-1 text-slate-400">
                                        This appears on your pay reports.
                                    </p>
                                </div>

                                <div className="mb-5">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Full name"
                                        className="w-full px-4 py-3.5 rounded-xl text-base focus:outline-none transition-all bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                    />
                                </div>

                                {error && (
                                    <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded-xl text-base font-semibold tracking-wide transition-all duration-150 bg-red-600 text-white hover:bg-red-700"
                                >
                                    CONTINUE →
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-7">
                                    <div className="text-[10px] tracking-widest uppercase mb-1 text-slate-400 font-semibold">
                                        Step 2 of 2
                                    </div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Your hourly rate
                                    </h2>
                                    <p className="text-sm mt-1 text-slate-400">
                                        Used to calculate earnings in reports.
                                    </p>
                                </div>

                                <div className="mb-5">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium select-none text-slate-400">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            autoFocus
                                            value={hourlyWage}
                                            onChange={e => setHourlyWage(e.target.value)}
                                            placeholder="0.00"
                                            min="0.01"
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-3.5 rounded-xl text-base focus:outline-none transition-all bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); setError(''); }}
                                        className="px-5 py-3.5 rounded-xl font-medium transition-all duration-150 border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                    >
                                        ←
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 rounded-xl text-base font-semibold tracking-wide transition-all duration-150 bg-red-600 text-white hover:bg-red-700"
                                    >
                                        START TRACKING
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs mt-6 tracking-wide text-slate-400">
                    All data stored locally on your device.
                </p>
            </div>
        </div>
    );
};

export default ProfileSetup;
