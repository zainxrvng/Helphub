'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession, clearSession, getNotifications, type User } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    if (session) {
      getNotifications(session.id).then(n => setUnread(n.filter(x => !x.read).length));
    }
  }, [pathname]);

  function handleLogout() {
    clearSession();
    router.push('/');
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  if (!user) return null;

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Explore', href: '/explore' },
    { label: 'Create Request', href: '/create-request' },
    { label: 'Messages', href: '/messages' },
    { label: 'AI Center', href: '/ai-center' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Profile', href: '/profile' },
    { label: '⚙ Admin', href: '/admin' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0d9f8f] rounded-lg flex items-center justify-center text-white font-bold text-sm">H</div>
          <span className="font-semibold text-[#0f1a18] text-sm">HelpHub AI</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors relative ${
                isActive(link.href)
                  ? 'bg-[#0f1a18] text-white'
                  : 'text-gray-500 hover:text-[#0f1a18] hover:bg-gray-100'
              }`}>
              {link.label}
              {link.href === '/notifications' && unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[8px] font-bold bg-[#0d9f8f] text-white rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/profile"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: user.color || '#0d9f8f' }}>
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </Link>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Exit
          </button>
        </div>
      </div>
    </nav>
  );
}
