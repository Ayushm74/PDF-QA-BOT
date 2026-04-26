const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');

/**
 * Creates a text splitter with default settings
 * @returns {RecursiveCharacterTextSplitter} - Configured text splitter
 */
function createTextSplitter() {
  return new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    lengthFunction: (text) => text.length,
  });
}

/**
 * Splits text into chunks
 * @param {string} text - Text to split
 * @returns {Promise<string[]>} - Array of text chunks
 */
async function splitText(text) {
  const splitter = createTextSplitter();
  const chunks = await splitter.splitText(text);
  return chunks;
}

/**
 * Splits multiple texts into chunks
 * @param {string[]} texts - Array of texts to split
 * @returns {Promise<string[]>} - Array of all text chunks
 */
async function splitTexts(texts) {
  const splitter = createTextSplitter();
  const chunks = await splitter.createDocuments(texts);
  return chunks.map(doc => doc.pageContent);
}

module.exports = {
  createTextSplitter,
  splitText,
  splitTexts
};