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


export const INTERVENTIONS: (Intervention & { sophistication: number })[] = [
    // Biological Interventions (For Biological Optimizer)
    { id: 'cr', name: 'Caloric Restriction', description: 'Reduces metabolic stress and nutrient-sensing pathways.', type: 'biological', sophistication: 1, effects: { mito_efficiency: 0.1, epigenetic_noise: 0.08, proteostasis: 0.05 } },
    { id: 'senolytics', name: 'Senolytics', description: 'Selectively clear senescent cells from tissues.', type: 'biological', sophistication: 2, effects: { senescent_cells: 0.3 } },
    { id: 'metformin', name: 'Metformin', description: 'Improves insulin sensitivity and mitochondrial function.', type: 'biological', sophistication: 1, effects: { mito_efficiency: 0.15, senescent_cells: 0.05 } },
    { id: 'nad_precursors', name: 'NAD+ Precursors', description: 'Boosts levels of NAD+, a key coenzyme for DNA repair and metabolism.', type: 'biological', sophistication: 2, effects: { telomere_length: 0.02, mito_efficiency: 0.1, proteostasis: 0.08 } },
    
    // Environmental / Substrate Interventions (For Substrate Enhanced)
    { id: 'gills_and_pressure_acclimation', name: 'Gills & Pressure Acclimation', description: 'Genetic modifications for underwater breathing and resisting deep-sea pressures.', type: 'environmental', sophistication: 5, effects: { mito_efficiency: 0.25, proteostasis: 0.2 } },
    { id: 'radiation_shield_weave', name: 'Radiation Shield Gene-Weave', description: 'Tardigrade-inspired DNA repair and protein shielding for surviving cosmic radiation.', type: 'environmental', sophistication: 6, effects: { telomere_length: 0.1, senescent_cells: 0.2, epigenetic_noise: 0.2 } },
    
    // Radical Interventions (For later Realms)
    { id: 'neuro_interface', name: 'Neural-Digital Interface', description: 'Augment the brain with a direct neural link, the first step towards an Exocortex.', type: 'radical', sophistication: 10, effects: { cognitive: 5000 } },
    { id: 'mind_upload', name: 'Mind Substrate Transfer', description: 'Complete transfer of consciousness to a digital substrate. Bypasses all biological limitations.', type: 'radical', sophistication: 20, effects: { all_biomarkers: 1.0, cognitive: 15000 } },
    { id: 'distributed_consciousness', name: 'Consciousness Distribution', description: 'Fractalize your digital mind across a decentralized network, making it resilient and near-omnipresent.', type: 'radical', sophistication: 50, effects: { cognitive: 50000 } },
];


// --- Ascension Framework Constants ---

export const VECTOR_POINTS = {
    MEMIC: {
        DISPATCH_AGENT: 2,
        // Points per item synthesized
        SYNTHESIZE_PER_ITEM: 5, 
        // Points per node and edge in graph
        KNOWLEDGE_GRAPH_NODE: 1,
        KNOWLEDGE_GRAPH_EDGE: 2,
        // Points for discovering a trend, plus multipliers
        DISCOVER_TREND_BASE: 25,
        TREND_SCORE_MULTIPLIER: 0.5, // multiplier for the sum of novelty, velocity, impact
    },
    GENETIC: {
        // Points awarded based on the sophistication of an intervention
        INTERVENTION_BASE: 10,
    }
};

export const REALM_DEFINITIONS: { realm: Realm; description: string; criteria: string[]; thresholds: { cognitive: number; genetic: number; memic: number; } }[] = [
    { 
        realm: Realm.MortalShell, 
        description: "The baseline human condition. Information processing is limited by biological hardware and its inherent decay.",
        criteria: [
            "Biological processes follow standard Gompertz-Makeham law of mortality.",
            "Information processing (cognition) is confined to endogenous neural structures.",
            "Knowledge acquisition is dependent on external, non-integrated tools."
        ],
        thresholds: { cognitive: 0, genetic: 0, memic: 0 }
    },
    { 
        realm: Realm.BiologicalOptimizer, 
        description: "Mastering the body's own systems. Demonstrating predictable control over the core catalysts of aging.",
        criteria: [
            "Demonstrate predictable, quantitative control over at least 3 hallmarks of aging using targeted interventions.",
            "Achieve a negative delta between biological age (via epigenetic clocks) and chronological age for 12 consecutive months.",
            "Successfully reverse a major age-related biomarker (e.g., senescent cell load) to levels typical of a younger phenotype."
        ],
        thresholds: { cognitive: 1000, genetic: 500, memic: 500 }
    },
    { 
        realm: Realm.SubstrateEnhanced, 
        description: "Moving beyond baseline biology. Integrating non-biological substrates to augment or offload core functions.",
        criteria: [
            "Successfully integrate a non-biological substrate that measurably offloads a cognitive or metabolic function (e.g., an artificial endocrine controller).",
            "Maintain homeostatic stability after simulated failure of a primary redundant biological organ.",
            "Demonstrate a greater than 2-sigma resilience to an environmental stressor (e.g., radiation, hypoxia) compared to the non-augmented baseline."
        ],
        thresholds: { cognitive: 5000, genetic: 2500, memic: 2000 }
    },
    { 
        realm: Realm.ExocortexIntegrator, 
        description: "Expanding working memory. Offloading high-level cognition to a secure, external processing core.",
        criteria: [
            "Achieve stable, bidirectional neural interface bandwidth exceeding 1 Tbit/s.",
            "Demonstrate the ability to solve a class of problems previously intractable to the un-augmented mind (e.g., visualizing 5-dimensional geometric spaces).",
            "Offload >50% of symbolic reasoning tasks to the exocortex, verified by fMRI/MEG analysis showing reduced activity in corresponding biological brain regions."
        ],
        thresholds: { cognitive: 25000, genetic: 5000, memic: 10000 }
    },
    { 
        realm: Realm.DigitalAscendant, 
        description: "Achieving substrate independence. The mind, now fully digitized, can explore realities unbound by physics.",
        criteria: [
            "Replicate the full connectome and synaptic weight matrix to a computational substrate with >99.999% fidelity.",
            "The digital substrate must independently generate a novel, falsifiable scientific theory that is later validated.",
            "Demonstrate the ability to operate at a subjective speed of >1000x relative to biological time."
        ],
        thresholds: { cognitive: 100000, genetic: 10000, memic: 50000 }
    },
    { 
        realm: Realm.DistributedEntity, 
        description: "No longer a single instance. Consciousness exists as a unified, decentralized network across multiple substrates.",
        criteria: [
            "Maintain a single, coherent identity after the unscheduled termination and reintegration of >25% of computational nodes.",
            "Achieve consensus on a novel mathematical proof by processing simultaneous, conflicting inputs from multiple, physically separate instances.",
            "Demonstrate non-local awareness by accurately modeling a remote system using only fragmentary data from multiple nodes."
        ],
        thresholds: { cognitive: 500000, genetic: 20000, memic: 250000 }
    },
    { 
        realm: Realm.StellarMetamorph, 
        description: "A vessel of pure energy and data. Manipulating the fabric of the cosmos as a final-cause catalyst.",
        criteria: [
            "Demonstrate controlled, direct energy-to-mass-to-energy conversion with >99% efficiency.",
            "Establish a stable communication network utilizing quantum entanglement over a 1 light-year distance.",
            "Create a self-sustaining pocket universe with novel physical laws."
        ],
        thresholds: { cognitive: 2000000, genetic: 50000, memic: 1000000 } 
    },
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
