/**
 * Run this script whenever you update the knowledge base:
 *   npx ts-node --project tsconfig.json scripts/ingest-knowledge.ts
 *
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 *   - AZURE_OPENAI_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_VERSION must be set
 *   - The knowledge_chunks table must exist in Supabase (see README for SQL)
 */

import * as dotenv from "dotenv";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { AzureOpenAI } from "openai";

dotenv.config({ path: join(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
});

function chunkText(text: string, maxChars = 1200): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > maxChars && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 50);
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: process.env.AZURE_EMBEDDING_DEPLOYMENT ?? "text-embedding-3-small",
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

async function ingest() {
  const kbDir = join(__dirname, "../src/data/knowledge-base");
  const files = readdirSync(kbDir).filter((f) => f.endsWith(".md")).sort();

  console.log(`Found ${files.length} knowledge base files`);

  for (const file of files) {
    const source = file;
    const text = readFileSync(join(kbDir, file), "utf-8");
    const chunks = chunkText(text);

    console.log(`  ${file}: ${chunks.length} chunks`);

    // Delete existing chunks for this source
    await supabase.from("knowledge_chunks").delete().eq("source", source);

    // Embed in batches of 10
    for (let i = 0; i < chunks.length; i += 10) {
      const batch = chunks.slice(i, i + 10);
      const embeddings = await embedTexts(batch);
      const rows = batch.map((content, j) => ({
        source,
        content,
        embedding: embeddings[j],
      }));
      const { error } = await supabase.from("knowledge_chunks").insert(rows);
      if (error) console.error(`    Error inserting batch:`, error.message);
      else console.log(`    Inserted batch ${i / 10 + 1}`);
    }
  }

  console.log("\n✅ Ingestion complete");
}

ingest().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
