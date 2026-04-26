const { GoogleGenerativeAI } = require('@google/generative-ai');
const { similaritySearch } = require('./vectorStore');

/**
 * Creates a Google Generative AI instance
 * @returns {GoogleGenerativeAI} - Configured AI instance
 */
function createAI() {
  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
}

/**
 * Gets the generative model
 * @param {GoogleGenerativeAI} genAI - AI instance
 * @param {string} modelName - Model name to use
 * @returns {any} - Generative model
 */
function getModel(genAI, modelName = 'gemini-pro') {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generates a response from the AI based on context and question
 * @param {string} context - Context from relevant documents
 * @param {string} question - User's question
 * @returns {Promise<string>} - AI's response
 */
async function generateResponse(context, question) {
  const genAI = createAI();
  const model = getModel(genAI);

  const prompt = `
Based on the following context, please answer the question.

Context:
${context}

Question: ${question}

Answer:
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Answers a question using the vector store
 * @param {any} vectorStore - Vector store to search
 * @param {string} question - User's question
 * @returns {Promise<string>} - AI's response
 */
async function askQuestion(vectorStore, question) {
  // Search for relevant documents
  const relevantDocs = await similaritySearch(vectorStore, question, 4);
  const context = relevantDocs.join('\n\n');

  // Generate response
  return await generateResponse(context, question);
}

module.exports = {
  createAI,
  getModel,
  generateResponse,
  askQuestion
};