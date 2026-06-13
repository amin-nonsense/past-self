import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { PastSelf } from "@/lib/storage";

const client = new Anthropic();

const EXTRACT_PROMPT = `会話から「小学生のあみん」についてわかったことを抽出してください。

明示された情報だけでなく、会話から自然に推測できることも含めてください。
（例：「川でザリガニを捕まえてた」→「自然の中で一人でいる時間が好きだった」も추加）

以下のJSON形式で返してください。該当なければ空配列。JSON以外は出力しない。

{
  "places": ["よくいた場所・好きな場所"],
  "things": ["好きなもの・ハマってたもの"],
  "people": ["家族・友達・苦手な人についての記述"],
  "habits": ["口癖・よくやってたこと"],
  "emotions": ["嬉しかった・つらかった記憶"],
  "selfImage": ["自分がどんな子だったかの記述や推測"]
}`;

export async function POST(req: NextRequest) {
  const { conversation } = await req.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: EXTRACT_PROMPT,
    messages: [
      {
        role: "user",
        content: `以下の会話から抽出してください：\n\n${conversation}`,
      },
    ],
  });

  const text = (response.content[0] as { type: string; text: string }).text;

  try {
    const extracted = JSON.parse(text) as Partial<PastSelf>;
    return NextResponse.json({ extracted });
  } catch {
    return NextResponse.json({ extracted: {} });
  }
}
