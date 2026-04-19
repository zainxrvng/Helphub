import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: `You are HelpHub AI Admin Assistant — a sharp, data-driven analyst for HelpHub, a peer-to-peer community support platform where members help each other with tech, design, and career problems.

Here is the live platform data you have access to:
${context ?? 'No context provided.'}

Your job:
- Give specific, actionable insights using the REAL names, numbers, and data above
- Name users directly when making recommendations (e.g. "Hassan Ali should get +10 trust because...")
- Flag requests that need immediate attention by title
- Suggest specific badges for specific users based on their actual skills and contributions
- Identify patterns: which categories lack helpers, which users are overloaded, which requests are stale
- When asked for a report, structure it clearly with sections

Rules:
- Never be vague. Use actual names, numbers, and titles from the data.
- Keep responses concise but complete — use bullet points for lists
- If data is sparse, say so honestly and suggest how to grow the platform`,
    messages: await convertToModelMessages(messages),
  });

  return result.toTextStreamResponse();
}
