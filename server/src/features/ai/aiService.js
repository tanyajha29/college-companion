import { env } from "../../config/env.js";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockRegion = env.bedrock?.region || "us-east-1";
const bedrockModelId = env.bedrock?.modelId || "us.amazon.nova-lite-v1:0";

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
  const toNumber = (val) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : null;
  };

  return {
    score: Number.isFinite(parsed.score) ? Math.max(0, Math.min(100, parsed.score)) : 0,
    summary: parsed.summary || "No summary provided.",
    strengths: toArray(parsed.strengths),
    gaps: toArray(parsed.gaps),
    suggestions: toArray(parsed.suggestions),
    keywordMatch: toNumber(parsed.keywordMatch ?? parsed.keyword_match),
    atsReadiness: toNumber(parsed.atsReadiness ?? parsed.ats_readiness),
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

const bedrock = new BedrockRuntimeClient({
  region: bedrockRegion,
});

const callBedrock = async (prompt) => {
  const command = new ConverseCommand({
    modelId: bedrockModelId,
    messages: [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      temperature: 0.2,
      maxTokens: 1200,
    },
  });

  const response = await bedrock.send(command);
  const text = response?.output?.message?.content?.[0]?.text;
  if (!text) {
    throw new Error("Bedrock returned no content");
  }
  return text;
};

export const scoreResume = async ({ resumeText, jobDescription }) => {
  if (!resumeText || !jobDescription) {
    throw new Error("Missing resume or job description");
  }

  const prompt = buildPrompt({ resumeText, jobDescription });
  let raw;

  if (!bedrockRegion || !bedrockModelId) {
    const err = new Error("AI service not configured");
    err.statusCode = 503;
    throw err;
  }

  try {
    raw = await callBedrock(prompt);
  } catch (e) {
    const err = new Error(`Bedrock error: ${e.message || e}`);
    err.statusCode = 500;
    throw err;
  }

  return normalizeResponse(raw);
};
