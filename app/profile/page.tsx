'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, setSession, updateUser, type User } from '@/lib/store';
import Navbar from '@/components/Navbar';

const BADGE_COLORS: Record<string, string> = {
  'Design Ally': '#0d9f8f',
  'Fast Responder': '#f59e0b',
  'Top Mentor': '#8b5cf6',
  'Code Rescuer': '#ef4444',
  'Bug Hunter': '#3b82f6',
  'Community Voice': '#10b981',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/auth'); return; }
    setUser(s);
    setName(s.name);
    setLocation(s.location);
    setSkills(s.skills.join(', '));
    setInterests(s.interests.join(', '));
  }, [router]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const updatedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
    const updatedInterests = interests.split(',').map(s => s.trim()).filter(Boolean);
    await updateUser(user.id, { name, location, skills: updatedSkills, interests: updatedInterests });
    const updated = { ...user, name, location, skills: updatedSkills, interests: updatedInterests };
    setSession(updated);
    setUser(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) return null;

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="dark-card p-8 mb-8">
          <p className="label mb-2" style={{ color: '#9ca3af' }}>PROFILE</p>
          <h1 className="text-4xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{user.role} • {user.location}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Public profile */}
          <div className="card p-7">
            <p className="label mb-2">PUBLIC PROFILE</p>
            <h2 className="text-2xl font-bold text-[#0f1a18] mb-5">Skills and reputation</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-500">Trust score</span>
                <span className="text-sm font-bold text-[#0f1a18]">{user.trustScore}%</span>
              </div>
              <div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#0d9f8f]"
                    style={{ width: `${user.trustScore}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-500">Contributions</span>
                <span className="text-sm font-bold text-[#0f1a18]">{user.contributions}</span>
              </div>
              <div className="py-3 border-b border-gray-50">
                <p className="text-sm text-gray-500 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>
              <div className="py-3">
                <p className="text-sm text-gray-500 mb-2">Badges</p>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map(b => (
                    <span key={b} className="tag text-xs"
                      style={{ backgroundColor: `${BADGE_COLORS[b] || '#0d9f8f'}15`, color: BADGE_COLORS[b] || '#0d9f8f' }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Edit profile */}
          <div className="card p-7">
            <p className="label mb-2">EDIT PROFILE</p>
            <h2 className="text-2xl font-bold text-[#0f1a18] mb-5">Update your identity</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Skills</label>
                <input value={skills} onChange={e => setSkills(e.target.value)}
                  placeholder="Figma, UI/UX, HTML/CSS, Career Guidance"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Interests</label>
                <input value={interests} onChange={e => setInterests(e.target.value)}
                  placeholder="Hackathons, UI/UX, Community Building"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="teal-btn w-full py-3 text-sm disabled:opacity-60">
                {saved ? 'Profile saved ✓' : saving ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
