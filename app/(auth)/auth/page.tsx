'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser, registerUser, setSession, getSession, type Role } from '@/lib/store';

const ROLES: Role[] = ['Need Help', 'Can Help', 'Both'];

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // signup fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Both');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [signupError, setSignupError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getSession()) router.push('/dashboard');
  }, [router]);

  async function handleLogin() {
    if (!loginEmail || !loginPassword) { setLoginError('Enter email and password.'); return; }
    setLoading(true);
    setLoginError('');
    try {
      const user = await loginUser(loginEmail.trim(), loginPassword);
      if (!user) { setLoginError('Invalid email or password.'); setLoading(false); return; }
      setSession(user);
      router.push('/dashboard');
    } catch {
      setLoginError('Connection error. Try again.');
      setLoading(false);
    }
  }

  async function handleSignup() {
    if (!name || !email || !password) { setSignupError('Name, email, and password are required.'); return; }
    setLoading(true);
    setSignupError('');
    try {
      const { user, error } = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        location: location.trim(),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      });
      if (error || !user) { setSignupError(error || 'Signup failed. Try again.'); setLoading(false); return; }
      setSession(user);
      router.push('/dashboard');
    } catch {
      setSignupError('Connection error. Try again.');
      setLoading(false);
    }
  }

  const input = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0f1a18] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9f8f]';

  return (
    <div className="page-bg min-h-screen">
      <nav className="bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0d9f8f] rounded-lg flex items-center justify-center text-white font-bold text-sm">H</div>
            <span className="font-semibold text-[#0f1a18] text-sm">HelpHub AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-[#0f1a18]">Home</Link>
            <Link href="/explore" className="text-sm text-gray-500 hover:text-[#0f1a18]">Explore</Link>
            <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-[#0f1a18]">Leaderboard</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left dark card */}
          <div className="dark-card p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">COMMUNITY ACCESS</p>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              {tab === 'login' ? 'Welcome back.' : 'Join the network.'}
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {tab === 'login'
                ? 'Sign in with your credentials to access your dashboard, requests, and community tools.'
                : 'Create your profile, set your role, and start asking or offering help in the community.'}
            </p>
            <ul className="space-y-2">
              {(tab === 'login' ? [
                'Real authentication against live database',
                'Session persisted across page refreshes',
                'Access dashboard, AI Center, and leaderboard',
              ] : [
                'Set your role: Need Help, Can Help, or Both',
                'Add skills and interests for better matching',
                'Earn trust score by helping the community',
              ]).map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-[#0d9f8f] mt-0.5">•</span>{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right form card */}
          <div className="card p-8">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
              {(['login', 'signup'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setLoginError(''); setSignupError(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-white text-[#0f1a18] shadow-sm' : 'text-gray-500 hover:text-[#0f1a18]'}`}>
                  {t === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {tab === 'login' ? (
              <div className="space-y-4">
                <p className="label mb-1">EXISTING ACCOUNT</p>
                <h2 className="text-2xl font-bold text-[#0f1a18] mb-4">Sign in to HelpHub</h2>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Email</label>
                  <input type="email" placeholder="you@example.com" value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)} className={input}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Password</label>
                  <input type="password" placeholder="••••••••" value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)} className={input}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button onClick={handleLogin} disabled={loading}
                  className="teal-btn w-full py-3.5 text-sm mt-2 disabled:opacity-60">
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
                <p className="text-sm text-gray-400 text-center">
                  No account?{' '}
                  <button onClick={() => setTab('signup')} className="text-[#0d9f8f] font-medium hover:underline">
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="label mb-1">NEW ACCOUNT</p>
                <h2 className="text-2xl font-bold text-[#0f1a18] mb-4">Create your profile</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Full name</label>
                    <input type="text" placeholder="Ayesha Khan" value={name}
                      onChange={e => setName(e.target.value)} className={input} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Location</label>
                    <input type="text" placeholder="Karachi" value={location}
                      onChange={e => setLocation(e.target.value)} className={input} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Email</label>
                  <input type="email" placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)} className={input} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Password</label>
                  <input type="password" placeholder="Create a password" value={password}
                    onChange={e => setPassword(e.target.value)} className={input} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value as Role)} className={input}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">
                    Skills <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input type="text" placeholder="React, Figma, Python" value={skills}
                    onChange={e => setSkills(e.target.value)} className={input} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0f1a18] mb-1.5 block">
                    Interests <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input type="text" placeholder="Open Source, UI/UX, Teaching" value={interests}
                    onChange={e => setInterests(e.target.value)} className={input} />
                </div>
                {signupError && <p className="text-red-500 text-sm">{signupError}</p>}
                <button onClick={handleSignup} disabled={loading}
                  className="teal-btn w-full py-3.5 text-sm mt-2 disabled:opacity-60">
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
                <p className="text-sm text-gray-400 text-center">
                  Already have an account?{' '}
                  <button onClick={() => setTab('login')} className="text-[#0d9f8f] font-medium hover:underline">
                    Log in
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
