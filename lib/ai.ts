'use client';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Web Development': ['html', 'css', 'javascript', 'js', 'react', 'next', 'node', 'website', 'portfolio', 'responsive', 'frontend', 'backend', 'web', 'api'],
  'Design': ['figma', 'ui', 'ux', 'design', 'poster', 'logo', 'graphic', 'wireframe', 'prototype', 'color', 'typography', 'layout'],
  'Career': ['interview', 'resume', 'cv', 'job', 'internship', 'career', 'linkedin', 'salary', 'offer', 'application'],
  'Data Science': ['python', 'data', 'analysis', 'machine learning', 'ml', 'pandas', 'numpy', 'jupyter', 'sql', 'database'],
  'DevOps': ['docker', 'kubernetes', 'ci/cd', 'deployment', 'server', 'aws', 'cloud', 'git', 'github', 'pipeline'],
  'Community': ['event', 'meetup', 'workshop', 'community', 'networking', 'collaboration', 'team'],
};

const URGENCY_HIGH: string[] = ['urgent', 'asap', 'deadline', 'tomorrow', 'today', 'immediately', 'emergency', 'demo day', 'submission', 'tonight'];
const URGENCY_LOW: string[] = ['whenever', 'no rush', 'eventually', 'someday', 'leisure', 'when you can'];

export function detectCategory(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  let bestCategory = 'Community';
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(k => text.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  return bestCategory;
}

export function detectUrgency(title: string, description: string): 'Low' | 'Medium' | 'High' {
  const text = (title + ' ' + description).toLowerCase();
  if (URGENCY_HIGH.some(k => text.includes(k))) return 'High';
  if (URGENCY_LOW.some(k => text.includes(k))) return 'Low';
  return 'Medium';
}

type TagPair = [string, string];
type TagMap = Record<string, TagPair[]>;

export function suggestTags(title: string, description: string, category: string): string[] {
  const text = (title + ' ' + description).toLowerCase();
  const tagMap: TagMap = {
    'Web Development': [
      ['react', 'React'], ['html', 'HTML/CSS'], ['css', 'HTML/CSS'], ['responsive', 'Responsive'],
      ['portfolio', 'Portfolio'], ['javascript', 'JavaScript'], ['node', 'Node.js'],
      ['api', 'API'], ['debugging', 'Debugging'], ['frontend', 'Frontend'],
    ],
    'Design': [
      ['figma', 'Figma'], ['poster', 'Poster'], ['logo', 'Logo'], ['ux', 'UX'],
      ['wireframe', 'Wireframe'], ['review', 'Design Review'], ['color', 'Color Theory'],
    ],
    'Career': [
      ['interview', 'Interview Prep'], ['resume', 'Resume'], ['internship', 'Internship'],
      ['linkedin', 'LinkedIn'], ['frontend', 'Frontend'], ['career', 'Career'],
    ],
    'Data Science': [
      ['python', 'Python'], ['data', 'Data Analysis'], ['sql', 'SQL'], ['ml', 'Machine Learning'],
    ],
    'DevOps': [
      ['docker', 'Docker'], ['git', 'Git/GitHub'], ['deployment', 'Deployment'], ['ci/cd', 'CI/CD'],
    ],
    'Community': [
      ['event', 'Event'], ['workshop', 'Workshop'], ['mentorship', 'Mentorship'],
    ],
  };
  const pairs = tagMap[category] || tagMap['Community'];
  const tags = pairs.filter(([kw]) => text.includes(kw)).map(([, tag]) => tag);
  return tags.filter((t, i) => tags.indexOf(t) === i).slice(0, 4);
}

export function generateSummary(title: string, description: string, category: string, urgency: string): string {
  const urgencyLabel = urgency === 'High' ? 'high urgency' : urgency === 'Medium' ? 'moderate urgency' : 'low urgency';
  const helpers: Record<string, string> = {
    'Web Development': 'frontend mentors comfortable with CSS grids and media queries',
    'Design': 'design mentors with Figma and visual design expertise',
    'Career': 'career coaches with interview and mentorship experience',
    'Data Science': 'data practitioners with Python and analysis skills',
    'DevOps': 'engineers with deployment and infrastructure experience',
    'Community': 'community members with collaboration skills',
  };
  const helperType = helpers[category] || 'community members with relevant expertise';
  return `${category} request with ${urgencyLabel}. Best suited for ${helperType}.`;
}

export function generateRewrite(title: string, description: string): string {
  if (!description || description.length < 10) return '';
  return `${description.trim()} — Please reply with your availability so we can coordinate quickly.`;
}
