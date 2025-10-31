import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // ensure .env is loaded here too (especially if imported early)

const router = express.Router();

// ✅ Correct way to initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("Chatbot Error:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

export default router;
