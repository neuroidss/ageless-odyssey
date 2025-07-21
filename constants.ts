

import { ModelProvider, type ModelDefinition, type Achievement, Realm, Intervention, type HuggingFaceDevice, type RealmDefinition, Quest, AgentType, MarketplaceIntervention, HypeCyclePhase } from './types';

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
    "Engineering SIRT1 regulatory circuits",
    "System-level mTOR pathway modulation",
    "Algorithmic clearance of senescent cells",
    "FOXO3 as a master system controller",
    "Reprogramming epigenetic landscapes",
    "Klotho protein as a high-leverage engineering target"
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
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash 04-17 (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.5-flash-lite-preview-06-17', name: 'Gemini 2.5 Flash-Lite 06-17 (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite (Google AI)', provider: ModelProvider.GoogleAI },
    { id: 'gemma-3n-e4b-it', name: 'Gemma 3N E4B (Google AI, Rate-Limited)', provider: ModelProvider.GoogleAI },
    { id: 'gemma-3n-e2b-it', name: 'Gemma 3N E2B (Google AI, Rate-Limited)', provider: ModelProvider.GoogleAI },
];


export const INTERVENTIONS: (Omit<Intervention, 'status'> & { sophistication: number })[] = [
    // Biological Interventions (For Biological Optimizer)
    { id: 'cr', name: 'Caloric Restriction', description: 'Modulates metabolic parameters to baseline specifications, reducing system noise.', type: 'biological', sophistication: 1, effects: { mito_efficiency: 0.1, epigenetic_noise: 0.08, proteostasis: 0.05 } },
    { id: 'senolytics', name: 'Senolytics', description: 'A targeted subroutine to purge malfunctioning, inflammatory cellular units.', type: 'biological', sophistication: 2, effects: { senescent_cells: 0.3 } },
    { id: 'metformin', name: 'Metformin', description: 'Recalibrates glucose metabolism and mitochondrial energy production pathways.', type: 'biological', sophistication: 1, effects: { mito_efficiency: 0.15, senescent_cells: 0.05 } },
    { id: 'nad_precursors', name: 'NAD+ Precursors', description: 'Increases the pool of a critical coenzyme for system repair and energy pathways.', type: 'biological', sophistication: 2, effects: { telomere_length: 0.02, mito_efficiency: 0.1, proteostasis: 0.08 } },
    { id: 'sleep_abolition', name: 'Sleep Abolition', description: 'A radical gene therapy that eliminates the biological need for sleep, reclaiming 8 hours per day. A one-time, irreversible procedure.', type: 'biological', sophistication: 8, effects: {} },
    
    // Environmental / Substrate Interventions (For Substrate Enhanced)
    { id: 'gills_and_pressure_acclimation', name: 'Gills & Pressure Acclimation', description: 'Genetic modifications for underwater breathing and resisting deep-sea pressures.', type: 'environmental', sophistication: 5, effects: { mito_efficiency: 0.25, proteostasis: 0.2 } },
    { id: 'radiation_shield_weave', name: 'Radiation Shield Gene-Weave', description: 'Tardigrade-inspired DNA repair and protein shielding for surviving cosmic radiation.', type: 'environmental', sophistication: 6, effects: { telomere_length: 0.1, senescent_cells: 0.2, epigenetic_noise: 0.2 } },
    
    // Radical Interventions (For later Realms)
    { id: 'neuro_interface', name: 'Neural-Digital Interface', description: 'Augment the brain with a direct neural link, the first step towards an Exocortex.', type: 'radical', sophistication: 10, effects: { cognitive: 5000 } },
    { id: 'mind_upload', name: 'Mind Substrate Transfer', description: 'Complete transfer of consciousness to a digital substrate. Bypasses all biological limitations.', type: 'radical', sophistication: 20, effects: { all_biomarkers: 1.0, cognitive: 15000 } },
    { id: 'distributed_consciousness', name: 'Consciousness Distribution', description: 'Fractalize your digital mind across a decentralized network, making it resilient and near-omnipresent.', type: 'radical', sophistication: 50, effects: { cognitive: 50000 } },
];

export const MARKETPLACE_INTERVENTIONS: MarketplaceIntervention[] = [];

export const QUESTS: Quest[] = [];

export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlocked'>> = {
    FIRST_RESEARCH: { id: 'FIRST_RESEARCH', name: 'First Steps', description: 'Complete your first research quest.', xp: 50 },
    NOVICE_RESEARCHER: { id: 'NOVICE_RESEARCHER', name: 'Novice Researcher', description: 'Complete the SIRT1 research quest.', xp: 100 },
    REALM_ASCENSION: { id: 'REALM_ASCENSION', name: 'New Horizons', description: 'Ascend to a new Realm of existence.', xp: 500 },
    THE_WAKING_DREAM: { id: 'THE_WAKING_DREAM', name: 'The Waking Dream', description: 'Abolish the biological need for sleep.', xp: 1000 },
    VAMPIRE_SCIENTIST: { id: 'VAMPIRE_SCIENTIST', name: 'Vampire Scientist', description: 'Unlock the secrets of young blood.', xp: 250 },
    INVESTOR: { id: 'INVESTOR', name: 'Angel Investor', description: 'Make your first R&D investment.', xp: 100 },
    SHOPPER: { id: 'SHOPPER', name: 'Bio-Hacker', description: 'Purchase your first upgrade from the marketplace.', xp: 100 },
};

export const REALM_DEFINITIONS: RealmDefinition[] = [
  {
    realm: Realm.MortalShell,
    description: "Your unmodified, baseline human form. Limited, fragile, but full of potential.",
    criteria: ["Begin the journey."],
    thresholds: { cognitive: 0, genetic: 0, memic: 0 }
  },
  {
    realm: Realm.BiologicalOptimizer,
    description: "You have begun to systematically upgrade your biology, moving beyond baseline human potential.",
    criteria: ["Achieve basic control over metabolic and cellular pathways.", "Demonstrate the ability to reverse some markers of aging."],
    thresholds: { cognitive: 1000, genetic: 500, memic: 2000 }
  },
  {
    realm: Realm.SubstrateEnhanced,
    description: "Your body is no longer purely biological. You've integrated synthetic components and rewritten core genetic code.",
    criteria: ["Replace a major biological system with a superior synthetic version.", "Achieve indefinite homeostasis for core biological functions."],
    thresholds: { cognitive: 10000, genetic: 5000, memic: 20000 }
  },
  {
    realm: Realm.ExocortexIntegrator,
    description: "Your mind now extends beyond your skull. A neural-digital interface provides instantaneous access to vast networks of information.",
    criteria: ["Offload 50% of declarative memory to an external substrate.", "Achieve a thought-to-data transfer rate exceeding 10 Gbps."],
    thresholds: { cognitive: 50000, genetic: 10000, memic: 100000 }
  },
  {
    realm: Realm.DigitalAscendant,
    description: "Your consciousness has been fully transferred to a digital substrate, free from the limitations of flesh.",
    criteria: ["Successfully transfer consciousness with 99.9999% fidelity.", "Run consciousness on a fault-tolerant, distributed computational grid."],
    thresholds: { cognitive: 250000, genetic: 15000, memic: 500000 }
  },
  {
    realm: Realm.DistributedEntity,
    description: "You are no longer a singular entity, but a distributed consciousness woven into the fabric of the digital world.",
    criteria: ["Exist simultaneously on multiple independent server clusters across the solar system.", "Achieve consensus reality with all instances of self."],
    thresholds: { cognitive: 1000000, genetic: 20000, memic: 2000000 }
  },
  {
    realm: Realm.StellarMetamorph,
    description: "You have shed the need for a planetary substrate, becoming a being of pure energy and information capable of traversing interstellar space.",
    criteria: ["Construct a Matrioshka brain around a star.", "Achieve self-sustaining existence independent of any single energy source."],
    thresholds: { cognitive: 10000000, genetic: 50000, memic: 25000000 }
  },
];