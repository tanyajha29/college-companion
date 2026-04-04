import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

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
    return Number.isFinite(num) ? num : 0;
  };

  return {
    score: Number.isFinite(Number(parsed.score))
      ? Math.max(0, Math.min(100, Number(parsed.score)))
      : 0,
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
You are an ATS-style resume evaluator.

Compare the resume against the job description and return ONLY valid JSON.
Do not include markdown, explanations, or any extra text.

Return exactly this shape:
{
  "score": 0,
  "summary": "short summary",
  "strengths": ["point 1", "point 2"],
  "gaps": ["gap 1", "gap 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "keywordMatch": 0,
  "atsReadiness": 0
}

Rules:
- score must be an integer from 0 to 100
- keywordMatch must be a number from 0 to 100
- atsReadiness must be a number from 0 to 100
- strengths, gaps, suggestions must be arrays of short strings

Resume:
${resumeText}

Job Description:
${jobDescription}
`.trim();

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
});

const callBedrock = async (prompt) => {
  const command = new ConverseCommand({
    modelId: "us.amazon.nova-lite-v1:0",
    messages: [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      temperature: 0.3,
      maxTokens: 700,
    },
  });

  const response = await bedrockClient.send(command);
  const rawText = response?.output?.message?.content?.[0]?.text || "";
  console.log("Bedrock raw response:", rawText);

  if (!rawText) {
    throw new Error("Bedrock returned no content");
  }

  return rawText;
};

export const scoreResume = async ({ resumeText, jobDescription }) => {
  if (!resumeText || !jobDescription) {
    throw new Error("Missing resume or job description");
  }

  const prompt = buildPrompt({ resumeText, jobDescription });

  try {
    const raw = await callBedrock(prompt);
    return normalizeResponse(raw);
  } catch (e) {
    console.error("Bedrock error:", e);

    return {
      score: 0,
      summary: "AI service failed.",
      strengths: [],
      gaps: [],
      suggestions: ["Please try again later."],
      keywordMatch: 0,
      atsReadiness: 0,
      raw: String(e),
    };
  }
};
