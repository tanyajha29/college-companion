import express from "express";
import OpenAI from "openai";
import multer from "multer";
import pdfParse from "pdf-parse";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../../shared/middleware/auth.js";
import { env } from "../../config/env.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: env.openai.apiKey });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const faqPath = path.join(__dirname, "faq.json");
const faqItems = JSON.parse(fs.readFileSync(faqPath, "utf-8"));

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const callOllama = async (prompt) => {
  const response = await fetch(`${env.ollama.url}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.ollama.model,
      prompt,
      stream: false,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error: ${err}`);
  }
  const data = await response.json();
  return data.response || "";
};

const useOllama = () => env.ollama?.url;

const runResumeScore = async ({ resumeText, jobDescription }) => {
  const prompt = `
You are an ATS evaluator. Compare the resume to the job description.
Return JSON only with keys: score (0-100), strengths (array of strings), gaps (array of strings), summary (string).
Resume: ${resumeText}
Job Description: ${jobDescription}
  `.trim();

  let outputText = "";
  if (useOllama()) {
    outputText = await callOllama(prompt);
  } else {
    if (!env.openai.apiKey) {
      throw new Error("OpenAI API key not configured");
    }
    const response = await openai.responses.create({
      model: env.openai.model,
      input: prompt,
      temperature: 0.2,
    });
    outputText = response.output_text || "";
  }

  return safeJsonParse(outputText) || { score: 0, strengths: [], gaps: [], summary: outputText };
};

router.post("/resume-score", authMiddleware, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: "resumeText and jobDescription are required" });
    }

    const parsed = await runResumeScore({ resumeText, jobDescription });

    await logAudit({
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      action: "resume_scored",
      entityType: "resume",
      metadata: { score: parsed.score },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json(parsed);
  } catch (err) {
    console.error("Resume score error:", err);
    res.status(500).json({ message: "Failed to score resume" });
  }
});

router.post("/resume-score-pdf", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!req.file || !jobDescription) {
      return res.status(400).json({ message: "resume (PDF) and jobDescription are required" });
    }
    const pdf = await pdfParse(req.file.buffer);
    const resumeText = pdf.text || "";
    const parsed = await runResumeScore({ resumeText, jobDescription });

    await logAudit({
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      action: "resume_scored_pdf",
      entityType: "resume",
      metadata: { score: parsed.score },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.json(parsed);
  } catch (err) {
    console.error("Resume PDF score error:", err);
    res.status(500).json({ message: "Failed to score resume PDF" });
  }
});

router.post("/faq", authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "question is required" });

    const normalized = question.toLowerCase();
    const match = faqItems.find((item) => normalized.includes(item.question.toLowerCase().slice(0, 12)));
    if (match) return res.json({ answer: match.answer, source: "faq" });

    const prompt = `
You are a college assistant. Answer the question using the FAQ items when possible.
FAQ: ${JSON.stringify(faqItems)}
Question: ${question}
Return a short helpful answer.
    `.trim();

    let answer = "Sorry, I couldn't find that.";
    if (useOllama()) {
      answer = await callOllama(prompt);
    } else {
      if (!env.openai.apiKey) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }
      const response = await openai.responses.create({
        model: env.openai.model,
        input: prompt,
        temperature: 0.3,
      });
      answer = response.output_text || answer;
    }
    res.json({ answer, source: "ai" });
  } catch (err) {
    console.error("FAQ error:", err);
    res.status(500).json({ message: "Failed to answer question" });
  }
});

router.post("/sentiment", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });

    const prompt = `
Analyze the sentiment of the following text.
Return JSON only with keys: mood (positive|neutral|negative), score (0-100), summary (string).
Text: ${text}
    `.trim();

    let outputText = "";
    if (useOllama()) {
      outputText = await callOllama(prompt);
    } else {
      if (!env.openai.apiKey) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }
      const response = await openai.responses.create({
        model: env.openai.model,
        input: prompt,
        temperature: 0.2,
      });
      outputText = response.output_text || "";
    }
    const parsed = safeJsonParse(outputText) || { mood: "neutral", score: 50, summary: outputText };

    await logAudit({
      actorUserId: req.user.userId,
      actorRole: req.user.role,
      action: "sentiment_analyzed",
      entityType: "feedback",
      metadata: { mood: parsed.mood, score: parsed.score },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json(parsed);
  } catch (err) {
    console.error("Sentiment error:", err);
    res.status(500).json({ message: "Failed to analyze sentiment" });
  }
});

export default router;
