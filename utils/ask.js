import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function askQuestion(query, retriever) {
  const docs = await retriever.getRelevantDocuments(query);

  const context = docs.map(d => d.pageContent).join("\n");

  const prompt = `
Answer ONLY using this context:

${context}

Question: ${query}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}