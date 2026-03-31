// ============================================================
// FILE: app/api/ai/review/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';

export async function POST(req: NextRequest) {
  try {
    const { prompt, maxTokens } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const result = await callWithRetry({
      prompt,
      maxTokens: maxTokens ?? 300,   // 300 for AI review, 2000 for question generation
      temperature: 0.5,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ text: result.text });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}