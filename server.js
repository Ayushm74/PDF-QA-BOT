import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";

import { loadPDF } from "./utils/pdfLoader.js";
import { splitText } from "./utils/splitter.js";
import { createVectorStore } from "./utils/vectorStore.js";
import { askQuestion } from "./utils/ask.js";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

let retriever; // global

// Upload PDF
app.post("/upload", upload.single("file"), async (req, res) => {
  const text = await loadPDF(req.file.path);
  const docs = await splitText(text);
  const store = await createVectorStore(docs);

  retriever = store.asRetriever();

  res.send("PDF processed");
});

// Ask question
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  const answer = await askQuestion(question, retriever);

  res.json({ answer });
});

app.listen(3000, () => console.log("Server running"));