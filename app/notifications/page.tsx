'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getNotifications, markNotificationsRead, type Notification, type User } from '@/lib/store';
import Navbar from '@/components/Navbar';

const TYPE_COLORS: Record<string, string> = {
  Status: 'bg-green-50 text-green-700',
  Match: 'bg-blue-50 text-blue-700',
  Request: 'bg-[#e6f7f5] text-[#0d9f8f]',
  Reputation: 'bg-purple-50 text-purple-700',
  Insight: 'bg-amber-50 text-amber-700',
};

export default function NotificationsPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/auth'); return; }
    setSession(s);
    getNotifications(s.id).then(n => {
      setNotifs(n);
      setLoading(false);
      markNotificationsRead(s.id);
    });
  }, [router]);

  if (loading || !session) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading notifications...</div>
    </div>
  );

  const unread = notifs.filter(n => !n.read);
  const read = notifs.filter(n => n.read);

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="dark-card p-8 mb-8">
          <p className="label mb-2" style={{ color: '#9ca3af' }}>NOTIFICATIONS</p>
          <h1 className="text-3xl font-bold text-white leading-snug">
            Stay updated on requests, helpers, and trust signals.
          </h1>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="label mb-1">LIVE UPDATES</p>
              <h2 className="text-2xl font-bold text-[#0f1a18]">Notification feed</h2>
            </div>
            {unread.length > 0 && (
              <span className="tag tag-teal text-xs">{unread.length} unread</span>
            )}
          </div>

          <div className="space-y-0">
            {notifs.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No notifications yet.</p>
            ) : notifs.map(notif => (
              <div
                key={notif.id}
                className={`flex items-start justify-between py-4 border-b border-gray-50 last:border-0 ${!notif.read ? 'bg-white' : ''}`}
              >
                <div className="flex-1 pr-4">
                  <p className={`text-sm font-medium ${notif.read ? 'text-gray-500' : 'text-[#0f1a18]'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mr-2 ${TYPE_COLORS[notif.type] || 'bg-gray-50 text-gray-500'}`}>
                      {notif.type}
                    </span>
                    {notif.time}
                  </p>
                </div>
                <span className={`text-xs font-semibold shrink-0 ${notif.read ? 'text-gray-400' : 'text-[#0d9f8f]'}`}>
                  {notif.read ? 'Read' : 'Unread'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
