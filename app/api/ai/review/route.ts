// ============================================================
// FILE: app/api/ai/review/route.ts
// Author: Sajjan
// Purpose: Next.js API route — receives a prompt from the frontend,
//          forwards it to HuggingFace, returns the AI response.
//
// Uses the existing callWithRetry from huggingface-client.ts.
// Do NOT add new API keys or create a new HuggingFace client here.
//
// Test with curl:
//   curl -X POST http://localhost:3000/api/ai/review \
//        -H "Content-Type: application/json" \
//        -d '{"prompt": "Say hello"}'
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const result = await callWithRetry({ prompt, maxTokens: 300, temperature: 0.5 });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ text: result.text });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}