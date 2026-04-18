'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getMessages, getUsers, createMessage, type Message, type User } from '@/lib/store';
import Navbar from '@/components/Navbar';

export default function MessagesPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [toId, setToId] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/auth'); return; }
    setSession(s);
    Promise.all([getMessages(), getUsers()]).then(([msgs, us]) => {
      setMessages(msgs);
      const others = us.filter(u => u.id !== s.id);
      setUsers(others);
      if (others.length > 0) setToId(others[0].id);
      setLoading(false);
    });
  }, [router]);

  async function handleSend() {
    if (!session || !content.trim() || !toId) return;
    setSending(true);
    const toUser = users.find(u => u.id === toId);
    if (!toUser) { setSending(false); return; }
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const msg: Message = {
      id: 'm' + Date.now(),
      fromId: session.id,
      fromName: session.name,
      toId,
      toName: toUser.name,
      content: content.trim(),
      time,
    };
    await createMessage(msg);
    setMessages(prev => [...prev, msg]);
    setContent('');
    setSending(false);
  }

  if (loading || !session) return (
    <div className="page-bg min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading messages...</div>
    </div>
  );

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="dark-card p-8 mb-8">
          <p className="label mb-2" style={{ color: '#9ca3af' }}>INTERACTION / MESSAGING</p>
          <h1 className="text-3xl font-bold text-white leading-snug">
            Keep support moving through direct communication.
          </h1>
          <p className="text-gray-400 text-sm mt-2">Basic messaging gives helpers and requesters a clear follow-up path once a match happens.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversation stream */}
          <div className="card p-6">
            <p className="label mb-2">CONVERSATION STREAM</p>
            <h2 className="text-2xl font-bold text-[#0f1a18] mb-5">Recent messages</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {messages.length === 0
                ? <p className="text-sm text-gray-400">No messages yet.</p>
                : messages.map(msg => (
                  <div key={msg.id} className="flex items-start justify-between py-4 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#0f1a18] mb-1">
                        {msg.fromName} → {msg.toName}
                      </p>
                      <p className="text-sm text-gray-500 leading-relaxed">{msg.content}</p>
                    </div>
                    <div className="ml-4 bg-gray-100 rounded-xl px-3 py-2 text-center shrink-0">
                      <p className="text-xs text-gray-500 whitespace-nowrap">{msg.time}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Send message */}
          <div className="card p-6">
            <p className="label mb-2">SEND MESSAGE</p>
            <h2 className="text-2xl font-bold text-[#0f1a18] mb-5">Start a conversation</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">To</label>
                <select value={toId} onChange={e => setToId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Message</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  placeholder="Share support details, ask for files, or suggest next steps."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none"
                />
              </div>
              <button onClick={handleSend} disabled={sending || !content.trim()}
                className="teal-btn w-full py-3 text-sm disabled:opacity-60">
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
