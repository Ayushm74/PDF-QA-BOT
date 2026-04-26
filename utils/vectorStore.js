const { FaissStore } = require('langchain/vectorstores/faiss');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const path = require('path');
const fs = require('fs');

/**
 * Creates embeddings using Google Generative AI
 * @returns {GoogleGenerativeAIEmbeddings} - Configured embeddings
 */
function createEmbeddings() {
  return new GoogleGenerativeAIEmbeddings({
    model: 'embedding-001',
    apiKey: process.env.GOOGLE_API_KEY,
  });
}

/**
 * Creates a vector store from documents
 * @param {string[]} documents - Array of text chunks
 * @param {GoogleGenerativeAIEmbeddings} embeddings - Embeddings instance
 * @returns {Promise<FaissStore>} - Vector store
 */
async function createVectorStore(documents, embeddings) {
  const vectorStore = await FaissStore.fromDocuments(
    documents.map(doc => ({ pageContent: doc })),
    embeddings
  );
  return vectorStore;
}

/**
 * Saves vector store to disk
 * @param {FaissStore} vectorStore - Vector store to save
 * @param {string} savePath - Path to save the vector store
 */
async function saveVectorStore(vectorStore, savePath) {
  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await vectorStore.save(savePath);
}

/**
 * Loads vector store from disk
 * @param {string} loadPath - Path to load the vector store from
 * @param {GoogleGenerativeAIEmbeddings} embeddings - Embeddings instance
 * @returns {Promise<FaissStore>} - Loaded vector store
 */
async function loadVectorStore(loadPath, embeddings) {
  return await FaissStore.load(loadPath, embeddings);
}

/**
 * Performs similarity search on the vector store
 * @param {FaissStore} vectorStore - Vector store to search
 * @param {string} query - Query string
 * @param {number} k - Number of results to return
 * @returns {Promise<string[]>} - Array of relevant documents
 */
async function similaritySearch(vectorStore, query, k = 4) {
  const results = await vectorStore.similaritySearch(query, k);
  return results.map(doc => doc.pageContent);
}

module.exports = {
  createEmbeddings,
  createVectorStore,
  saveVectorStore,
  loadVectorStore,
  similaritySearch
};