'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getSession, getRequestById, updateRequest, getUsers, addNotification,
  type HelpRequest, type User
} from '@/lib/store';
import { generateSummary } from '@/lib/ai';
import Navbar from '@/components/Navbar';

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [session, setSession] = useState<User | null>(null);
  const [helpers, setHelpers] = useState<User[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/auth'); return; }
    setSession(s);
    Promise.all([getRequestById(id), getUsers()]).then(([req, users]) => {
      if (!req) { router.push('/explore'); return; }
      setRequest(req);
      setHelpers(users.filter(u => req.helperIds.includes(u.id)));
      setAiSummary(generateSummary(req.title, req.description, req.category, req.urgency));
      setLoading(false);
    });
  }, [id, router]);

  async function handleCanHelp() {
    if (!session || !request || request.helperIds.includes(session.id)) return;
    const newHelperIds = [...request.helperIds, session.id];
    await updateRequest(request.id, { helperIds: newHelperIds });
    await addNotification(request.authorId, `${session.name} offered help on "${request.title}"`, 'Match');
    const [updated, users] = await Promise.all([getRequestById(request.id), getUsers()]);
    if (updated) { setRequest(updated); setHelpers(users.filter(u => updated.helperIds.includes(u.id))); }
  }

  async function handleMarkSolved() {
    if (!session || !request || request.status === 'Solved') return;
    await updateRequest(request.id, { status: 'Solved' });
    await addNotification(request.authorId, `"${request.title}" was marked as solved`, 'Status');
    setRequest(prev => prev ? { ...prev, status: 'Solved' } : prev);
  }

  if (loading || !request || !session) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading request...</div>
    </div>
  );

  const urgencyColor: Record<string, string> = { High: 'tag-red', Medium: 'tag-amber', Low: 'tag-teal' };

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="dark-card p-8 mb-8">
          <p className="label mb-3" style={{ color: '#9ca3af' }}>REQUEST DETAIL</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="tag">{request.category}</span>
            <span className={`tag ${urgencyColor[request.urgency] || 'tag'}`}>{request.urgency}</span>
            <span className={`tag ${request.status === 'Solved' ? 'tag-green' : 'tag-teal'}`}>{request.status}</span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-snug mb-2">{request.title}</h1>
          <p className="text-gray-400 text-sm leading-relaxed">{request.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <p className="label mb-2">AI SUMMARY</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#0d9f8f] rounded-lg flex items-center justify-center text-white font-bold text-sm">H</div>
                <span className="font-semibold text-[#0f1a18]">HelpHub AI</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{aiSummary}</p>
              <div className="flex flex-wrap gap-2">
                {request.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>

            <div className="card p-6">
              <p className="label mb-4">ACTIONS</p>
              <div className="flex items-center gap-3">
                <button onClick={handleCanHelp}
                  disabled={request.helperIds.includes(session.id)}
                  className={`teal-btn px-6 py-2.5 text-sm ${request.helperIds.includes(session.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {request.helperIds.includes(session.id) ? 'Already helping' : 'I can help'}
                </button>
                <button onClick={handleMarkSolved}
                  disabled={request.status === 'Solved'}
                  className={`text-sm font-medium text-[#0f1a18] hover:text-[#0d9f8f] transition-colors ${request.status === 'Solved' ? 'opacity-50' : ''}`}>
                  {request.status === 'Solved' ? 'Marked as solved ✓' : 'Mark as solved'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-6">
              <p className="label mb-3">REQUESTER</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-[#0d9f8f]">
                  {request.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0f1a18]">{request.authorName}</p>
                  <p className="text-xs text-gray-400">{request.location}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <p className="label mb-3">HELPERS</p>
              <h3 className="text-lg font-bold text-[#0f1a18] mb-4">People ready to support</h3>
              {helpers.length === 0
                ? <p className="text-sm text-gray-400">No helpers yet. Be the first!</p>
                : <div className="space-y-4">
                    {helpers.map(h => (
                      <div key={h.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: h.color || '#0d9f8f' }}>
                          {h.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#0f1a18]">{h.name}</p>
                          <p className="text-xs text-gray-400">{h.skills.join(', ')}</p>
                        </div>
                        <span className="tag tag-teal text-xs">Trust {h.trustScore}%</span>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
