'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, createRequest, addNotification, type Urgency } from '@/lib/store';
import { detectCategory, detectUrgency, suggestTags } from '@/lib/ai';
import Navbar from '@/components/Navbar';

const CATEGORIES = ['Web Development', 'Design', 'Career', 'Data Science', 'DevOps', 'Community'];
const URGENCIES: Urgency[] = ['Low', 'Medium', 'High'];

export default function CreateRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [urgency, setUrgency] = useState<Urgency>('Low');
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [aiApplied, setAiApplied] = useState(false);

  const [aiCategory, setAiCategory] = useState('Community');
  const [aiUrgency, setAiUrgency] = useState<Urgency>('Low');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiRewrite, setAiRewrite] = useState('');
  const [aiRewriteLoading, setAiRewriteLoading] = useState(false);
  const [aiRewriteError, setAiRewriteError] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push('/auth'); return; }
  }, [router]);

  useEffect(() => {
    if (title || description) {
      const cat = detectCategory(title, description);
      setAiCategory(cat);
      setAiUrgency(detectUrgency(title, description));
      setAiTags(suggestTags(title, description, cat));
    }
  }, [title, description]);

  async function fetchRewrite() {
    if (!title && !description) { setAiRewrite(''); return; }
    setAiRewriteLoading(true);
    setAiRewriteError(false);
    try {
      const res = await fetch('/api/ai-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setAiRewriteError(true); setAiRewrite(''); }
      else setAiRewrite(data.rewrite || '');
    } catch {
      setAiRewriteError(true);
      setAiRewrite('');
    } finally {
      setAiRewriteLoading(false);
    }
  }

  useEffect(() => {
    if (!title && !description) { setAiRewrite(''); setAiRewriteError(false); return; }
    setAiRewriteLoading(true);
    setAiRewriteError(false);
    const timer = setTimeout(fetchRewrite, 900);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);

  function applyAI() {
    if (!title && !description) return;
    setCategory(aiCategory);
    setUrgency(aiUrgency);
    setTags(aiTags.join(', '));
    if (aiRewrite) setDescription(aiRewrite);
    setAiApplied(true);
    setTimeout(() => setAiApplied(false), 2000);
  }

  async function handlePublish() {
    const session = getSession();
    if (!session || !title.trim()) return;
    setPublishing(true);
    setPublishError('');
    try {
      await createRequest({
        id: 'r' + Date.now(),
        title: title.trim(),
        description,
        category,
        urgency,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        status: 'Open',
        authorId: session.id,
        authorName: session.name,
        location: session.location,
        helperIds: [],
      });
      await addNotification(session.id, `Your request "${title}" is now live in the community feed`, 'Request');
      router.push('/explore');
    } catch {
      setPublishError('Failed to publish. Check your connection and try again.');
      setPublishing(false);
    }
  }

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="dark-card p-8 mb-8 animate-slide-down">
          <p className="label mb-2" style={{ color: '#9ca3af' }}>CREATE REQUEST</p>
          <h1 className="text-3xl font-bold text-white leading-snug">
            Turn a rough problem into a clear help request.
          </h1>
          <p className="text-gray-400 text-sm mt-2">Use built-in AI suggestions for category, urgency, tags, and a stronger description rewrite.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-7 space-y-5 animate-slide-up delay-100">
            <div>
              <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Need review on my JavaScript quiz app before submission"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Explain the challenge, your current progress, deadline, and what kind of help would be useful."
                rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Tags</label>
                <input value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="JavaScript, Debugging, Review"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Urgency</label>
              <select value={urgency} onChange={e => setUrgency(e.target.value as Urgency)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                {URGENCIES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={applyAI} disabled={!title && !description}
                className={`px-6 py-3 text-sm rounded-full font-medium transition-all border ${
                  aiApplied
                    ? 'bg-[#0d9f8f] text-white border-[#0d9f8f]'
                    : 'ghost-btn'
                } disabled:opacity-40 disabled:cursor-not-allowed`}>
                {aiApplied ? '✓ Applied!' : 'Apply AI suggestions'}
              </button>
              <button onClick={handlePublish} disabled={publishing || !title.trim()}
                className="teal-btn px-6 py-3 text-sm disabled:opacity-60">
                {publishing ? 'Publishing...' : 'Publish request'}
              </button>
            </div>
            {publishError && <p className="text-red-500 text-sm">{publishError}</p>}
          </div>

          <div className="card p-6 animate-slide-up delay-200">
            <p className="label mb-2">AI ASSISTANT</p>
            <h3 className="text-2xl font-bold text-[#0f1a18] mb-5">Smart request guidance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-500">Suggested category</span>
                <span className="text-sm font-semibold text-[#0f1a18]">{aiCategory}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-500">Detected urgency</span>
                <span className={`text-sm font-semibold ${aiUrgency === 'High' ? 'text-red-500' : aiUrgency === 'Medium' ? 'text-amber-500' : 'text-[#0d9f8f]'}`}>
                  {aiUrgency}
                </span>
              </div>
              <div className="py-3 border-b border-gray-50">
                <p className="text-sm text-gray-500 mb-2">Suggested tags</p>
                {aiTags.length > 0
                  ? <div className="flex flex-wrap gap-1.5">{aiTags.map(t => <span key={t} className="tag tag-teal text-xs">{t}</span>)}</div>
                  : <p className="text-xs text-gray-400">Add more detail for smarter tags</p>}
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Rewrite suggestion</p>
                  {aiRewriteLoading && <span className="text-xs text-[#0d9f8f] animate-pulse">Gemini writing…</span>}
                  {aiRewriteError && !aiRewriteLoading && (
                    <button onClick={fetchRewrite} className="text-xs text-red-400 hover:text-red-600 transition-colors">Retry ↺</button>
                  )}
                </div>
                {aiRewriteLoading && (
                  <div className="space-y-2">
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-3 w-4/5" />
                    <div className="skeleton h-3 w-3/5" />
                  </div>
                )}
                {!aiRewriteLoading && aiRewrite && (
                  <p className="text-xs text-[#0f1a18] leading-relaxed bg-gray-50 rounded-xl p-3 animate-fade-in">{aiRewrite}</p>
                )}
                {!aiRewriteLoading && !aiRewrite && !aiRewriteError && (
                  <p className="text-xs text-gray-400 font-medium">Start describing the challenge to generate a stronger version.</p>
                )}
                {!aiRewriteLoading && aiRewriteError && (
                  <p className="text-xs text-red-400">Gemini unavailable. Check API key or try again.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
