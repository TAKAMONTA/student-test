import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/db/client";
import { topics, aiChats } from "@/db/schema";
import { requirePurchased } from "@/lib/auth";
import { getUtcDayKey, refundAiQuestion, reserveAiQuestion, shouldRefundAiQuestion } from "@/lib/ai-rate-limit";

const bodySchema = z.object({ prompt: z.string().min(1).max(500) });
const DAILY_LIMIT = 30;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePurchased();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  const { id } = await params;
  const topicId = parseInt(id, 10);
  if (isNaN(topicId)) return new Response("Invalid id", { status: 400 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return new Response("Invalid body", { status: 400 });
  const { prompt } = parsed.data;

  const db = getDb();
  const topic = await db.select().from(topics).where(eq(topics.id, topicId)).get();
  if (!topic) return new Response("Not found", { status: 404 });

  const day = getUtcDayKey();
  const quota = await reserveAiQuestion(db, {
    userId: user.id,
    day,
    limit: DAILY_LIMIT,
  });
  if (!quota.allowed) {
    return new Response(JSON.stringify({ error: "Daily limit reached" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-Rate-Limit-Remaining": String(quota.remaining),
      },
    });
  }

  const client = new Anthropic({ apiKey: process.env["ANTHROPIC_API_KEY"] });

  const systemPrompt = `あなたは中学1年生向けの${topic.name}の家庭教師です。
わかりやすく丁寧に、中学生に合わせた言葉で説明してください。
数式や図は文字で表現してください。回答は300文字以内を目安にしてください。`;

  const encoder = new TextEncoder();
  let fullResponse = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let deliveredOutput = false;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-haiku-4-5",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const chunk of anthropicStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            fullResponse += chunk.delta.text;
            deliveredOutput = true;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
          if (chunk.type === "message_delta") {
            outputTokens = chunk.usage.output_tokens;
          }
          if (chunk.type === "message_start") {
            inputTokens = chunk.message.usage.input_tokens;
          }
        }

        await db.insert(aiChats).values({
          userId: user.id,
          topicId,
          prompt,
          response: fullResponse,
          tokensIn: inputTokens,
          tokensOut: outputTokens,
          createdAt: new Date(),
        }).execute();

        controller.close();
      } catch (err) {
        if (shouldRefundAiQuestion({ deliveredOutput })) {
          await refundAiQuestion(db, { userId: user.id, day });
        }
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Rate-Limit-Remaining": String(quota.remaining),
    },
  });
}
