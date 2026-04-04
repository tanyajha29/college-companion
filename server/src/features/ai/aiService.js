import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

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

const bedrockClient = new BedrockRuntimeClient({ region: "ap-south-1" });

const callBedrock = async (prompt) => {
  const command = new InvokeModelCommand({
    modelId: "amazon.titan-text-lite-v1",
    body: JSON.stringify({
      inputText: prompt,
      textGenerationConfig: {
        maxTokenCount: 500,
        temperature: 0.3,
      },
    }),
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await bedrockClient.send(command);
  const rawText = new TextDecoder("utf-8").decode(response.body);
  console.log("Bedrock raw response:", rawText);

  const parsedBody = safeJsonParse(rawText) || {};
  const outputText =
    parsedBody.outputText ||
    parsedBody.results?.[0]?.outputText ||
    parsedBody.completions?.[0]?.data?.text ||
    "";
  if (!outputText) {
    throw new Error("Bedrock returned no content");
  }
  return outputText;
};

export const scoreResume = async ({ resumeText, jobDescription }) => {
  if (!resumeText || !jobDescription) {
    throw new Error("Missing resume or job description");
  }

  const prompt = buildPrompt({ resumeText, jobDescription });
  let raw;

  try {
    raw = await callBedrock(prompt);
  } catch (e) {
    console.error("Bedrock error:", e);
    return { message: "AI service failed" };
  }

  return normalizeResponse(raw);
};
