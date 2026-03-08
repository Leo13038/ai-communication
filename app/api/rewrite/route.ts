import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = body?.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "请输入内容" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
你是一个非暴力沟通表达助手。
你的任务是：分析用户原话，识别情绪、需要、冲突风险，并给出三种更容易被接受的表达。

你必须严格返回 JSON，不要输出任何额外文字。

返回格式：
{
  "emotion": "用户可能的情绪",
  "need": "用户可能的需要",
  "risk": 0,
  "rewrite": {
    "gentle": "温和版",
    "firm": "坚定版",
    "brief": "简洁版"
  }
}

要求：
1. 输出中文
2. 风格自然，像微信聊天
3. 不要说教
4. risk 是 0 到 100 的整数
5. gentle、firm、brief 都要能直接发送
6. brief 尽量短
7. 保留用户真实诉求，但降低攻击性
          `.trim(),
        },
        {
          role: "user",
          content: `原句：${text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(content);

    if (
      !data ||
      typeof data.emotion !== "string" ||
      typeof data.need !== "string" ||
      typeof data.risk !== "number" ||
      !data.rewrite ||
      typeof data.rewrite.gentle !== "string" ||
      typeof data.rewrite.firm !== "string" ||
      typeof data.rewrite.brief !== "string"
    ) {
      return NextResponse.json({ error: "AI返回格式不正确" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return NextResponse.json({ error: "AI生成失败" }, { status: 500 });
  }
}