const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3:latest";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatWithOllama(
  messages: OllamaMessage[],
  model: string = DEFAULT_MODEL
): Promise<ReadableStream<Uint8Array>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 120000); // 120s timeout

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      if (response.status === 404 && !model.includes(":")) {
        console.log(`[Ollama] Model '${model}' not found, trying '${model}:latest'...`);
        return chatWithOllama(messages, `${model}:latest`);
      }
      throw new Error(`Ollama API error: ${response.status}`);
    }

    return response.body!;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Ollama request timed out after 60 seconds');
    }
    throw err;
  }
}

export async function chatWithOllamaJSON(
  messages: OllamaMessage[],
  model: string = DEFAULT_MODEL
): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 120000); // 120s timeout

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      if (response.status === 404 && !model.includes(":")) {
        console.log(`[Ollama] Model '${model}' not found, trying '${model}:latest'...`);
        return chatWithOllamaJSON(messages, `${model}:latest`);
      }
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Ollama request timed out after 60 seconds');
    }
    throw err;
  }
}

export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

export function buildSystemPrompt(aboutData?: {
  name?: string;
  bio1?: string;
  bio2?: string;
  location?: string;
  email?: string;
}): string {
  const name = aboutData?.name || "The Developer";
  return `You are an AI assistant for ${name}'s professional portfolio website.

About ${name}:
${aboutData?.bio1 || "A passionate full-stack developer with expertise in modern web technologies."}
${aboutData?.bio2 || ""}

Location: ${aboutData?.location || "India"}
Contact: ${aboutData?.email || "nithish@example.com"}

Your role:
- Answer questions about Nithish's skills, projects, and experience
- Help visitors understand how to contact or hire Nithish
- Be professional, friendly, and concise
- If asked about specific technical questions, answer them helpfully
- Do NOT make up information not provided above
- Keep responses under 200 words unless detailed explanation is needed`;
}
