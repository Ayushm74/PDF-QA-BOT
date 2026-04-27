import { GoogleGenerativeAI } from "@google/generative-ai";

export async function askQuestion(query, retriever, apiKey) {
  try {
    console.log("🔍 Query:", query);
    console.log("ASK.JS KEY:", apiKey ? "Present ✅" : "undefined ❌");

    if (!apiKey) {
      throw new Error("API key is missing!");
    }

    // Initialize here with the passed key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🔥 FIX: Use correct model name
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",  // Changed from "gemini-1.5-flash"
    });

    // 1️⃣ Get docs
    const docs = await retriever.getRelevantDocuments(query);

    console.log("📄 Docs found:", docs?.length);

    if (!docs || docs.length === 0) {
      throw new Error("No relevant context found from PDF");
    }

    // 2️⃣ Build context
    const context = docs
      .map((d) => d.pageContent)
      .join("\n")
      .slice(0, 4000);

    // 3️⃣ Prompt
    const prompt = `
Answer ONLY using the context below.
If answer not found, say "Not in document".

Context:
${context}

Question: ${query}
`;

    // 4️⃣ Call Gemini
    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      throw new Error("Empty response from Gemini");
    }

    const text = result.response.text();

    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    return text;

  } catch (err) {
    console.error("🔥 ASK ERROR:", err);
    throw err;
  }
}