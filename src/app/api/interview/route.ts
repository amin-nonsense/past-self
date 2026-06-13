import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { INTERVIEW_PROMPT } from "@/lib/prompt";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { history } = await req.json();

  const messages = history && history.length > 0
    ? history
    : [{ role: "user", content: "はじめて" }];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: INTERVIEW_PROMPT,
    messages,
  });

  const letter = (response.content[0] as { type: string; text: string }).text;

  return NextResponse.json({ letter });
}
