import { NextResponse } from "next/server";
import OpenAI from "openai";

type RewriteResponse = {
  emotion: string;
  need: string;
  risk: number;
  rewrite: {
    gentle: string;
    firm: string;
    brief: string;
  };
};

function getClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });
}

function isRewriteResponse(data: unknown): data is RewriteResponse {
  if (!data || typeof data !== "object") {
    return false;
  }

  const payload = data as Record<string, unknown>;
  const rewrite = payload.rewrite as Record<string, unknown> | undefined;

  return (
    typeof payload.emotion === "string" &&
    typeof payload.need === "string" &&
    typeof payload.risk === "number" &&
    Number.isInteger(payload.risk) &&
    payload.risk >= 0 &&
    payload.risk <= 100 &&
    !!rewrite &&
    typeof rewrite.gentle === "string" &&
    typeof rewrite.firm === "string" &&
    typeof rewrite.brief === "string"
  );
}

export async function POST(request: Request) {
  try {
    const client = getClient();
    if (!client) {
      return NextResponse.json(
        { error: "Server config error: DEEPSEEK_API_KEY is missing" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = body?.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "Input text is required" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a nonviolent communication assistant.
Analyze the user's original sentence and return:
1) emotion
2) need
3) conflict risk
4) three rewritten options (gentle, firm, brief)

Return strict JSON only, no extra text.

JSON format:
{
  "emotion": "string",
  "need": "string",
  "risk": 0,
  "rewrite": {
    "gentle": "string",
    "firm": "string",
    "brief": "string"
  }
}

Requirements:
- Use Chinese output.
- Keep natural chat tone.
- Avoid preachy style.
- risk must be an integer from 0 to 100.
- gentle, firm, brief should be directly sendable.
- brief should be concise.
- Keep user's intent while reducing aggression.
          `.trim(),
        },
        {
          role: "user",
          content: `Original sentence: ${text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed: unknown = JSON.parse(content);

    if (!isRewriteResponse(parsed)) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
