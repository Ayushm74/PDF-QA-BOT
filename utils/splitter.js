import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
export async function splitText(text) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
  });

  return await splitter.createDocuments([text]);
}
