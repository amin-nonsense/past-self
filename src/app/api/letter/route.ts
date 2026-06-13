import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildLetterPrompt } from "@/lib/prompt";
import { AppData } from "@/lib/storage";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { fragment, history, appData, askAboutPast } = await req.json();

  const messages = [
    ...(history || []),
    { role: "user", content: fragment },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: buildLetterPrompt(appData as AppData, !!askAboutPast),
    messages,
  });

  const letter = (response.content[0] as { type: string; text: string }).text;

  return NextResponse.json({ letter });
}
