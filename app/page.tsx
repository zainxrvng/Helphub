'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getRequests, type HelpRequest } from '@/lib/store';

function UrgencyTag({ urgency }: { urgency: string }) {
  const colors: Record<string, string> = { High: 'tag-red', Medium: 'tag-amber', Low: 'tag-teal' };
  return <span className={`tag ${colors[urgency] || 'tag'}`}>{urgency}</span>;
}

function StatusTag({ status }: { status: string }) {
  return <span className={`tag ${status === 'Solved' ? 'tag-green' : 'tag-teal'}`}>{status}</span>;
}

export default function LandingPage() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);

  useEffect(() => {
    getRequests().then(r => setRequests(r.slice(0, 3)));
  }, []);

  return (
    <div className="page-bg min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0d9f8f] rounded-lg flex items-center justify-center text-white font-bold text-sm">H</div>
            <span className="font-semibold text-[#0f1a18] text-sm">HelpHub AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-[#0f1a18]">Home</Link>
            <Link href="/explore" className="text-sm text-gray-500 hover:text-[#0f1a18]">Explore</Link>
            <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-[#0f1a18]">Leaderboard</Link>
            <Link href="/ai-center" className="text-sm text-gray-500 hover:text-[#0f1a18]">AI Center</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Live community signals</span>
            <Link href="/auth" className="teal-btn px-4 py-2 text-sm">Join the platform</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <div className="flex flex-col justify-center">
            <p className="label mb-3">SMIT GRAND CODING NIGHT 2026</p>
            <h1 className="text-5xl font-extrabold text-[#0f1a18] leading-tight mb-4">
              Find help faster.<br />Become help that<br />matters.
            </h1>
            <p className="text-gray-500 text-base mb-8 max-w-md">
              HelpHub AI is a community-powered support network for students, mentors, creators, and builders. Ask for help, offer help, track impact, and let AI surface smarter matches.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/auth" className="teal-btn px-6 py-3 text-sm">Open product demo</Link>
              <Link href="/explore" className="ghost-btn px-6 py-3 text-sm">Post a request</Link>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { label: 'MEMBERS', value: '384+', sub: 'Students, mentors, and helpers in the loop.' },
                { label: 'REQUESTS', value: '72+', sub: 'Support posts shared across learning journeys.' },
                { label: 'SOLVED', value: '69+', sub: 'Problems resolved through fast community action.' },
              ].map(s => (
                <div key={s.label} className="card p-5">
                  <p className="label mb-1">{s.label}</p>
                  <p className="text-3xl font-bold text-[#0f1a18]">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dark-card p-8 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">LIVE PRODUCT FEEL</p>
                <h2 className="text-3xl font-bold text-white leading-snug">
                  More than a form.<br />More like an<br />ecosystem.
                </h2>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                  A polished multi-page experience with AI summaries, trust scores, contribution signals, notifications, and leaderboard momentum — powered by Next.js and Supabase.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex-shrink-0" />
            </div>
            <div className="space-y-3 mt-2">
              {[
                { title: 'AI request intelligence', desc: 'Auto-categorization, urgency detection, tags, rewrite suggestions, and trend snapshots.' },
                { title: 'Community trust graph', desc: 'Badges, helper rankings, trust score boosts, and visible contribution history.' },
                { title: '100%', desc: 'Top trust score currently active across the sample mentor network.' },
              ].map(item => (
                <div key={item.title} className="bg-white/10 rounded-xl p-4">
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Flow */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="label mb-2">CORE FLOW</p>
              <h2 className="text-3xl font-bold text-[#0f1a18]">From struggling alone to solving together</h2>
            </div>
            <Link href="/auth" className="ghost-btn px-5 py-2 text-sm">Try onboarding AI</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Ask for help clearly', desc: 'Create structured requests with category, urgency, AI suggestions, and tags that attract the right people.' },
              { title: 'Discover the right people', desc: 'Use the explore feed, helper lists, notifications, and messaging to move quickly once a match happens.' },
              { title: 'Track real contribution', desc: 'Trust scores, badges, solved requests, and rankings help the community recognize meaningful support.' },
            ].map(item => (
              <div key={item.title} className="card p-6">
                <h3 className="font-semibold text-[#0f1a18] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Requests */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="label mb-2">FEATURED REQUESTS</p>
              <h2 className="text-3xl font-bold text-[#0f1a18]">Community problems currently in motion</h2>
            </div>
            <Link href="/explore" className="ghost-btn px-5 py-2 text-sm">View full feed</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {requests.map(req => (
              <div key={req.id} className="card p-5 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="tag">{req.category}</span>
                  <UrgencyTag urgency={req.urgency} />
                  <StatusTag status={req.status} />
                </div>
                <h3 className="font-semibold text-[#0f1a18] text-sm leading-snug">{req.title}</h3>
                {req.description && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{req.description}</p>}
                <div className="flex flex-wrap gap-1">
                  {req.tags.map(t => <span key={t} className="tag text-[11px]">{t}</span>)}
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div>
                    <p className="text-xs font-medium text-[#0f1a18]">{req.authorName}</p>
                    <p className="text-[11px] text-gray-400">{req.location} • {req.helperIds.length} helper interested</p>
                  </div>
                  <Link href={`/request/${req.id}`} className="text-xs font-semibold text-[#0f1a18] hover:text-[#0d9f8f] transition-colors">
                    Open details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs text-gray-400">HelpHub AI is built as a premium-feel, multi-page community support product using Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
