
import { ModelProvider, type ModelDefinition, type Achievement } from './types';

export const EXAMPLE_TOPICS = [
    "Telomere shortening",
    "Mitochondrial dysfunction",
    "Cellular senescence",
    "Epigenetic alterations",
    "Genomic instability",
    "Deregulated nutrient-sensing"
];

export const SUPPORTED_MODELS: ModelDefinition[] = [
    // Local models via Ollama (recommended for hackathon)
    { id: 'gemma3n:e4b', name: 'Gemma 3N E4B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'gemma3n:e2b', name: 'Gemma 3N E2B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:14b', name: 'Qwen3 14B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:8b', name: 'Qwen3 8B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:4b', name: 'Qwen3 4B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:1.7b', name: 'Qwen3 1.7B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:0.6b', name: 'Qwen3 0.6B (Ollama)', provider: ModelProvider.Ollama },
    
    // Google AI Models (requires API_KEY)
    { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash 04-17 (Google AI)', provider: ModelProvider.GoogleAI },
    // Note: The following models also use the Google AI provider and require a key.
    { id: 'gemma-3n-e4b-it', name: 'Gemma 3N E4B (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemma-3n-e2b-it', name: 'Gemma 3N E2B (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.5-flash-lite-preview-06-17', name: 'Gemini 2.5 Flash-Lite 06-17 (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Google AI)', provider: ModelProvider.GoogleAI },
];

// --- Gamification Constants ---

export const XP_FOR_LEVEL = (level: number): number => Math.floor(100 * Math.pow(level, 1.5));

export const XP_VALUES = {
    DISPATCH_AGENT: 10,
    SYNTHESIZE: 25,
    APPLY_INTERVENTION: 15,
    NEW_TOPIC: 5,
};

export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlocked'>> = {
  FIRST_RESEARCH: { id: 'FIRST_RESEARCH', name: 'Budding Scientist', description: 'Dispatch your first AI agent to begin your research.', xp: 50 },
  KNOWLEDGE_ARCHITECT: { id: 'KNOWLEDGE_ARCHITECT', name: 'Knowledge Architect', description: 'Build a knowledge graph with 5 or more nodes.', xp: 100 },
  SYNTHESIZER: { id: 'SYNTHESIZER', name: 'The Synthesizer', description: 'Generate your first AI synthesis to connect the dots.', xp: 75 },
  BIO_STRATEGIST: { id: 'BIO_STRATEGIST', name: 'Bio-Strategist', description: 'Simulate your first intervention to see the future.', xp: 75 },
  HALLMARK_EXPLORER: { id: 'HALLMARK_EXPLORER', name: 'Hallmark Explorer', description: 'Research 3 different hallmarks of aging.', xp: 100 },
  SCORE_MILESTONE_1: { id: 'SCORE_MILESTONE_1', name: 'Longevity Adept', description: 'Achieve a Longevity Score of 550 or more.', xp: 150 },
};
