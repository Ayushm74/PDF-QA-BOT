// ===============================
// 🔥 GLOBAL ERROR HANDLERS (TOP)

// ===============================
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("ENV KEY:", process.env.GOOGLE_API_KEY);
console.log("KEY LENGTH:", process.env.GOOGLE_API_KEY?.length);

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION:", err);
});


// ===============================
// ⚙️ ENV SETUP
// ===============================


// ===============================
// 📦 IMPORTS
// ===============================
import express from "express";
import multer from "multer";
import fs from "fs/promises";

import { loadPDF } from "./utils/pdfLoader.js";
import { splitText } from "./utils/splitter.js";
import { createVectorStore } from "./utils/vectorStore.js";
import { askQuestion } from "./utils/ask.js";


// ===============================
// 🚀 APP INIT
// ===============================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ===============================
// 📁 MULTER CONFIG (clean)
// ===============================
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});


// ===============================
// 🌍 GLOBAL STATE (simple)
// ===============================
let retriever = null;


// ===============================
// 📌 HEALTH CHECK (IMPORTANT)
// ===============================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "PDF QA API is running 🚀",
  });
});


// ===============================
// 📤 UPLOAD ROUTE
// ===============================
app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;

  try {
    console.log("📥 Upload request received");

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    console.log("📄 File:", filePath);

    // 1️⃣ Load PDF
    const text = await loadPDF(filePath);
    console.log("✅ PDF loaded");

   const docs = await splitText(text);
console.log(`✅ Split into ${docs.length} chunks`);

// 🔥 LIMIT DOCS HERE (VERY IMPORTANT)
const limitedDocs = docs.slice(0, 2);

console.log(`⚡ Using only ${limitedDocs.length} chunks for embeddings`);

const store = await createVectorStore(limitedDocs);

    // 4️⃣ Save retriever
    retriever = store.asRetriever();

    res.json({
      success: true,
      message: "PDF processed successfully ✅",
      chunks: docs.length,
    });

  } catch (err) {
    console.error("🔥 ERROR IN /upload:", err);

    res.status(500).json({
      success: false,
      error: "Failed to process PDF",
    });

  } finally {
    // 🧹 CLEANUP FILE (VERY IMPORTANT)
    if (filePath) {
      try {
        await fs.unlink(filePath);
        console.log("🗑️ File deleted");
      } catch (e) {
        console.warn("⚠️ File cleanup failed:", e.message);
      }
    }
  }
});


// ===============================
// ❓ ASK ROUTE
// ===============================
// ===============================
// ❓ ASK ROUTE
// ===============================
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    // ❗ Validate
    if (!retriever) {
      return res.status(400).json({
        success: false,
        error: "Upload a PDF first",
      });
    }

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    console.log("❓ Question:", question);

    // 🔥 Generate answer - PASS THE API KEY HERE
    const answer = await askQuestion(question, retriever, process.env.GOOGLE_API_KEY);

    res.json({
      success: true,
      answer,
    });

  } catch (err) {
    console.error("🔥 ERROR IN /ask:", err);

    res.status(500).json({
      success: false,
      error: "Failed to generate answer",
    });
  }
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});