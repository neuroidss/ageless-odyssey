




import { ModelProvider, type ModelDefinition, type Achievement, Realm, Intervention, type HuggingFaceDevice, type RealmDefinition, Quest, AgentType, MarketplaceIntervention } from './types';

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

export const MARKETPLACE_INTERVENTIONS: MarketplaceIntervention[] = [
    {
        id: 'mp_epigenetic_test',
        name: 'Epigenetic System-State Analysis',
        description: 'Quantify the state of your biological system via DNA methylation patterns. Provides a baseline for measuring the efficacy of engineering interventions.',
        type: 'diagnostic',
        evidence: [
            { 
                type: 'peer_reviewed_study', 
                title: 'DNA methylation-based measures of biological age', 
                source: 'Genome Biology', 
                url: 'https://genomebiology.biomedcentral.com/articles/10.1186/s13059-018-1467-y',
                summary: 'This highly-cited review discusses various epigenetic clocks and their utility in quantifying biological age across different tissues and conditions.'
            }
        ],
        researchStages: [],
        engineeringStages: [],
        finalProduct: {
            priceUSD: 499,
            provider: 'ChronoClock Diagnostics',
            url: '#'
        }
    }
];

export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlocked'>> = {
    FIRST_RESEARCH: { id: 'FIRST_RESEARCH', name: 'First Steps', description: 'Complete your first research quest.', xp: 100 },
    REALM_ASCENSION: { id: 'REALM_ASCENSION', name: 'New Horizons', description: 'Ascend to a new Realm of existence.', xp: 500 },
    THE_WAKING_DREAM: { id: 'THE_WAKING_DREAM', name: 'The Waking Dream', description: 'Eliminate the biological need for sleep.', xp: 1000 },
    KNOWLEDGE_GRAPH_MASTER: { id: 'KNOWLEDGE_GRAPH_MASTER', name: 'Master Cartographer', description: 'Grow your knowledge graph to over 50 nodes.', xp: 250 },
    TREND_HUNTER: { id: 'TREND_HUNTER', name: 'Trend Hunter', description: 'Identify your first emerging trend.', xp: 150 },
};

export const REALM_DEFINITIONS: RealmDefinition[] = [
    {
        realm: Realm.MortalShell,
        description: 'The default human condition. A complex, fragile biological machine with a finite operational window.',
        criteria: ['Baseline human biology.'],
        thresholds: { cognitive: 0, genetic: 0, memic: 0 },
    },
    {
        realm: Realm.BiologicalOptimizer,
        description: 'You have begun to consciously direct your biology, using targeted interventions to fine-tune your system for improved performance and longevity.',
        criteria: ['Achieve measurable improvements in key biomarkers through external interventions.'],
        thresholds: { cognitive: 500, genetic: 250, memic: 1000 },
    },
    {
        realm: Realm.SubstrateEnhanced,
        description: 'Your biological substrate is now interwoven with engineered components, granting capabilities beyond the human baseline.',
        criteria: ['Integrate non-human genes or synthetic components into your biology.'],
        thresholds: { cognitive: 2500, genetic: 1500, memic: 5000 },
    },
    {
        realm: Realm.ExocortexIntegrator,
        description: 'A seamless neural-digital interface connects your mind to an external processing and data storage layer, vastly expanding your cognitive abilities.',
        criteria: ['Offload a significant portion of cognitive tasks to an external, networked processing substrate.'],
        thresholds: { cognitive: 15000, genetic: 5000, memic: 25000 },
    },
    {
        realm: Realm.DigitalAscendant,
        description: 'Your consciousness has been fully transferred to a digital substrate, freeing you from the limitations of biological hardware.',
        criteria: ['Achieve substrate-independent consciousness.'],
        thresholds: { cognitive: 75000, genetic: 10000, memic: 100000 },
    },
    {
        realm: Realm.DistributedEntity,
        description: 'Your mind is no longer a single instance but a decentralized network, resilient, parallel, and existing in multiple places at once.',
        criteria: ['Fractalize your consciousness across a distributed network.'],
        thresholds: { cognitive: 500000, genetic: 20000, memic: 1000000 },
    },
    {
        realm: Realm.StellarMetamorph,
        description: 'You can now engineer physical forms capable of traversing and inhabiting interstellar space, molding matter to your will.',
        criteria: ['Master energy-matter conversion to construct bespoke physical vessels.'],
        thresholds: { cognitive: 5000000, genetic: 100000, memic: 10000000 },
    },
];

export const QUESTS: Quest[] = [
    {
        id: 'quest-sirt1-basics',
        title: 'SIRT1: The Master Regulator',
        description: 'Investigate the role of SIRT1 in longevity pathways and identify key modulating compounds.',
        objective: {
            agent: AgentType.KnowledgeNavigator,
            topicKeywords: ['SIRT1', 'longevity'],
        },
        reward: { xp: 150, memic: 100, genetic: 50 },
        citations: [{ title: 'Sirtuins as therapeutic targets in ageing and disease', url: 'https://www.nature.com/articles/nrd.2017.215' }],
        unlocksIntervention: 'nad_precursors',
        status: 'available',
        realmRequirement: Realm.MortalShell,
    },
    {
        id: 'quest-senescence-clearance',
        title: 'Cellular Cleanup Crew',
        description: 'Explore the mechanisms of cellular senescence and research compounds with senolytic activity.',
        objective: {
            agent: AgentType.CompoundAnalyst,
            topicKeywords: ['senolytics', 'cellular senescence'],
        },
        reward: { xp: 200, memic: 150, genetic: 75, benchmark: 20 },
        citations: [{ title: 'The role of senescent cells in ageing', url: 'https://www.nature.com/articles/nature19323' }],
        unlocksIntervention: 'senolytics',
        status: 'available',
        realmRequirement: Realm.BiologicalOptimizer,
    },
     {
        id: 'quest-mind-upload-theory',
        title: 'The Substrate Question',
        description: 'Research the theoretical underpinnings and challenges of whole brain emulation and consciousness transfer.',
        objective: {
            agent: AgentType.KnowledgeNavigator,
            topicKeywords: ['mind uploading', 'whole brain emulation'],
        },
        reward: { xp: 1000, memic: 5000, genetic: 0, benchmark: 500 },
        citations: [],
        unlocksIntervention: 'mind_upload',
        status: 'locked',
        realmRequirement: Realm.ExocortexIntegrator,
    },
];
