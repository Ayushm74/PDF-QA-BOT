const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Loads and extracts text from a PDF file
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text from the PDF
 */
async function loadPdf(pdfPath) {
  try {
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    // Read the PDF file
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // Parse the PDF
    const data = await pdf(dataBuffer);
    
    return data.text;
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw new Error(`Failed to load PDF: ${error.message}`);
  }
}

/**
 * Loads multiple PDFs and combines their text
 * @param {string[]} pdfPaths - Array of paths to PDF files
 * @returns {Promise<string>} - Combined text from all PDFs
 */
async function loadMultiplePdfs(pdfPaths) {
  const texts = await Promise.all(
    pdfPaths.map(pdfPath => loadPdf(pdfPath))
  );
  return texts.join('\n\n');
}

module.exports = {
  loadPdf,
  loadMultiplePdfs
};