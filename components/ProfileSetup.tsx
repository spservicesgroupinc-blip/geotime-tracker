
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileSetupProps {
  onProfileSave: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileSave }) => {
  const [name, setName] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wage = parseFloat(hourlyWage);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (isNaN(wage) || wage <= 0) {
      setError('Please enter a valid hourly rate.');
      return;
    }
    setError('');
    onProfileSave({ name: name.trim(), hourlyWage: wage });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-navy-950 px-4" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: '480px', height: '480px', background: 'radial-gradient(circle, rgba(201,160,58,0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '20%', right: '25%', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(85,133,181,0.04) 0%, transparent 70%)', borderRadius: '50%' }}></div>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Top decorative rule */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(201,160,58,0.5), transparent)', marginBottom: '2rem' }}></div>

        <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-gold-400 mb-2">
              GeoTime Tracker
            </h1>
            <p className="text-sm text-slate-500 tracking-wide">
              Set up your profile to begin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                style={{ backgroundColor: '#161930', border: '1px solid #1d2140' }}
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,160,58,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(201,160,58,0.2)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#1d2140'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Hourly rate field */}
            <div>
              <label htmlFor="hourly-wage" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                Hourly Rate
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">$</span>
                <input
                  id="hourly-wage"
                  type="number"
                  required
                  className="w-full pl-8 pr-4 py-3 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                  style={{ backgroundColor: '#161930', border: '1px solid #1d2140' }}
                  placeholder="0.00"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(e.target.value)}
                  min="0.01"
                  step="0.01"
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,160,58,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(201,160,58,0.2)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1d2140'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2.5 rounded-lg text-sm text-crimson-400" style={{ backgroundColor: 'rgba(28,9,9,0.7)', border: '1px solid rgba(184,79,79,0.25)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 text-sm font-semibold rounded-lg transition-all duration-200 tracking-wide focus:outline-none"
              style={{ backgroundColor: '#c9a03a', color: '#090c17' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#dfc05e'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9a03a'; }}
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Bottom decorative rule */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(201,160,58,0.5), transparent)', marginTop: '2rem' }}></div>
      </div>
    </div>
  );
};

export default ProfileSetup;
