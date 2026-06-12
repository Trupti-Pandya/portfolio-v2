import { createClient } from "@supabase/supabase-js";
import { AzureOpenAI } from "openai";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function embedQuery(text: string): Promise<number[]> {
  const client = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_KEY!,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  });
  const res = await client.embeddings.create({
    model: process.env.AZURE_EMBEDDING_DEPLOYMENT ?? "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

export async function retrieveContext(query: string): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return "";

  try {
    const embedding = await embedQuery(query);

    const { data, error } = await supabase.rpc("match_knowledge_chunks", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (error || !data?.length) return "";

    return (data as { content: string }[])
      .map((row) => row.content)
      .join("\n\n");
  } catch {
    // RAG is best-effort — fall back to base knowledge base if it fails
    return "";
  }
}
