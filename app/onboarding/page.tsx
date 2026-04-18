'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, setSession, updateUser, type User } from '@/lib/store';
import Navbar from '@/components/Navbar';

const SKILL_CHIPS = ['React', 'HTML/CSS', 'JavaScript', 'Figma', 'UI/UX', 'Python', 'Data Analysis', 'Git/GitHub', 'Career Guidance', 'Node.js'];
const INTEREST_CHIPS = ['Web Dev', 'Design', 'Data Science', 'Mentorship', 'Community', 'Hackathons', 'Open Source'];

function getAIHelpSuggestions(skills: string[]): string[] {
  const map: Record<string, string[]> = {
    'React': ['JavaScript', 'Node.js', 'Git/GitHub'],
    'Figma': ['UI/UX', 'Design Review', 'Prototyping'],
    'Python': ['Data Analysis', 'Machine Learning', 'SQL'],
    'HTML/CSS': ['Responsive Design', 'Web Dev', 'JavaScript'],
    'Career Guidance': ['Interview Prep', 'Resume Review', 'LinkedIn'],
  };
  const out: string[] = [];
  skills.forEach(s => map[s]?.forEach(r => { if (!out.includes(r)) out.push(r); }));
  return out.slice(0, 3);
}

function getAINeedSuggestions(interests: string[]): string[] {
  const map: Record<string, string[]> = {
    'Hackathons': ['Project Planning', 'Team Collaboration', 'Presentation Skills'],
    'Data Science': ['Python', 'Statistics', 'Data Visualization'],
    'Web Dev': ['Advanced React', 'Backend Integration', 'Testing'],
    'Design': ['User Research', 'Motion Design', 'Brand Strategy'],
  };
  const out: string[] = [];
  interests.forEach(i => map[i]?.forEach(r => { if (!out.includes(r)) out.push(r); }));
  return out.slice(0, 3);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/auth'); return; }
    setUser(s);
    setName(s.name);
    setLocation(s.location);
    setSkills(s.skills);
    setInterests(s.interests);
  }, [router]);

  function addSkill(s: string) {
    if (s && !skills.includes(s)) setSkills(p => [...p, s]);
    setSkillInput('');
  }

  function addInterest(i: string) {
    if (i && !interests.includes(i)) setInterests(p => [...p, i]);
    setInterestInput('');
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await updateUser(user.id, { name, location, skills, interests });
    const updated = { ...user, name, location, skills, interests };
    setSession(updated);
    router.push('/dashboard');
  }

  if (!user) return null;

  const aiSkills = getAIHelpSuggestions(skills);
  const aiNeeds = getAINeedSuggestions(interests);

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="label mb-2">ONBOARDING</p>
          <h1 className="text-3xl font-bold text-[#0f1a18]">Build your community identity.</h1>
          <p className="text-gray-500 text-sm mt-1">Tell us who you are — AI will suggest where you fit best.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="Karachi, Lahore, Remote..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(s => (
                  <span key={s} className="tag tag-teal flex items-center gap-1 text-xs">
                    {s}<button onClick={() => setSkills(p => p.filter(x => x !== s))} className="text-[#0d9f8f] hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)}
                  placeholder="Add a skill..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                <button onClick={() => addSkill(skillInput)} className="teal-btn px-4 py-2.5 text-sm">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_CHIPS.filter(s => !skills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)} className="tag text-xs hover:bg-gray-200 transition-colors">{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Interests</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {interests.map(i => (
                  <span key={i} className="tag tag-teal flex items-center gap-1 text-xs">
                    {i}<button onClick={() => setInterests(p => p.filter(x => x !== i))} className="text-[#0d9f8f] hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                <input value={interestInput} onChange={e => setInterestInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addInterest(interestInput)}
                  placeholder="Add an interest..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                <button onClick={() => addInterest(interestInput)} className="teal-btn px-4 py-2.5 text-sm">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_CHIPS.filter(i => !interests.includes(i)).map(i => (
                  <button key={i} onClick={() => addInterest(i)} className="tag text-xs hover:bg-gray-200 transition-colors">{i}</button>
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="teal-btn w-full py-3 text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Save and go to dashboard'}
            </button>
          </div>

          <div className="space-y-5">
            <div className="card p-6">
              <p className="label mb-2">AI SUGGESTION</p>
              <h3 className="text-lg font-bold text-[#0f1a18] mb-1">Skills you can help with</h3>
              <p className="text-xs text-gray-400 mb-4">Based on your current skill set.</p>
              {aiSkills.length > 0
                ? <div className="space-y-2">{aiSkills.map(s => (
                    <div key={s} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-[#0d9f8f]" />
                      <span className="text-sm text-[#0f1a18]">{s}</span>
                    </div>
                  ))}</div>
                : <p className="text-sm text-gray-400">Add skills above to see AI suggestions.</p>}
            </div>

            <div className="card p-6">
              <p className="label mb-2">AI SUGGESTION</p>
              <h3 className="text-lg font-bold text-[#0f1a18] mb-1">Areas where you may need help</h3>
              <p className="text-xs text-gray-400 mb-4">Based on your interests and growth areas.</p>
              {aiNeeds.length > 0
                ? <div className="space-y-2">{aiNeeds.map(n => (
                    <div key={n} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-sm text-[#0f1a18]">{n}</span>
                    </div>
                  ))}</div>
                : <p className="text-sm text-gray-400">Add interests above to see suggestions.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
