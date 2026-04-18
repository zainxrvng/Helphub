'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getUsers, type User } from '@/lib/store';
import Navbar from '@/components/Navbar';

const BADGE_COLORS: Record<string, string> = {
  'Design Ally': '#0d9f8f',
  'Fast Responder': '#f59e0b',
  'Top Mentor': '#8b5cf6',
  'Code Rescuer': '#ef4444',
  'Bug Hunter': '#3b82f6',
  'Community Voice': '#10b981',
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [session, setSession] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/auth'); return; }
    setSession(s);
    getUsers().then(us => {
      setUsers([...us].sort((a, b) => b.trustScore - a.trustScore));
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading leaderboard...</div>
    </div>
  );

  const top3 = users.slice(0, 3);

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="dark-card p-8 mb-8">
          <p className="label mb-2" style={{ color: '#9ca3af' }}>LEADERBOARD</p>
          <h1 className="text-3xl font-bold text-white leading-snug">
            Recognize the people who keep the<br />community moving.
          </h1>
          <p className="text-gray-400 text-sm mt-2">Trust score, contribution count, and badges create visible momentum for reliable helpers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rankings */}
          <div className="card p-6">
            <p className="label mb-2">TOP HELPERS</p>
            <h2 className="text-2xl font-bold text-[#0f1a18] mb-5">Rankings</h2>
            <div className="space-y-4">
              {users.map((user, i) => (
                <div key={user.id} className={`flex items-center gap-4 p-4 rounded-2xl ${user.id === session?.id ? 'bg-[#e6f7f5] border border-[#0d9f8f]/20' : 'bg-gray-50'}`}>
                  <div className="text-lg font-bold text-gray-400 w-6 text-center">#{i + 1}</div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: user.color || '#0d9f8f' }}>
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#0f1a18] text-sm">{user.name} {user.id === session?.id && <span className="text-[#0d9f8f] text-xs">(you)</span>}</p>
                    <p className="text-xs text-gray-400">{user.skills.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0f1a18]">{user.trustScore}%</p>
                    <p className="text-xs text-gray-400">{user.contributions} contributions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badge System / Trust */}
          <div className="card p-6">
            <p className="label mb-2">BADGE SYSTEM</p>
            <h2 className="text-2xl font-bold text-[#0f1a18] mb-5">Trust and achievement</h2>
            <div className="space-y-5">
              {top3.map((user, i) => (
                <div key={user.id}>
                  <div className="mb-1.5">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${user.trustScore}%`,
                          background: i === 0
                            ? 'linear-gradient(90deg, #f59e0b, #0d9f8f)'
                            : i === 1
                            ? 'linear-gradient(90deg, #f97316, #0d9f8f)'
                            : 'linear-gradient(90deg, #f59e0b, #6b7280)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-[#0f1a18] text-sm">{user.name}</p>
                      <span className="text-sm font-bold text-[#0d9f8f]">{user.trustScore}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {user.badges.map(b => (
                        <span key={b} className="inline-flex items-center gap-1 tag text-xs"
                          style={{ backgroundColor: `${BADGE_COLORS[b] || '#0d9f8f'}15`, color: BADGE_COLORS[b] || '#0d9f8f' }}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust score explainer */}
            <div className="mt-6 p-4 bg-[#f0fdf4] rounded-xl">
              <p className="text-xs font-semibold text-green-700 mb-2">HOW TRUST SCORE WORKS</p>
              <ul className="space-y-1">
                {[
                  'Solve requests → +10 trust',
                  'Offer help → +5 trust',
                  'Fast response → +3 trust',
                  'Earn badges → bonus multiplier',
                ].map(rule => (
                  <li key={rule} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className="text-green-500">✓</span>{rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
