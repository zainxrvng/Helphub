'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, getRequests, getUsers, type HelpRequest, type User } from '@/lib/store';
import { generateSummary } from '@/lib/ai';
import Navbar from '@/components/Navbar';

export default function AICenterPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/auth'); return; }
    Promise.all([getRequests(), getUsers()]).then(([reqs, us]) => {
      setRequests(reqs);
      setUsers(us);
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading AI Center...</div>
    </div>
  );

  // AI computations
  const categoryCounts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
  const trendCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Web Development';
  const highUrgency = requests.filter(r => r.urgency === 'High' && r.status === 'Open');
  const trustedHelpers = users.filter(u => u.trustScore >= 75);

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="dark-card p-8 mb-8">
          <p className="label mb-2" style={{ color: '#9ca3af' }}>AI CENTER</p>
          <h1 className="text-3xl font-bold text-white leading-snug">
            See what the platform intelligence is noticing.
          </h1>
          <p className="text-gray-400 text-sm mt-2">AI-like insights summarize demand trends, helper readiness, urgency signals, and request recommendations.</p>
        </div>

        {/* Insight cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="card p-6">
            <p className="label mb-3">TREND PULSE</p>
            <h3 className="text-2xl font-bold text-[#0f1a18] mb-2">{trendCategory}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Most common support area based on active community requests.</p>
          </div>
          <div className="card p-6">
            <p className="label mb-3">URGENCY WATCH</p>
            <h3 className="text-4xl font-bold text-[#0f1a18] mb-2">{highUrgency.length}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Requests currently flagged high priority by the urgency detector.</p>
          </div>
          <div className="card p-6">
            <p className="label mb-3">MENTOR POOL</p>
            <h3 className="text-4xl font-bold text-[#0f1a18] mb-2">{trustedHelpers.length}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Trusted helpers with strong response history and contribution signals.</p>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card p-7">
          <p className="label mb-2">AI RECOMMENDATIONS</p>
          <h2 className="text-2xl font-bold text-[#0f1a18] mb-5">Requests needing attention</h2>
          <div className="space-y-3">
            {requests.slice(0, 5).map(req => (
              <div key={req.id} className="border border-gray-100 rounded-2xl p-5 hover:border-[#0d9f8f]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0f1a18] mb-1">{req.title}</h3>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                      {generateSummary(req.title, req.description, req.category, req.urgency)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="tag">{req.category}</span>
                      <span className={`tag ${req.urgency === 'High' ? 'tag-red' : req.urgency === 'Medium' ? 'tag-amber' : 'tag-teal'}`}>
                        {req.urgency}
                      </span>
                    </div>
                  </div>
                  <Link href={`/request/${req.id}`}
                    className="text-xs font-semibold text-[#0d9f8f] shrink-0 hover:underline">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div className="card p-6">
            <p className="label mb-3">CATEGORY BREAKDOWN</p>
            <h3 className="text-lg font-bold text-[#0f1a18] mb-4">Request distribution</h3>
            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#0f1a18]">{cat}</span>
                    <span className="text-gray-400">{count} requests</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0d9f8f] rounded-full"
                      style={{ width: `${(count / requests.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <p className="label mb-3">TOP SKILL GAPS</p>
            <h3 className="text-lg font-bold text-[#0f1a18] mb-4">Where community needs help most</h3>
            <div className="space-y-2">
              {['HTML/CSS', 'Responsive Design', 'Interview Prep', 'Figma', 'Python'].map((skill, i) => (
                <div key={skill} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium text-gray-400 w-4">#{i + 1}</span>
                  <span className="text-sm text-[#0f1a18]">{skill}</span>
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden ml-auto max-w-24">
                    <div className="h-full bg-[#0d9f8f] rounded-full" style={{ width: `${90 - i * 15}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
