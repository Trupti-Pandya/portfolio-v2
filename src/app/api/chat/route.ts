import { NextRequest } from "next/server";
import { AzureOpenAI } from "openai";
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { PERSONAS, Provider } from "@/lib/personas";
import { retrieveContext } from "@/lib/rag";
import { createBookingRequest, resolveBaseUrl } from "@/lib/booking";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function loadKnowledgeBase(): string {
  try {
    const dir = join(process.cwd(), "src/data/knowledge-base");
    const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
    return files
      .map((f) => readFileSync(join(dir, f), "utf-8"))
      .join("\n\n---\n\n");
  } catch {
    return "";
  }
}

function buildSystemPrompt(provider: Provider, ragContext?: string): string {
  const kb = loadKnowledgeBase();
  const persona = PERSONAS[provider];
  const parts = [persona];
  if (kb) parts.push(`KNOWLEDGE BASE — use this as your primary source of truth about Trupti:\n\n${kb}`);
  if (ragContext) parts.push(`RETRIEVED CONTEXT — most relevant to the current question:\n\n${ragContext}`);
  return parts.join("\n\n---\n\n");
}

// The AI emits this machine-readable marker once it has all four booking
// details. It is parsed server-side and stripped from the visible stream.
const MARKER_START = "[[BOOKING]]";

interface BookingDetails {
  name: string;
  email: string;
  preferredTime: string;
  reason: string;
  company?: string;
  notes?: string;
}

// Parse the booking JSON out of the held marker text. Tolerant of a missing
// closing tag, but requires valid JSON with the four required fields non-empty.
// Company and notes are optional.
function parseBookingMarker(held: string): BookingDetails | null {
  const match = held.match(/\[\[BOOKING\]\]\s*(\{[\s\S]*?\})\s*(?:\[\[\/BOOKING\]\])?/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[1]) as Partial<Record<keyof BookingDetails, unknown>>;
    const name = String(obj.name ?? "").trim();
    const email = String(obj.email ?? "").trim();
    const preferredTime = String(obj.preferredTime ?? "").trim();
    const reason = String(obj.reason ?? "").trim();
    const company = String(obj.company ?? "").trim();
    const notes = String(obj.notes ?? "").trim();
    if (name && email && preferredTime && reason) {
      return { name, email, preferredTime, reason, company, notes };
    }
  } catch {
    // Malformed JSON — treat as no valid booking.
  }
  return null;
}

async function* streamAzure(messages: ChatMessage[], provider: Provider, ragContext: string): AsyncGenerator<string> {
  const client = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_KEY!,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  });

  const stream = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT!,
    messages: [
      { role: "system", content: buildSystemPrompt(provider, ragContext) },
      ...messages,
    ],
    max_tokens: 600,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

async function* streamAWS(messages: ChatMessage[], provider: Provider, ragContext: string): AsyncGenerator<string> {
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const body = JSON.stringify({
    system: [{ text: buildSystemPrompt(provider, ragContext) }],
    messages: messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: [{ text: m.content }],
    })),
    inferenceConfig: { maxTokens: 600 },
  });

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: "amazon.nova-lite-v1:0",
    body,
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await client.send(command);
  if (!response.body) return;

  for await (const event of response.body) {
    if (event.chunk?.bytes) {
      const decoded = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
      const text = decoded.contentBlockDelta?.delta?.text;
      if (text) yield text;
    }
  }
}

async function* streamGCP(messages: ChatMessage[], provider: Provider, ragContext: string): AsyncGenerator<string> {
  const genAI = new GoogleGenerativeAI(process.env.GCP_GEMINI_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: buildSystemPrompt(provider, ragContext),
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessageStream(lastMessage);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

const streamers: Record<Provider, (msgs: ChatMessage[], p: Provider, rag: string) => AsyncGenerator<string>> = {
  azure: streamAzure,
  aws: streamAWS,
  gcp: streamGCP,
};

export async function POST(req: NextRequest) {
  try {
    const { messages, provider } = await req.json() as {
      messages: ChatMessage[];
      provider: Provider;
    };

    if (!messages?.length || !provider || !streamers[provider]) {
      return new Response(JSON.stringify({ error: "Missing messages or invalid provider" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastUserMsg = messages[messages.length - 1]?.content ?? "";
    const ragContext = await retrieveContext(lastUserMsg);
    const baseUrl = resolveBaseUrl(req.nextUrl.origin);

    const encoder = new TextEncoder();
    const send = (controller: ReadableStreamDefaultController, obj: unknown) =>
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

    const stream = new ReadableStream({
      async start(controller) {
        // `buffer` holds streamed text not yet flushed to the client (it may end
        // in a partial marker prefix). Once the marker is seen, all subsequent
        // text accumulates in `held` and is never shown to the visitor.
        let buffer = "";
        let held = "";
        let markerSeen = false;

        const flush = () => {
          if (markerSeen) return;
          const idx = buffer.indexOf(MARKER_START);
          if (idx !== -1) {
            const emit = buffer.slice(0, idx);
            held = buffer.slice(idx);
            buffer = "";
            markerSeen = true;
            if (emit) send(controller, { chunk: emit });
            return;
          }
          // No full marker yet: hold back any tail that could be its start,
          // in case the marker is split across streamed chunks.
          let hold = 0;
          const maxCheck = Math.min(buffer.length, MARKER_START.length - 1);
          for (let n = maxCheck; n > 0; n--) {
            if (MARKER_START.startsWith(buffer.slice(buffer.length - n))) {
              hold = n;
              break;
            }
          }
          const emit = buffer.slice(0, buffer.length - hold);
          buffer = buffer.slice(buffer.length - hold);
          if (emit) send(controller, { chunk: emit });
        };

        try {
          for await (const chunk of streamers[provider](messages, provider, ragContext)) {
            if (markerSeen) {
              held += chunk;
              continue;
            }
            buffer += chunk;
            flush();
          }
          // Flush any safe remainder (the held-back tail was never a real marker).
          if (!markerSeen && buffer) {
            send(controller, { chunk: buffer });
            buffer = "";
          }

          // If the AI emitted a booking marker, submit it and report the outcome
          // honestly — no silent failures.
          if (markerSeen) {
            const details = parseBookingMarker(held);
            let ok = false;
            if (details) {
              try {
                await createBookingRequest({ ...details, baseUrl });
                ok = true;
              } catch (err) {
                console.error("[/api/chat booking submit]", err);
              }
            }
            send(controller, { booking: ok ? "submitted" : "failed" });
          }

          send(controller, { done: true });
          controller.close();
        } catch (err) {
          send(controller, { error: "Stream error" });
          controller.close();
          console.error("[/api/chat stream]", err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
