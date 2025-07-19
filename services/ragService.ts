import { generateEmbeddings } from './huggingFaceService';
import { type Quest, type WorkspaceItem, type RAGIndexEntry, type RAGContext } from '../types';

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    if (vecA.length !== vecB.length || vecA.length === 0) {
        return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) {
        return 0;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const formatItemForRAG = (item: WorkspaceItem | Quest): string => {
    if ('objective' in item) { // It's a Quest
        return `Completed Quest: "${item.title}". Description: ${item.description}. Objective: Research ${item.objective.topicKeywords.join(', ')}.`;
    }
    // It's a WorkspaceItem
    return `Previously Found Item (Type: ${item.type}): "${item.title}". Summary: ${item.summary}. Details: ${item.details}.`;
};

export const buildRAGIndex = async (
    history: WorkspaceItem[],
    completedQuests: Quest[],
    addLog: (msg: string) => void
): Promise<RAGIndexEntry[]> => {
    const itemsToIndex = [...history, ...completedQuests];
    if (itemsToIndex.length === 0) {
        addLog('[RAG] No items to index for RAG.');
        return [];
    }

    addLog(`[RAG] Building index for ${itemsToIndex.length} items...`);
    const texts = itemsToIndex.map(formatItemForRAG);
    
    try {
        const embeddings = await generateEmbeddings('Xenova/all-MiniLM-L6-v2', texts, addLog);
        const index: RAGIndexEntry[] = itemsToIndex.map((item, i) => ({
            id: item.id,
            text: texts[i],
            embedding: embeddings[i],
        }));
        addLog(`[RAG] Index built successfully with ${index.length} entries.`);
        return index;
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        addLog(`[RAG] ERROR building index: ${message}`);
        return []; // Return empty index on error
    }
};

export const queryRAGIndex = async (
    query: string,
    index: RAGIndexEntry[],
    addLog: (msg: string) => void,
    topK: number = 3
): Promise<RAGContext | null> => {
    if (index.length === 0) {
        addLog('[RAG] Index is empty, skipping query.');
        return null;
    }
    addLog(`[RAG] Querying index with: "${query}"`);

    try {
        const queryEmbeddingResult = await generateEmbeddings('Xenova/all-MiniLM-L6-v2', [query], addLog);
        const queryEmbedding = queryEmbeddingResult[0];

        const scoredItems = index.map(item => ({
            ...item,
            similarity: cosineSimilarity(queryEmbedding, item.embedding),
        }));

        scoredItems.sort((a, b) => b.similarity - a.similarity);

        const topResults = scoredItems.slice(0, topK).filter(item => item.similarity > 0.5); // Add a relevance threshold

        if (topResults.length === 0) {
            addLog('[RAG] No relevant context found in RAG index.');
            return null;
        }

        const context = `Relevant historical context from past work:\n` + topResults.map(item => `- ${item.text}`).join('\n');
        const sources = topResults.map(item => item.id);
        
        addLog(`[RAG] Found ${topResults.length} relevant context items.`);
        return { context, sources };
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        addLog(`[RAG] ERROR querying index: ${message}`);
        return null;
    }
};
