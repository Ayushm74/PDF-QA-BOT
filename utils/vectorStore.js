import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

export async function createVectorStore(docs) {
  try {
    console.log("Using local embeddings...");

    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2",
    });

    const store = await FaissStore.fromDocuments(docs, embeddings);

    console.log("Embeddings done ✅");

    return store;
  } catch (err) {
    console.error("VECTOR ERROR:", err);
    throw err;
  }
}