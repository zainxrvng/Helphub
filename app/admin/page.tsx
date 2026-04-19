'use client';

import { useEffect, useState, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import Link from 'next/link';
import {
  getUsers, getRequests, getMessages, getNotifications, updateRequest, updateUser,
  getSession, setSession,
  type User, type HelpRequest,
} from '@/lib/store';

const ADMIN_PASSWORD = 'admin123';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="label mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-[#0f1a18]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [msgCount, setMsgCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [tab, setTab] = useState<'overview' | 'users' | 'requests' | 'ai'>('overview');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const openRequests = requests.filter(r => r.status === 'Open');
  const solvedRequests = requests.filter(r => r.status === 'Solved');
  const highUrgencyOpen = requests.filter(r => r.urgency === 'High' && r.status === 'Open');
  const solveRate = requests.length ? Math.round((solvedRequests.length / requests.length) * 100) : 0;

  const platformContext = `
=== HELPHUB PLATFORM DATA ===

USERS (${users.length} total):
${users.map(u => `- ${u.name} | Trust: ${u.trustScore}% | Contributions: ${u.contributions} | Role: ${u.role} | Badges: ${u.badges.join(', ') || 'none'} | Skills: ${u.skills.join(', ') || 'none'} | Location: ${u.location}`).join('\n')}

REQUESTS (${requests.length} total | ${openRequests.length} open | ${solvedRequests.length} solved | ${solveRate}% solve rate):
${requests.map(r => `- [${r.status}][${r.urgency}] "${r.title}" by ${r.authorName} | Category: ${r.category} | Tags: ${r.tags.join(', ') || 'none'} | Helpers: ${r.helperIds.length}`).join('\n')}

URGENT OPEN REQUESTS (${highUrgencyOpen.length}):
${highUrgencyOpen.length > 0 ? highUrgencyOpen.map(r => `- "${r.title}" by ${r.authorName} (${r.category})`).join('\n') : 'None'}

CATEGORY BREAKDOWN:
${['Web Development', 'Design', 'Career', 'Data Science', 'DevOps', 'Community'].map(cat => {
    const count = requests.filter(r => r.category === cat).length;
    return `- ${cat}: ${count} requests`;
  }).join('\n')}

PLATFORM STATS:
- Messages exchanged: ${msgCount}
- Notifications sent: ${notifCount}
- Top contributor: ${users[0]?.name ?? 'N/A'} (${users[0]?.trustScore ?? 0}% trust, ${users[0]?.contributions ?? 0} contributions)
- Users with no badges: ${users.filter(u => u.badges.length === 0).map(u => u.name).join(', ') || 'none'}
- Unhelped open requests: ${openRequests.filter(r => r.helperIds.length === 0).length}
`.trim();

  const [chatInput, setChatInput] = useState('');
  const { messages: chatMessages, sendMessage, status: chatStatus } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/ai-chat',
      body: { context: platformContext },
    }),
  });
  const aiLoading = chatStatus === 'streaming' || chatStatus === 'submitted';

  function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading) return;
    sendMessage({ text: chatInput });
    setChatInput('');
  }

  useEffect(() => {
    if (!authed) return;
    Promise.all([getUsers(), getRequests(), getMessages(), getNotifications()]).then(
      ([u, r, m, n]) => {
        setUsers(u);
        setRequests(r);
        setMsgCount(m.length);
        setNotifCount(n.length);
        setLoading(false);
      }
    );
  }, [authed]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  function handleLogin() {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(''); }
    else setPwError('Wrong password.');
  }

  async function toggleRequestStatus(req: HelpRequest) {
    const next = req.status === 'Open' ? 'Solved' : 'Open';
    await updateRequest(req.id, { status: next });
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: next } : r));
  }

  async function boostTrust(user: User) {
    const next = Math.min(100, user.trustScore + 5);
    await updateUser(user.id, { trustScore: next });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, trustScore: next } : u));
    // Sync localStorage session so dashboard reflects change immediately
    const session = getSession();
    if (session && session.id === user.id) {
      setSession({ ...session, trustScore: next });
    }
  }

  // ── Auth gate ────────────────────────────────────────────
  if (!authed) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="card p-10 w-full max-w-sm">
        <div className="w-10 h-10 bg-[#0f1a18] rounded-xl flex items-center justify-center text-white font-bold mb-6">A</div>
        <p className="label mb-1">ADMIN ACCESS</p>
        <h1 className="text-2xl font-bold text-[#0f1a18] mb-6">Sign in to Admin</h1>
        <input type="password" placeholder="Admin password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#0d9f8f]" />
        {pwError && <p className="text-red-500 text-sm mb-3">{pwError}</p>}
        <button onClick={handleLogin} className="teal-btn w-full py-3 text-sm">Enter</button>
        <Link href="/" className="block text-center text-xs text-gray-400 mt-4 hover:text-gray-600">← Back to site</Link>
      </div>
    </div>
  );

  const TABS = ['overview', 'users', 'requests', 'ai'] as const;

  return (
    <div className="page-bg min-h-screen">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0f1a18] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#0d9f8f] rounded-lg flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="text-white font-semibold text-sm">HelpHub Admin</span>
          </div>
          <div className="flex items-center gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full capitalize transition-colors ${
                  tab === t ? 'bg-white text-[#0f1a18]' : 'text-gray-400 hover:text-white'
                }`}>
                {t === 'ai' ? '✦ AI Chat' : t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">← Site</Link>
            <button onClick={() => setAuthed(false)} className="text-xs text-gray-400 hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="dark-card p-8 mb-8">
          <p className="label mb-2" style={{ color: '#9ca3af' }}>ADMIN PANEL</p>
          <h1 className="text-3xl font-bold text-white">Platform Control Center</h1>
          <p className="text-gray-400 text-sm mt-1">Manage users, requests, and get AI-powered insights.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Loading platform data…</div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="TOTAL USERS" value={users.length} sub="Registered members" />
                  <StatCard label="TOTAL REQUESTS" value={requests.length} sub={`${requests.filter(r => r.status === 'Open').length} open`} />
                  <StatCard label="SOLVED" value={requests.filter(r => r.status === 'Solved').length} sub="Requests resolved" />
                  <StatCard label="MESSAGES" value={msgCount} sub={`${notifCount} notifications`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category breakdown */}
                  <div className="card p-6">
                    <p className="label mb-4">CATEGORY BREAKDOWN</p>
                    {['Web Development', 'Design', 'Career', 'Data Science', 'DevOps', 'Community'].map(cat => {
                      const count = requests.filter(r => r.category === cat).length;
                      const pct = requests.length ? Math.round((count / requests.length) * 100) : 0;
                      return (
                        <div key={cat} className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#0f1a18] font-medium">{cat}</span>
                            <span className="text-gray-400">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-[#0d9f8f] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* High urgency open requests */}
                  <div className="card p-6">
                    <p className="label mb-4">HIGH URGENCY — NEEDS ATTENTION</p>
                    {requests.filter(r => r.urgency === 'High' && r.status === 'Open').length === 0
                      ? <p className="text-sm text-gray-400">No high urgency open requests.</p>
                      : requests.filter(r => r.urgency === 'High' && r.status === 'Open').map(r => (
                        <div key={r.id} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-[#0f1a18] leading-snug">{r.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{r.authorName} · {r.category}</p>
                          </div>
                          <span className="tag tag-red text-xs shrink-0 ml-3">High</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Top performers */}
                <div className="card p-6">
                  <p className="label mb-4">TOP PERFORMERS</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {users.slice(0, 3).map((u, i) => (
                      <div key={u.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <span className="text-lg font-black text-[#0d9f8f]">#{i + 1}</span>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: u.color || '#0d9f8f' }}>
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0f1a18] truncate">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.trustScore}% trust · {u.contributions} contributions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {tab === 'users' && (
              <div className="card p-6">
                <p className="label mb-4">ALL USERS ({users.length})</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['User', 'Email', 'Role', 'Trust', 'Contributions', 'Badges', 'Actions'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ backgroundColor: u.color || '#0d9f8f' }}>
                                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="font-medium text-[#0f1a18] whitespace-nowrap">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-gray-500 text-xs">{u.email}</td>
                          <td className="py-3 pr-4"><span className="tag text-xs">{u.role}</span></td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-[#0d9f8f] h-1.5 rounded-full" style={{ width: `${u.trustScore}%` }} />
                              </div>
                              <span className="text-xs text-[#0f1a18] font-semibold">{u.trustScore}%</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-[#0f1a18] font-semibold">{u.contributions}</td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-1">
                              {u.badges.slice(0, 2).map(b => <span key={b} className="tag tag-teal text-xs">{b}</span>)}
                              {u.badges.length > 2 && <span className="text-xs text-gray-400">+{u.badges.length - 2}</span>}
                            </div>
                          </td>
                          <td className="py-3">
                            <button onClick={() => boostTrust(u)}
                              className="text-xs text-[#0d9f8f] font-medium hover:underline whitespace-nowrap">
                              +5 Trust
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── REQUESTS ── */}
            {tab === 'requests' && (
              <div className="card p-6">
                <p className="label mb-4">ALL REQUESTS ({requests.length})</p>
                <div className="space-y-3">
                  {requests.map(r => (
                    <div key={r.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="tag text-xs">{r.category}</span>
                          <span className={`tag text-xs ${r.urgency === 'High' ? 'tag-red' : r.urgency === 'Medium' ? 'tag-amber' : 'tag-teal'}`}>{r.urgency}</span>
                          <span className={`tag text-xs ${r.status === 'Solved' ? 'tag-green' : 'tag-teal'}`}>{r.status}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0f1a18] leading-snug">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{r.authorName} · {r.location} · {r.helperIds.length} helpers</p>
                      </div>
                      <button onClick={() => toggleRequestStatus(r)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                          r.status === 'Open'
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        {r.status === 'Open' ? 'Mark solved' : 'Reopen'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── AI CHAT ── */}
            {tab === 'ai' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Context panel */}
                <div className="card p-6">
                  <p className="label mb-3">PLATFORM SNAPSHOT</p>
                  <p className="text-xs text-gray-500 leading-relaxed font-mono whitespace-pre-wrap bg-gray-50 rounded-xl p-3">{platformContext}</p>
                  <p className="text-xs text-gray-400 mt-4 leading-relaxed">This context is automatically sent to the AI with every message so it can give data-aware answers.</p>
                  <div className="mt-4 space-y-2">
                    {[
                      'Who deserves a trust score boost and why?',
                      'Which open requests have no helpers yet?',
                      'Suggest specific badges for each user based on their contributions',
                      'Which categories are underserved and what skills are missing?',
                      'Give a full platform health report',
                      'Who are the top 3 mentors and what makes them stand out?',
                    ].map(q => (
                      <button key={q} onClick={() => setChatInput(q)}
                        className="block w-full text-left text-xs text-[#0d9f8f] bg-[#0d9f8f]/5 hover:bg-[#0d9f8f]/10 rounded-xl px-3 py-2 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat */}
                <div className="lg:col-span-2 card p-6 flex flex-col" style={{ height: '600px' }}>
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                    <div className="w-9 h-9 bg-[#0d9f8f] rounded-xl flex items-center justify-center text-white font-bold text-sm">✦</div>
                    <div>
                      <p className="font-bold text-[#0f1a18] text-sm">HelpHub AI Assistant</p>
                      <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash · Platform-aware</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                    {chatMessages.length === 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-[#0d9f8f] rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">✦</div>
                        <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                          <p className="text-sm text-[#0f1a18]">Hello! I have full context on your platform data. Ask me anything — user insights, moderation help, badge recommendations, or trend analysis.</p>
                        </div>
                      </div>
                    )}
                    {chatMessages.map(m => (
                      <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${m.role === 'user' ? 'bg-[#0f1a18]' : 'bg-[#0d9f8f]'}`}>
                          {m.role === 'user' ? 'A' : '✦'}
                        </div>
                        <div className={`rounded-2xl px-4 py-3 max-w-prose text-sm leading-relaxed whitespace-pre-wrap ${
                          m.role === 'user' ? 'bg-[#0f1a18] text-white rounded-tr-sm' : 'bg-gray-50 text-[#0f1a18] rounded-tl-sm'
                        }`}>
                          {m.parts?.map((p: {type: string; text?: string}, i: number) => p.type === 'text' ? <span key={i}>{p.text}</span> : null)}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-[#0d9f8f] rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">✦</div>
                        <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-[#0d9f8f] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#0d9f8f] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#0d9f8f] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Ask about users, requests, trends…"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9f8f]"
                    />
                    <button type="submit" disabled={aiLoading || !chatInput.trim()}
                      className="teal-btn px-5 py-2.5 text-sm disabled:opacity-50">
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
