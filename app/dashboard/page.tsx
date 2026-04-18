'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, getRequests, getNotifications, type User, type HelpRequest } from '@/lib/store';
import Navbar from '@/components/Navbar';

function UrgencyTag({ urgency }: { urgency: string }) {
  const map: Record<string, string> = { High: 'tag-red', Medium: 'tag-amber', Low: 'tag-teal' };
  return <span className={`tag ${map[urgency] || 'tag'}`}>{urgency}</span>;
}
 


function StatusTag({ status }: { status: string }) {
  return <span className={`tag ${status === 'Solved' ? 'tag-green' : 'tag-teal'}`}>{status}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push('/auth'); return; }
    setUser(session);
    Promise.all([
      getRequests(),
      getNotifications(session.id),
    ]).then(([reqs, notifs]) => {
      setRequests(reqs.slice(0, 4));
      setUnread(notifs.filter(n => !n.read).length);
      setLoading(false);
    });
  }, [router]);

  if (!user || loading) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading dashboard...</div>
    </div>
  );

  const solved = requests.filter(r => r.status === 'Solved').length;

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="dark-card p-8 mb-8">
          <p className="label mb-2" style={{ color: '#9ca3af' }}>DASHBOARD</p>
          <h1 className="text-3xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{user.role} • {user.location}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'TRUST SCORE', value: `${user.trustScore}%`, sub: 'Community trust rating' },
            { label: 'CONTRIBUTIONS', value: user.contributions, sub: 'Total help given' },
            { label: 'NOTIFICATIONS', value: unread, sub: 'Unread updates' },
            { label: 'SOLVED', value: solved, sub: 'Requests resolved' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <p className="label mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#0f1a18]">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="label mb-1">RECENT REQUESTS</p>
                <h2 className="text-xl font-bold text-[#0f1a18]">Community feed</h2>
              </div>
              <Link href="/explore" className="text-sm text-[#0d9f8f] font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      <span className="tag text-[11px]">{req.category}</span>
                      <UrgencyTag urgency={req.urgency} />
                      <StatusTag status={req.status} />
                    </div>
                    <p className="text-sm font-medium text-[#0f1a18] leading-snug">{req.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{req.authorName} • {req.location}</p>
                  </div>
                  <Link href={`/request/${req.id}`} className="text-xs font-semibold text-[#0d9f8f] ml-4 shrink-0">View →</Link>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-6">
              <p className="label mb-2">AI INSIGHTS</p>
              <h3 className="text-lg font-bold text-[#0f1a18] mb-3">Platform intelligence</h3>
              <div className="space-y-3">
                <div className="bg-[#f0fdf4] rounded-xl p-3">
                  <p className="text-xs font-semibold text-green-700 mb-0.5">Trending category</p>
                  <p className="text-sm text-[#0f1a18] font-medium">Web Development</p>
                  <p className="text-xs text-gray-500 mt-0.5">Most active area this week</p>
                </div>
                <div className="bg-[#fef2f2] rounded-xl p-3">
                  <p className="text-xs font-semibold text-red-600 mb-0.5">Urgency watch</p>
                  <p className="text-sm text-[#0f1a18] font-medium">{requests.filter(r => r.urgency === 'High').length} high-priority open</p>
                  <p className="text-xs text-gray-500 mt-0.5">Requests needing quick help</p>
                </div>
                <Link href="/ai-center" className="text-xs text-[#0d9f8f] font-medium block">Full AI Center →</Link>
              </div>
            </div>

            <div className="card p-6">
              <p className="label mb-2">QUICK ACTIONS</p>
              <div className="space-y-2">
                {[
                  { label: 'Create a request', href: '/create-request', primary: true },
                  { label: 'Browse the feed', href: '/explore', primary: false },
                  { label: 'Check messages', href: '/messages', primary: false },
                  { label: 'View leaderboard', href: '/leaderboard', primary: false },
                  { label: 'Update profile', href: '/profile', primary: false },
                ].map(a => (
                  <Link key={a.href} href={a.href}
                    className={`block w-full text-center py-2.5 text-sm font-medium rounded-xl transition-colors ${a.primary ? 'bg-[#0d9f8f] text-white hover:bg-[#0b8a7c]' : 'bg-gray-50 text-[#0f1a18] hover:bg-gray-100'}`}>
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <p className="label mb-2">TRUST SCORE</p>
              <h3 className="text-lg font-bold text-[#0f1a18] mb-3">Your reputation</h3>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500">Trust rating</span>
                  <span className="font-bold text-[#0f1a18]">{user.trustScore}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#0d9f8f]" style={{ width: `${user.trustScore}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.badges.map(b => <span key={b} className="tag tag-teal text-xs">{b}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
