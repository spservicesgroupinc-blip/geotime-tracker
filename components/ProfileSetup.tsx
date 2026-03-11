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
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: '#0e0e0e' }}
        >
            {/* Background grid */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
                    backgroundSize: '56px 56px',
                }}
            />

            {/* Warm glow */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 700px 500px at 50% 55%, rgba(201,160,58,0.07), transparent)',
                }}
            />

            <div className="relative w-full max-w-md">
                {/* Logo area */}
                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                        style={{
                            backgroundColor: '#c9a03a',
                            boxShadow: '0 0 48px rgba(201,160,58,0.25)',
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="w-8 h-8"
                            strokeWidth={2.5}
                            style={{ color: '#171717' }}
                        >
                            <circle cx="12" cy="12" r="9" />
                            <path strokeLinecap="round" d="M12 7v5l3 3" />
                        </svg>
                    </div>
                    <h1 className="font-display text-5xl tracking-widest" style={{ color: '#e8e4d8' }}>
                        GEOTIME
                    </h1>
                    <p className="text-sm mt-1.5 tracking-widest uppercase" style={{ color: '#5a5549' }}>
                        Time · Jobs · Payroll
                    </p>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                        backgroundColor: '#171717',
                        border: '1px solid #313131',
                    }}
                >
                    {/* Step progress bar */}
                    <div className="flex" style={{ height: '2px' }}>
                        <div
                            className="transition-all duration-500"
                            style={{
                                width: step >= 1 ? '50%' : '0%',
                                backgroundColor: '#c9a03a',
                            }}
                        />
                        <div
                            className="transition-all duration-500"
                            style={{
                                width: step >= 2 ? '50%' : '0%',
                                backgroundColor: '#c9a03a',
                            }}
                        />
                        <div
                            style={{
                                flex: 1,
                                backgroundColor: '#282828',
                            }}
                        />
                    </div>

                    <div className="p-8">
                        {step === 1 ? (
                            <form onSubmit={handleNameNext}>
                                <div className="mb-7">
                                    <div className="text-[10px] tracking-widest uppercase mb-1" style={{ color: '#5a5549' }}>
                                        Step 1 of 2
                                    </div>
                                    <h2 className="text-xl font-semibold" style={{ color: '#e8e4d8' }}>
                                        What&apos;s your name?
                                    </h2>
                                    <p className="text-sm mt-1" style={{ color: '#5a5549' }}>
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
                                        className="w-full px-4 py-3.5 rounded-xl text-base focus:outline-none transition-all"
                                        style={{
                                            backgroundColor: '#1f1f1f',
                                            border: '1px solid #3b3b3b',
                                            color: '#e8e4d8',
                                        }}
                                        onFocus={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,160,58,0.5)';
                                        }}
                                        onBlur={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = '#3b3b3b';
                                        }}
                                    />
                                </div>

                                {error && (
                                    <div
                                        className="mb-4 px-4 py-3 rounded-xl text-sm"
                                        style={{
                                            backgroundColor: 'rgba(184,79,79,0.08)',
                                            border: '1px solid rgba(184,79,79,0.2)',
                                            color: '#d46a6a',
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded-xl font-display text-xl tracking-widest transition-all duration-150"
                                    style={{ backgroundColor: '#c9a03a', color: '#171717' }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = '#dfc05e';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = '#c9a03a';
                                    }}
                                >
                                    CONTINUE →
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-7">
                                    <div className="text-[10px] tracking-widest uppercase mb-1" style={{ color: '#5a5549' }}>
                                        Step 2 of 2
                                    </div>
                                    <h2 className="text-xl font-semibold" style={{ color: '#e8e4d8' }}>
                                        Your hourly rate
                                    </h2>
                                    <p className="text-sm mt-1" style={{ color: '#5a5549' }}>
                                        Used to calculate earnings in reports.
                                    </p>
                                </div>

                                <div className="mb-5">
                                    <div className="relative">
                                        <span
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium select-none"
                                            style={{ color: '#5a5549' }}
                                        >
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
                                            className="w-full pl-8 pr-4 py-3.5 rounded-xl text-base focus:outline-none transition-all"
                                            style={{
                                                backgroundColor: '#1f1f1f',
                                                border: '1px solid #3b3b3b',
                                                color: '#e8e4d8',
                                            }}
                                            onFocus={e => {
                                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,160,58,0.5)';
                                            }}
                                            onBlur={e => {
                                                (e.currentTarget as HTMLElement).style.borderColor = '#3b3b3b';
                                            }}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div
                                        className="mb-4 px-4 py-3 rounded-xl text-sm"
                                        style={{
                                            backgroundColor: 'rgba(184,79,79,0.08)',
                                            border: '1px solid rgba(184,79,79,0.2)',
                                            color: '#d46a6a',
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); setError(''); }}
                                        className="px-5 py-3.5 rounded-xl font-medium transition-all duration-150"
                                        style={{
                                            border: '1px solid #3b3b3b',
                                            color: '#857f6f',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = '#4b4b4b';
                                            (e.currentTarget as HTMLElement).style.color = '#e8e4d8';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = '#3b3b3b';
                                            (e.currentTarget as HTMLElement).style.color = '#857f6f';
                                        }}
                                    >
                                        ←
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 rounded-xl font-display text-xl tracking-widest transition-all duration-150"
                                        style={{ backgroundColor: '#c9a03a', color: '#171717' }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = '#dfc05e';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = '#c9a03a';
                                        }}
                                    >
                                        START TRACKING
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <p
                    className="text-center text-xs mt-6 tracking-wide"
                    style={{ color: '#4b4b4b' }}
                >
                    All data stored locally on your device.
                </p>
            </div>
        </div>
    );
};

export default ProfileSetup;
