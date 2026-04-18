'use client';

import { getSupabase } from './supabase';

export type Role = 'Need Help' | 'Can Help' | 'Both';
export type Urgency = 'Low' | 'Medium' | 'High';
export type RequestStatus = 'Open' | 'Solved';
export type NotifType = 'Status' | 'Match' | 'Request' | 'Reputation' | 'Insight';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  location: string;
  skills: string[];
  interests: string[];
  trustScore: number;
  contributions: number;
  badges: string[];
  color: string;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: Urgency;
  tags: string[];
  status: RequestStatus;
  authorId: string;
  authorName: string;
  location: string;
  helperIds: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  content: string;
  time: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  type: NotifType;
  time: string;
  read: boolean;
}

// Fallback demo data (used if Supabase is empty or unreachable)
const FALLBACK_REQUESTS: HelpRequest[] = [
  {
    id: 'r1', title: 'Need help making my portfolio responsive before demo day',
    description: 'My HTML/CSS portfolio breaks on tablets and I need layout guidance before tomorrow evening.',
    category: 'Web Development', urgency: 'High', tags: ['HTML/CSS', 'Responsive', 'Portfolio'],
    status: 'Solved', authorId: 'u3', authorName: 'Sara Noor', location: 'Karachi', helperIds: ['u1'], createdAt: '',
  },
  {
    id: 'r2', title: 'Looking for Figma feedback on a volunteer event poster',
    description: 'I have a draft poster for a campus community event and want sharper hierarchy, spacing, and CTA copy.',
    category: 'Design', urgency: 'Medium', tags: ['Figma', 'Poster', 'Design Review'],
    status: 'Open', authorId: 'u1', authorName: 'Ayesha Khan', location: 'Lahore', helperIds: ['u1'], createdAt: '',
  },
  {
    id: 'r3', title: 'Need mock interview support for internship applications',
    description: 'Applying to frontend internships and need someone to practice behavioral and technical interview questions with me.',
    category: 'Career', urgency: 'Low', tags: ['Interview Prep', 'Career', 'Frontend'],
    status: 'Solved', authorId: 'u3', authorName: 'Sara Noor', location: 'Remote', helperIds: ['u1', 'u2'], createdAt: '',
  },
  {
    id: 'r4', title: 'React state management help needed for final project',
    description: 'I have a React app with complex state and props drilling. Need guidance on when to use Context vs useState.',
    category: 'Web Development', urgency: 'Medium', tags: ['React', 'JavaScript', 'State Management'],
    status: 'Open', authorId: 'u2', authorName: 'Hassan Ali', location: 'Remote', helperIds: [], createdAt: '',
  },
];

const FALLBACK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', title: '"Portfolio responsive" request was marked as solved', type: 'Status', time: 'Just now', read: false },
  { id: 'n2', userId: 'u1', title: 'Hassan Ali offered help on your request', type: 'Match', time: 'Just now', read: false },
  { id: 'n3', userId: 'u1', title: 'Your request is now live in the community feed', type: 'Request', time: 'Just now', read: false },
  { id: 'n4', userId: 'u1', title: 'New helper matched to your responsive portfolio request', type: 'Match', time: '12 min ago', read: false },
  { id: 'n5', userId: 'u1', title: 'Your trust score increased after a solved request', type: 'Reputation', time: '1 hr ago', read: false },
  { id: 'n6', userId: 'u1', title: 'AI Center detected rising demand for interview prep', type: 'Insight', time: 'Today', read: true },
];

const FALLBACK_MESSAGES: Message[] = [
  { id: 'm1', fromId: 'u1', fromName: 'Ayesha Khan', toId: 'u3', toName: 'Sara Noor', content: 'I checked your portfolio request. Share the breakpoint screenshots and I can suggest fixes.', time: '09:45 AM' },
  { id: 'm2', fromId: 'u2', fromName: 'Hassan Ali', toId: 'u1', toName: 'Ayesha Khan', content: 'Your event poster concept is solid. I would tighten the CTA and reduce the background texture.', time: '11:10 AM' },
];

const FALLBACK_USERS: User[] = [
  {
    id: 'u1', name: 'Ayesha Khan', email: 'ayesha@helphub.ai', password: 'demo123',
    role: 'Both', location: 'Karachi',
    skills: ['Figma', 'UI/UX', 'HTML/CSS', 'Career Guidance'],
    interests: ['Hackathons', 'UI/UX', 'Community Building'],
    trustScore: 100, contributions: 35,
    badges: ['Design Ally', 'Fast Responder', 'Top Mentor'], color: '#f97316',
  },
  {
    id: 'u2', name: 'Hassan Ali', email: 'hassan@helphub.ai', password: 'demo123',
    role: 'Can Help', location: 'Remote',
    skills: ['JavaScript', 'React', 'Git/GitHub'],
    interests: ['Open Source', 'Web Dev', 'Mentorship'],
    trustScore: 88, contributions: 24,
    badges: ['Code Rescuer', 'Bug Hunter'], color: '#1e293b',
  },
  {
    id: 'u3', name: 'Sara Noor', email: 'sara@helphub.ai', password: 'demo123',
    role: 'Both', location: 'Remote',
    skills: ['Python', 'Data Analysis'],
    interests: ['Data Science', 'Research', 'Teaching'],
    trustScore: 74, contributions: 11,
    badges: ['Community Voice'], color: '#f97316',
  },
];

// Row mappers (Supabase snake_case → camelCase)
function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    password: row.password as string,
    role: row.role as Role,
    location: (row.location as string) || '',
    skills: (row.skills as string[]) || [],
    interests: (row.interests as string[]) || [],
    trustScore: (row.trust_score as number) || 0,
    contributions: (row.contributions as number) || 0,
    badges: (row.badges as string[]) || [],
    color: (row.color as string) || '#0d9f8f',
  };
}

function mapRequest(row: Record<string, unknown>): HelpRequest {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    category: (row.category as string) || 'Community',
    urgency: (row.urgency as Urgency) || 'Low',
    tags: (row.tags as string[]) || [],
    status: (row.status as RequestStatus) || 'Open',
    authorId: (row.author_id as string) || '',
    authorName: (row.author_name as string) || '',
    location: (row.location as string) || '',
    helperIds: (row.helper_ids as string[]) || [],
    createdAt: (row.created_at as string) || '',
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    fromId: (row.from_id as string) || '',
    fromName: (row.from_name as string) || '',
    toId: (row.to_id as string) || '',
    toName: (row.to_name as string) || '',
    content: (row.content as string) || '',
    time: (row.time as string) || '',
  };
}

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    userId: (row.user_id as string) || '',
    title: (row.title as string) || '',
    type: (row.type as NotifType) || 'Status',
    time: (row.time as string) || 'Just now',
    read: (row.read as boolean) || false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function withTimeout<T = any>(thenable: PromiseLike<T>, ms = 5000): Promise<T> {
  return Promise.race([
    Promise.resolve(thenable),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

// ── Auth ─────────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await withTimeout(
      getSupabase().from('users').select('*').eq('email', email).eq('password', password).single()
    );
    if (!error && data) return mapUser(data);
  } catch {}
  // Fallback: check demo users if Supabase unreachable or RLS blocks
  const fallback = FALLBACK_USERS.find(u => u.email === email && u.password === password);
  return fallback || null;
}

export async function registerUser(fields: {
  name: string; email: string; password: string; role: Role;
  location: string; skills: string[]; interests: string[];
}): Promise<{ user: User | null; error: string | null }> {
  const id = 'u' + Date.now();
  const newUser = {
    id, name: fields.name, email: fields.email, password: fields.password,
    role: fields.role, location: fields.location, skills: fields.skills,
    interests: fields.interests, trust_score: 50, contributions: 0,
    badges: [], color: '#0d9f8f',
  };
  const { data, error } = await withTimeout(
    getSupabase().from('users').insert(newUser).select().single()
  );
  if (error) return { user: null, error: error.message };
  return { user: data ? mapUser(data) : null, error: null };
}

// ── Users ───────────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await withTimeout(getSupabase().from('users').select('*').order('trust_score', { ascending: false }));
    if (error || !data || data.length === 0) return FALLBACK_USERS;
    return data.map(mapUser);
  } catch {
    return FALLBACK_USERS;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data } = await withTimeout(getSupabase().from('users').select('*').eq('id', id).single());
    if (data) return mapUser(data);
  } catch {}
  return FALLBACK_USERS.find(u => u.id === id) || null;
}

export async function updateUser(id: string, patch: Partial<User>) {
  // Always patch in-memory fallback so changes persist when Supabase is unavailable
  const fb = FALLBACK_USERS.find(u => u.id === id);
  if (fb) Object.assign(fb, patch);

  try {
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.location !== undefined) dbPatch.location = patch.location;
    if (patch.skills !== undefined) dbPatch.skills = patch.skills;
    if (patch.interests !== undefined) dbPatch.interests = patch.interests;
    if (patch.role !== undefined) dbPatch.role = patch.role;
    if (patch.trustScore !== undefined) dbPatch.trust_score = patch.trustScore;
    if (patch.contributions !== undefined) dbPatch.contributions = patch.contributions;
    if (patch.badges !== undefined) dbPatch.badges = patch.badges;
    await getSupabase().from('users').update(dbPatch).eq('id', id);
  } catch {}
}

// ── Help Requests ────────────────────────────────────────
export async function getRequests(): Promise<HelpRequest[]> {
  try {
    const { data, error } = await withTimeout(getSupabase().from('help_requests').select('*').order('created_at', { ascending: false }));
    if (error || !data || data.length === 0) return FALLBACK_REQUESTS;
    return data.map(mapRequest);
  } catch {
    return FALLBACK_REQUESTS;
  }
}

export async function getRequestById(id: string): Promise<HelpRequest | null> {
  try {
    const { data } = await withTimeout(getSupabase().from('help_requests').select('*').eq('id', id).single());
    return data ? mapRequest(data) : (FALLBACK_REQUESTS.find(r => r.id === id) || null);
  } catch {
    return FALLBACK_REQUESTS.find(r => r.id === id) || null;
  }
}

export async function createRequest(req: Omit<HelpRequest, 'createdAt'>): Promise<void> {
  try {
    await getSupabase().from('help_requests').insert({
      id: req.id,
      title: req.title,
      description: req.description,
      category: req.category,
      urgency: req.urgency,
      tags: req.tags,
      status: req.status,
      author_id: req.authorId,
      author_name: req.authorName,
      location: req.location,
      helper_ids: req.helperIds,
    });
  } catch {}
}

export async function updateRequest(id: string, patch: Partial<HelpRequest>) {
  // Patch in-memory fallback so changes survive without Supabase
  const fb = FALLBACK_REQUESTS.find(r => r.id === id);
  if (fb) Object.assign(fb, patch);

  try {
    const dbPatch: Record<string, unknown> = {};
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.helperIds !== undefined) dbPatch.helper_ids = patch.helperIds;
    if (patch.title !== undefined) dbPatch.title = patch.title;
    await getSupabase().from('help_requests').update(dbPatch).eq('id', id);
  } catch {}
}

// ── Messages ─────────────────────────────────────────────
export async function getMessages(): Promise<Message[]> {
  try {
    const { data } = await withTimeout(getSupabase().from('messages').select('*').order('created_at', { ascending: true }));
    if (!data || data.length === 0) return FALLBACK_MESSAGES;
    return data.map(mapMessage);
  } catch {
    return FALLBACK_MESSAGES;
  }
}

export async function createMessage(msg: Message): Promise<void> {
  try {
    await getSupabase().from('messages').insert({
      id: msg.id,
      from_id: msg.fromId,
      from_name: msg.fromName,
      to_id: msg.toId,
      to_name: msg.toName,
      content: msg.content,
      time: msg.time,
    });
  } catch {}
}

// ── Notifications ─────────────────────────────────────────
export async function getNotifications(userId?: string): Promise<Notification[]> {
  try {
    let query = getSupabase().from('notifications').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data } = await withTimeout(query);
    if (!data || data.length === 0) {
      return userId ? FALLBACK_NOTIFICATIONS.filter(n => n.userId === userId) : FALLBACK_NOTIFICATIONS;
    }
    return data.map(mapNotification);
  } catch {
    return userId ? FALLBACK_NOTIFICATIONS.filter(n => n.userId === userId) : FALLBACK_NOTIFICATIONS;
  }
}

export async function addNotification(userId: string, title: string, type: NotifType): Promise<void> {
  try {
    await getSupabase().from('notifications').insert({
      id: 'n' + Date.now(),
      user_id: userId,
      title,
      type,
      time: 'Just now',
      read: false,
    });
  } catch {}
}

export async function markNotificationsRead(userId: string): Promise<void> {
  try {
    await getSupabase().from('notifications').update({ read: true }).eq('user_id', userId);
  } catch {}
}

// ── Session (localStorage) ────────────────────────────────
const SESSION_KEY = 'hh_session';

export function getSession(): User | null {
  if (typeof window === 'undefined') return null;
  const s = localStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}

export function setSession(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
