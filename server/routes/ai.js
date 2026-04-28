import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

const buildFallbackReply = (prompt = '') => {
  const text = prompt.toLowerCase();

  if (text.includes('zk') || text.includes('zero-knowledge') || text.includes('proof')) {
    return 'ZK proofs hide sensitive details while still proving the data is valid. In KrishiChain, that means auditors can verify your harvest without exposing private farmer information.';
  }

  if (text.includes('msp') || text.includes('minimum support price')) {
    return 'MSP is the minimum price promised by the government for some crops. It helps protect farmers from selling below a fair floor price.';
  }

  if (text.includes('disease') || text.includes('pest') || text.includes('leaf')) {
    return 'Check for spots, curling, yellowing, or holes. If you share the crop name and symptom, I can suggest likely causes and safe next steps.';
  }

  if (text.includes('price') || text.includes('market')) {
    return 'Market price depends on crop type, quality, moisture, location, and current demand. For a good estimate, share the crop and its grade.';
  }

  return 'I can help with crop prices, MSP, disease signs, and ZK privacy. Ask me a short question and I will guide you.';
};

router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!apiKey) {
      return res.status(503).json({ error: 'Krishi-Mitra is not configured yet. Set GEMINI_API_KEY on the server.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction:
        "You are 'Krishi-Mitra', an AI assistant for the AgriChain ZK app. Help Indian farmers with crop queries, explain Minimum Support Price (MSP), and explain how zero-knowledge proofs protect their data from corrupt middlemen. Keep answers short, friendly, and simple.",
    });

    const result = await model.generateContent(prompt.trim());
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error) {
    console.error('AI Error:', error);
    if (error?.status === 400 && String(error?.message || '').includes('API key not valid')) {
      return res.json({
        text: buildFallbackReply(req.body?.prompt),
        mode: 'demo',
      });
    }

    res.status(500).json({ text: buildFallbackReply(req.body?.prompt), mode: 'demo' });
  }
});

export default router;