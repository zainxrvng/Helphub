-- Run this in your Supabase SQL editor

create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  password text not null,
  role text not null default 'Both',
  location text default '',
  skills text[] default '{}',
  interests text[] default '{}',
  trust_score integer default 50,
  contributions integer default 0,
  badges text[] default '{}',
  color text default '#0d9f8f',
  created_at timestamptz default now()
);

create table if not exists help_requests (
  id text primary key,
  title text not null,
  description text default '',
  category text default 'Community',
  urgency text default 'Low',
  tags text[] default '{}',
  status text default 'Open',
  author_id text references users(id),
  author_name text not null,
  location text default '',
  helper_ids text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists messages (
  id text primary key,
  from_id text references users(id),
  from_name text not null,
  to_id text references users(id),
  to_name text not null,
  content text not null,
  time text default '',
  created_at timestamptz default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text references users(id),
  title text not null,
  type text default 'Status',
  time text default 'Just now',
  read boolean default false,
  created_at timestamptz default now()
);

-- Disable RLS (demo project — no auth required)
alter table users disable row level security;
alter table help_requests disable row level security;
alter table messages disable row level security;
alter table notifications disable row level security;

-- Seed demo users
insert into users (id, name, email, password, role, location, skills, interests, trust_score, contributions, badges, color)
values
  ('u1', 'Ayesha Khan', 'ayesha@helphub.ai', 'demo123', 'Both', 'Karachi', ARRAY['Figma','UI/UX','HTML/CSS','Career Guidance'], ARRAY['Hackathons','UI/UX','Community Building'], 100, 35, ARRAY['Design Ally','Fast Responder','Top Mentor'], '#f97316'),
  ('u2', 'Hassan Ali', 'hassan@helphub.ai', 'demo123', 'Can Help', 'Remote', ARRAY['JavaScript','React','Git/GitHub'], ARRAY['Open Source','Web Dev','Mentorship'], 88, 24, ARRAY['Code Rescuer','Bug Hunter'], '#1e293b'),
  ('u3', 'Sara Noor', 'sara@helphub.ai', 'demo123', 'Both', 'Remote', ARRAY['Python','Data Analysis'], ARRAY['Data Science','Research','Teaching'], 74, 11, ARRAY['Community Voice'], '#f97316')
on conflict (id) do nothing;

-- Seed help requests
insert into help_requests (id, title, description, category, urgency, tags, status, author_id, author_name, location, helper_ids)
values
  ('r1', 'Need help making my portfolio responsive before demo day', 'My HTML/CSS portfolio breaks on tablets and I need layout guidance before tomorrow evening.', 'Web Development', 'High', ARRAY['HTML/CSS','Responsive','Portfolio'], 'Solved', 'u3', 'Sara Noor', 'Karachi', ARRAY['u1']),
  ('r2', 'Looking for Figma feedback on a volunteer event poster', 'I have a draft poster for a campus community event and want sharper hierarchy, spacing, and CTA copy.', 'Design', 'Medium', ARRAY['Figma','Poster','Design Review'], 'Open', 'u1', 'Ayesha Khan', 'Lahore', ARRAY['u1']),
  ('r3', 'Need mock interview support for internship applications', 'Applying to frontend internships and need someone to practice behavioral and technical interview questions with me.', 'Career', 'Low', ARRAY['Interview Prep','Career','Frontend'], 'Solved', 'u3', 'Sara Noor', 'Remote', ARRAY['u1','u2']),
  ('r4', 'React state management help needed for final project', 'I have a React app with complex state and props drilling. Need guidance on when to use Context vs useState.', 'Web Development', 'Medium', ARRAY['React','JavaScript','State Management'], 'Open', 'u2', 'Hassan Ali', 'Remote', ARRAY[])
on conflict (id) do nothing;

-- Seed messages
insert into messages (id, from_id, from_name, to_id, to_name, content, time)
values
  ('m1', 'u1', 'Ayesha Khan', 'u3', 'Sara Noor', 'I checked your portfolio request. Share the breakpoint screenshots and I can suggest fixes.', '09:45 AM'),
  ('m2', 'u2', 'Hassan Ali', 'u1', 'Ayesha Khan', 'Your event poster concept is solid. I would tighten the CTA and reduce the background texture.', '11:10 AM')
on conflict (id) do nothing;

-- Seed notifications
insert into notifications (id, user_id, title, type, time, read)
values
  ('n1', 'u1', '"Portfolio responsive" request was marked as solved', 'Status', 'Just now', false),
  ('n2', 'u1', 'Hassan Ali offered help on your request', 'Match', 'Just now', false),
  ('n3', 'u1', 'Your request is now live in the community feed', 'Request', 'Just now', false),
  ('n4', 'u1', 'New helper matched to your responsive portfolio request', 'Match', '12 min ago', false),
  ('n5', 'u1', 'Your trust score increased after a solved request', 'Reputation', '1 hr ago', false),
  ('n6', 'u1', 'AI Center detected rising demand for interview prep', 'Insight', 'Today', true)
on conflict (id) do nothing;
