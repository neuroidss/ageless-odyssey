import { ModelProvider, type ModelDefinition, type Achievement, Realm, Intervention, type HuggingFaceDevice } from './types';

export const HUGGING_FACE_DEVICES: {label: string, value: HuggingFaceDevice}[] = [
    { label: 'wasm', value: 'wasm' },
    { label: 'webgpu', value: 'webgpu' },
];
export const DEFAULT_HUGGING_FACE_DEVICE: HuggingFaceDevice = 'webgpu';

export const HUGGING_FACE_QUANTIZATIONS: {label: string, value: string}[] = [
    { label: 'auto', value: 'auto' },
    { label: 'fp32', value: 'fp32' },
    { label: 'fp16', value: 'fp16' },
    { label: 'q8', value: 'q8' },
    { label: 'int8', value: 'int8' },
    { label: 'uint8', value: 'uint8' },
    { label: 'q4', value: 'q4' },
    { label: 'bnb4', value: 'bnb4' },
    { label: 'q4f16', value: 'q4f16' },
];
export const DEFAULT_HUGGING_FACE_QUANTIZATION: string = 'auto';

export const EXAMPLE_TOPICS = [
    "Telomere shortening",
    "Mitochondrial dysfunction",
    "Cellular senescence",
    "Epigenetic alterations",
    "Genomic instability",
    "Deregulated nutrient-sensing"
];

// --- Autonomous Agent Constants ---
export const AUTONOMOUS_AGENT_QUERY = "radical life extension and rejuvenation biotechnology";
export const DEFAULT_AGENT_BUDGET = 10;


export const SUPPORTED_MODELS: ModelDefinition[] = [
    // Hugging Face Transformers.js (runs in-browser)
    { id: 'onnx-community/gemma-3-1b-it-ONNX', name: 'gemma-3-1b-it-ONNX (HF)', provider: ModelProvider.HuggingFace },
    { id: 'onnx-community/Qwen3-0.6B-ONNX', name: 'Qwen3-0.6B (HF)', provider: ModelProvider.HuggingFace },
    { id: 'onnx-community/gemma-3n-E2B-it-ONNX', name: 'Gemma 3N E2B (HF)', provider: ModelProvider.HuggingFace },
    { id: 'onnx-community/Qwen3-4B-ONNX', name: 'Qwen3-4B (HF)', provider: ModelProvider.HuggingFace },
    { id: 'onnx-community/Qwen3-1.7B-ONNX', name: 'Qwen3-1.7B (HF)', provider: ModelProvider.HuggingFace },

    // Local models via Ollama (recommended for hackathon)
    { id: 'gemma3n:e4b', name: 'Gemma 3N E4B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'gemma3n:e2b', name: 'Gemma 3N E2B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:14b', name: 'Qwen3 14B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:8b', name: 'Qwen3 8B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:4b', name: 'Qwen3 4B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:1.7b', name: 'Qwen3 1.7B (Ollama)', provider: ModelProvider.Ollama },
    { id: 'qwen3:0.6b', name: 'Qwen3 0.6B (Ollama)', provider: ModelProvider.Ollama },
    
    // Google AI Models (requires API_KEY)
        // Google AI Models (requires API_KEY)
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash 04-17 (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.5-flash-lite-preview-06-17', name: 'Gemini 2.5 Flash-Lite 06-17 (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemma-3n-e4b-it', name: 'Gemma 3N E4B (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemma-3n-e2b-it', name: 'Gemma 3N E2B (Google AI)', provider: ModelProvider.GoogleAI },
];


export const INTERVENTIONS: Intervention[] = [
    // Biological Interventions (For Biological Optimizer)
    { id: 'cr', name: 'Caloric Restriction', description: 'Reduces metabolic stress and nutrient-sensing pathways.', type: 'biological', effects: { mito_efficiency: 0.1, epigenetic_noise: 0.08, proteostasis: 0.05 } },
    { id: 'senolytics', name: 'Senolytics', description: 'Selectively clear senescent cells from tissues.', type: 'biological', effects: { senescent_cells: 0.3 } },
    { id: 'metformin', name: 'Metformin', description: 'Improves insulin sensitivity and mitochondrial function.', type: 'biological', effects: { mito_efficiency: 0.15, senescent_cells: 0.05 } },
    { id: 'nad_precursors', name: 'NAD+ Precursors', description: 'Boosts levels of NAD+, a key coenzyme for DNA repair and metabolism.', type: 'biological', effects: { telomere_length: 0.02, mito_efficiency: 0.1, proteostasis: 0.08 } },
    
    // Environmental / Substrate Interventions (For Substrate Enhanced)
    { id: 'gills_and_pressure_acclimation', name: 'Gills & Pressure Acclimation', description: 'Genetic modifications for underwater breathing and resisting deep-sea pressures.', type: 'environmental', effects: { mito_efficiency: 0.25, proteostasis: 0.2 } },
    { id: 'radiation_shield_weave', name: 'Radiation Shield Gene-Weave', description: 'Tardigrade-inspired DNA repair and protein shielding for surviving cosmic radiation.', type: 'environmental', effects: { telomere_length: 0.1, senescent_cells: 0.2, epigenetic_noise: 0.2 } },
    
    // Radical Interventions (For later Realms)
    { id: 'neuro_interface', name: 'Neural-Digital Interface', description: 'Augment the brain with a direct neural link, the first step towards an Exocortex.', type: 'radical', effects: { cognitive: 250 } },
    { id: 'mind_upload', name: 'Mind Substrate Transfer', description: 'Complete transfer of consciousness to a digital substrate. Bypasses all biological limitations.', type: 'radical', effects: { all_biomarkers: 1.0, cognitive: 500 } },
    { id: 'distributed_consciousness', name: 'Consciousness Distribution', description: 'Fractalize your digital mind across a decentralized network, making it resilient and near-omnipresent.', type: 'radical', effects: { cognitive: 1000 } },
];


// --- Ascension Framework Constants ---

export const VECTOR_POINTS = {
    MEMIC: {
        DISPATCH_AGENT: 5,
        SYNTHESIZE: 20,
        NEW_TOPIC: 2,
        BUILD_GRAPH_NODE: 1,
        DISCOVER_TREND: 15, // Base points for finding any trend
        TREND_VELOCITY_MULTIPLIER: 0.2, // 0.2 points per velocity point
        TREND_IMPACT_MULTIPLIER: 0.3, // 0.3 points per impact point
    },
    GENETIC: {
        // Points awarded per percentage point of biomarker improvement from an intervention
        BIOMARKER_IMPROVEMENT_MULTIPLIER: 5,
        RADICAL_INTERVENTION_BONUS: 400, // Large bonus for cybernetic replacement
    }
};

export const REALM_DEFINITIONS: { realm: Realm; description: string; thresholds: { cognitive: number; genetic: number; memic: number; } }[] = [
    { realm: Realm.StellarMetamorph, description: "Your form, a vessel of pure energy and data, is no longer limited by conventional physics, ready to traverse the void.", thresholds: { cognitive: 15000, genetic: 15000, memic: 20000 } },
    { realm: Realm.DistributedEntity, description: "Severing ties to a single instance. Your consciousness exists as a decentralized network across multiple nodes.", thresholds: { cognitive: 9500, genetic: 9000, memic: 10000 } },
    { realm: Realm.DigitalAscendant, description: "Achieving substrate independence. Your consciousness, now fully digitized, can inhabit simulated realities or portable hardware.", thresholds: { cognitive: 6000, genetic: 5000, memic: 5000 } },
    { realm: Realm.ExocortexIntegrator, description: "Offloading cognition to a secure, external processing core via a direct neural interface, forming a 'golden core' of knowledge.", thresholds: { cognitive: 3000, genetic: 2500, memic: 1500 } },
    { realm: Realm.SubstrateEnhanced, description: "Moving beyond baseline biology by integrating basic cybernetics, advanced gene-weaves, and redundant organs.", thresholds: { cognitive: 1500, genetic: 1000, memic: 500 } },
    { realm: Realm.BiologicalOptimizer, description: "Mastering the body's own systems to achieve peak human health and reverse the core hallmarks of aging.", thresholds: { cognitive: 500, genetic: 200, memic: 100 } },
    { realm: Realm.MortalShell, description: "The baseline human condition, a fragile vessel subject to the immutable decay of time.", thresholds: { cognitive: 0, genetic: 0, memic: 0 } },
].reverse(); // Reverse to have MortalShell at index 0 for easier progression logic


export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlocked'>> = {
  FIRST_RESEARCH: { id: 'FIRST_RESEARCH', name: 'Budding Scientist', description: 'Dispatch your first AI agent to begin your research.', xp: 50 },
  TREND_SPOTTER: { id: 'TREND_SPOTTER', name: 'Trend Spotter', description: 'Discover your first high-potential trend.', xp: 150 },
  EXPONENTIAL_THINKER: { id: 'EXPONENTIAL_THINKER', name: 'Exponential Thinker', description: 'Discover a trend with a velocity score of 80 or higher.', xp: 250 },
  KNOWLEDGE_ARCHITECT: { id: 'KNOWLEDGE_ARCHITECT', name: 'Knowledge Architect', description: 'Build a knowledge graph with 5 or more nodes.', xp: 100 },
  SYNTHESIZER: { id: 'SYNTHESIZER', name: 'The Synthesizer', description: 'Generate your first AI synthesis to connect the dots.', xp: 75 },
  BIO_STRATEGIST: { id: 'BIO_STRATEGIST', name: 'Bio-Strategist', description: 'Simulate your first intervention to see the future.', xp: 75 },
  TRANSHUMANIST: { id: 'TRANSHUMANIST', name: 'Transhumanist', description: 'Simulate a radical intervention, embracing a post-biological future.', xp: 250 },
  HALLMARK_EXPLORER: { id: 'HALLMARK_EXPLORER', name: 'Hallmark Explorer', description: 'Research 3 different hallmarks of aging.', xp: 100 },
  SCORE_MILESTONE_1: { id: 'SCORE_MILESTONE_1', name: 'Longevity Adept', description: 'Achieve a Longevity Score of 550 or more.', xp: 150 },
  REALM_ASCENSION: { id: 'REALM_ASCENSION', name: 'Ascendant', description: 'Reach the Realm of the Biological Optimizer.', xp: 200 },
};