import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const geminiPkg = require("@google/generative-ai/package.json");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: "v1"  // THIS IS KEY
});
const cricketKeywords = [
  "cricket","bat","ball","bowler","batsman",
  "ipl","test","odi","t20","wicket","run",
  "over","pitch","fielding","stadium","umpire",
  "captain","team","match","score","innings",
  "boundary","six","four","catch","lbw","stumping"
];

function isCricketQuery(text) {
  const lowerText = text.toLowerCase();
  return cricketKeywords.some(word => lowerText.includes(word));
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Message missing" });
  }

  if (!isCricketQuery(message)) {
    return res.json({ 
      reply: "I can only answer cricket-related questions. Please ask something about cricket." 
    });
  }

  try {
    // Use a valid model name - gemini-1.5-flash is recommended
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",  // Updated model name
    });

    // Better prompt for cricket context
    const cricketPrompt = `You are a cricket expert assistant for Mokama Cricket Academy. 
    Answer the following cricket-related question clearly and concisely.
    Question: ${message}
    
    Cricket-focused answer:`;

    const result = await model.generateContent(cricketPrompt);
    const response = await result.response;
    const reply = response.text() || "I cannot answer that at the moment.";
    
    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error details:", {
      name: err.name,
      message: err.message,
      code: err.code
    });
    
    // Log available models for debugging
    if (err.message.includes("models") && err.message.includes("not found")) {
      console.log("Note: Available models are: gemini-1.5-flash, gemini-1.5-pro, gemini-pro");
    }
    
    res.status(500).json({ 
      reply: "Cricket assistant is currently unavailable. Please try again later." 
    }); 
  }
});

// Test endpoint to verify API key and model
app.get("/test", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("What is cricket?");
    const response = await result.response;
    res.json({ 
      status: "API working", 
      model: "gemini-1.5-flash",
      testResponse: response.text().substring(0, 100) + "..."
    });
  } catch (error) {
    res.status(500).json({ 
      status: "API error", 
      error: error.message 
    });
  }
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
  console.log("Test endpoint: http://localhost:3000/test-api");
});