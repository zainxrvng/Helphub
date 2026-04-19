import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { title, description } = await req.json();

  if (!title && !description) {
    return Response.json({ rewrite: '' });
  }

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: `You are helping someone write a clear, specific help request for a peer support platform.

Their request:
Title: ${title || '(no title)'}
Description: ${description || '(no description)'}

Rewrite the description to be clearer and more actionable. The rewrite should:
- Clearly state what the problem is
- Mention what they've already tried (if implied)
- Specify exactly what kind of help they need
- Be direct and specific — no filler phrases
- Stay under 80 words
- Sound natural, not robotic

Return ONLY the rewritten description text. No labels, no quotes, no explanation.`,
  });

  return Response.json({ rewrite: text.trim() });
}
