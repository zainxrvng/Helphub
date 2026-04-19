'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, getRequests, type HelpRequest } from '@/lib/store';
import Navbar from '@/components/Navbar';

const CATEGORIES = ['All categories', 'Web Development', 'Design', 'Career', 'Data Science', 'DevOps', 'Community'];
const URGENCIES = ['All urgency levels', 'High', 'Medium', 'Low'];

function UrgencyTag({ urgency }: { urgency: string }) {
  const map: Record<string, string> = { High: 'tag-red', Medium: 'tag-amber', Low: 'tag-teal' };
  return <span className={`tag ${map[urgency] || 'tag'}`}>{urgency}</span>;
}

function StatusTag({ status }: { status: string }) {
  return <span className={`tag ${status === 'Solved' ? 'tag-green' : 'tag-teal'}`}>{status}</span>;
}

export default function ExplorePage() {
  const router = useRouter();
  const [all, setAll] = useState<HelpRequest[]>([]);
  const [filtered, setFiltered] = useState<HelpRequest[]>([]);
  const [category, setCategory] = useState('All categories');
  const [urgency, setUrgency] = useState('All urgency levels');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push('/auth'); return; }
    getRequests().then(r => { setAll(r); setFiltered(r); setLoading(false); });
  }, [router]);

  useEffect(() => {
    let result = all;
    if (category !== 'All categories') result = result.filter(r => r.category === category);
    if (urgency !== 'All urgency levels') result = result.filter(r => r.urgency === urgency);
    if (skillFilter) result = result.filter(r => r.tags.some(t => t.toLowerCase().includes(skillFilter.toLowerCase())));
    if (locationFilter) result = result.filter(r => r.location.toLowerCase().includes(locationFilter.toLowerCase()));
    setFiltered(result);
  }, [category, urgency, skillFilter, locationFilter, all]);

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="dark-card p-8 mb-8 animate-slide-down">
          <p className="label mb-2" style={{ color: '#9ca3af' }}>EXPLORE / FEED</p>
          <h1 className="text-3xl font-bold text-white leading-snug">
            Browse help requests with filterable<br />community context.
          </h1>
          <p className="text-gray-400 text-sm mt-2">Filter by category, urgency, skills, and location to surface the best matches.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 animate-slide-up delay-100">
            <div className="card p-6 sticky top-24">
              <p className="label mb-2">FILTERS</p>
              <h2 className="text-xl font-bold text-[#0f1a18] mb-5">Refine the feed</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-2 block">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-2 block">Urgency</label>
                  <select value={urgency} onChange={e => setUrgency(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
                    {URGENCIES.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-2 block">Skills</label>
                  <input value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
                    placeholder="React, Figma, Git/GitHub"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-2 block">Location</label>
                  <input value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                    placeholder="Karachi, Lahore, Remote"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <button onClick={() => { setCategory('All categories'); setUrgency('All urgency levels'); setSkillFilter(''); setLocationFilter(''); }}
                  className="w-full ghost-btn py-2.5 text-sm">Clear filters</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="card p-10 text-center text-gray-400 text-sm">Loading requests...</div>
            ) : filtered.length === 0 ? (
              <div className="card p-10 text-center text-gray-400 text-sm">No requests match your filters.</div>
            ) : filtered.map((req, i) => (
              <div key={req.id} className="card p-6 card-hover animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="tag">{req.category}</span>
                  <UrgencyTag urgency={req.urgency} />
                  <StatusTag status={req.status} />
                </div>
                <h3 className="text-lg font-semibold text-[#0f1a18] mb-2">{req.title}</h3>
                {req.description && <p className="text-sm text-gray-500 mb-3 leading-relaxed">{req.description}</p>}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {req.tags.map(t => <span key={t} className="tag text-xs">{t}</span>)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0f1a18]">{req.authorName}</p>
                    <p className="text-xs text-gray-400">{req.location} • {req.helperIds.length} helper{req.helperIds.length !== 1 ? 's' : ''} interested</p>
                  </div>
                  <Link href={`/request/${req.id}`} className="text-sm font-semibold text-[#0f1a18] hover:text-[#0d9f8f] transition-colors">
                    Open details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
