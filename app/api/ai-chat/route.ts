import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: `You are HelpHub AI Admin Assistant — an intelligent analyst for HelpHub, a peer-to-peer community support platform.

Platform context:
${context ?? 'No context provided.'}

Your role:
- Analyze platform data and provide actionable insights
- Help admins moderate content and manage users
- Suggest trust score adjustments and badge awards
- Identify trends, at-risk requests, and top performers

Be concise, data-driven, and practical.`,
    messages,
  });

  return result.toTextStreamResponse();
}
