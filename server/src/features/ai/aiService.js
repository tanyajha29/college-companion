import OpenAI from "openai";
import { env } from "../../config/env.js";

const hasOllama = Boolean(env.ollama?.url);
const hasOpenAI = Boolean(env.openai?.apiKey);

const DEFAULT_MODEL = env.ollama?.model || "llama3.1:8b";

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {
      return null;
    }
    return null;
  }
};

const normalizeResponse = (rawText) => {
  const parsed = safeJsonParse(rawText) || {};
  const toArray = (val) => (Array.isArray(val) ? val : val ? [String(val)] : []);

  return {
    score: Number.isFinite(parsed.score) ? Math.max(0, Math.min(100, parsed.score)) : 0,
    summary: parsed.summary || "No summary provided.",
    strengths: toArray(parsed.strengths),
    gaps: toArray(parsed.gaps),
    suggestions: toArray(parsed.suggestions),
    keywordMatch: parsed.keywordMatch || parsed.keyword_match || null,
    atsReadiness: parsed.atsReadiness || parsed.ats_readiness || null,
    raw: rawText,
  };
};

const buildPrompt = ({ resumeText, jobDescription }) => `
You are an ATS-style evaluator. Compare the resume to the job description and reply with JSON ONLY.
Return fields:
- score: integer 0-100
- summary: short string
- strengths: array of short strings
- gaps: array of short strings
- suggestions: array of short strings (actionable improvements)
- keywordMatch: short string or percentage
- atsReadiness: short note

Do not include markdown or explanations outside JSON.
Resume:
${resumeText}

Job Description:
${jobDescription}
`.trim();

const callOllama = async (prompt) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  const response = await fetch(`${env.ollama.url}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.2 },
    }),
    signal: controller.signal,
  });
  clearTimeout(timeout);
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error: ${err}`);
  }
  const data = await response.json();
  return data.response || "";
};

const callOpenAI = async (prompt) => {
  const client = new OpenAI({ apiKey: env.openai.apiKey });
  const response = await client.responses.create({
    model: env.openai.model || "gpt-4o-mini",
    input: prompt,
    temperature: 0.2,
  });
  return response.output_text || "";
};

export const scoreResume = async ({ resumeText, jobDescription }) => {
  if (!resumeText || !jobDescription) {
    throw new Error("Missing resume or job description");
  }

  const prompt = buildPrompt({ resumeText, jobDescription });
  let raw;

  if (hasOllama) {
    raw = await callOllama(prompt);
  } else if (hasOpenAI) {
    raw = await callOpenAI(prompt);
  } else {
    const err = new Error("AI service not configured");
    err.statusCode = 503;
    throw err;
  }

  return normalizeResponse(raw);
};
