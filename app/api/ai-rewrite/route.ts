import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { title, description } = await req.json();

  if (!title && !description) {
    return Response.json({ rewrite: '' });
  }

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `You are helping someone write a clear, specific help request for a peer-to-peer community support platform called HelpHub.

Their draft:
Title: ${title || '(no title)'}
Description: ${description || '(no description)'}

Write an improved version of their description that:
- Opens with the core problem in one sentence
- States what they need help with specifically
- Mentions any context (deadline, what they tried, their skill level) only if present in the draft
- Is direct and human — no filler, no corporate tone
- Stays under 80 words

Return ONLY the rewritten description. No labels, no quotes, no intro sentence.`,
    });

    return Response.json({ rewrite: text.trim() });
  } catch (err) {
    console.error('[ai-rewrite]', err);
    return Response.json({ rewrite: '', error: 'AI unavailable' }, { status: 500 });
  }
}
