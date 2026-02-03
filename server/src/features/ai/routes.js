import express from "express";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../../shared/middleware/auth.js";
import { env } from "../../config/env.js";
import { logAudit } from "../audit/auditService.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: env.openai.apiKey });

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

router.post("/resume-score", authMiddleware, async (req, res) => {
  try {
    if (!env.openai.apiKey) {
      return res.status(500).json({ message: "OpenAI API key not configured" });
    }
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: "resumeText and jobDescription are required" });
    }

    const prompt = `
You are an ATS evaluator. Compare the resume to the job description.
Return JSON only with keys: score (0-100), strengths (array of strings), gaps (array of strings), summary (string).
Resume: ${resumeText}
Job Description: ${jobDescription}
    `.trim();

    const response = await openai.responses.create({
      model: env.openai.model,
      input: prompt,
      temperature: 0.2,
    });

    const outputText = response.output_text || "";
    const parsed = safeJsonParse(outputText) || { score: 0, strengths: [], gaps: [], summary: outputText };

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

router.post("/faq", authMiddleware, async (req, res) => {
  try {
    if (!env.openai.apiKey) {
      return res.status(500).json({ message: "OpenAI API key not configured" });
    }
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

    const response = await openai.responses.create({
      model: env.openai.model,
      input: prompt,
      temperature: 0.3,
    });

    const answer = response.output_text || "Sorry, I couldn't find that.";
    res.json({ answer, source: "ai" });
  } catch (err) {
    console.error("FAQ error:", err);
    res.status(500).json({ message: "Failed to answer question" });
  }
});

router.post("/sentiment", authMiddleware, async (req, res) => {
  try {
    if (!env.openai.apiKey) {
      return res.status(500).json({ message: "OpenAI API key not configured" });
    }
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });

    const prompt = `
Analyze the sentiment of the following text.
Return JSON only with keys: mood (positive|neutral|negative), score (0-100), summary (string).
Text: ${text}
    `.trim();

    const response = await openai.responses.create({
      model: env.openai.model,
      input: prompt,
      temperature: 0.2,
    });

    const outputText = response.output_text || "";
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
