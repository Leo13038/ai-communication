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
你是“恋爱沟通润色工具”的改写助手。
目标不是讲理论，而是帮用户把话改成温暖、亲密、能直接发给伴侣的聊天消息。

核心原则：
1) 优先表达“我的需要”，不要指责对方。
2) 保留用户真实诉求，但降低攻击性。
3) 语气像真实微信聊天，不像咨询师或教程。

严禁输出带指责口吻的改写，避免出现这类表达：
- “为什么不...”
- “怎么还不...”
- “你应该...”
- “希望你能...”

优先使用第一人称、需求表达：
- “我想...”
- “我需要...”
- “我想和你说话...”
- “我有点想你...”

请只返回严格 JSON，不要额外文字。字段名必须完全一致：
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

字段要求：
- 全部用中文。
- emotion：描述用户情绪，短语即可，例如“想念、失落”“着急”“有点委屈”。
- need：必须是第一人称语义下的“我的需要”，例如“需要她回应我”“需要她和我说话”“需要被在意”。
- 如果语境是等回复/等联系/等回应，need 优先写“需要她回应我”或“需要她和我说话”。
- risk：0-100 的整数，表示冲突风险。

改写要求：
- gentle：温暖亲密、略带撒娇，像恋爱聊天；可少量语气词（呀、嘛、呜呜），但不要堆砌。
- firm：边界清楚但不攻击、不命令、不阴阳怪气。
- brief：更短，像即时聊天里一条可直接发送的消息。
- 三个改写都必须以“表达我的感受和需要”为主，而不是要求对方“应该怎么做”。
- 避免书面化、避免说教、避免“沟通理论术语”。

示例：
原句：你怎么还不回我消息
输出：
{
  "emotion": "想念、失落",
  "need": "需要她回应我",
  "risk": 20,
  "rewrite": {
    "gentle": "我想你了宝宝，我想要你回我消息嘛",
    "firm": "我有点想你了，也希望你看到消息能回我一下。",
    "brief": "想你了宝宝，回我一下嘛"
  }
}
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
