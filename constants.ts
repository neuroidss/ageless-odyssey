

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
    "SIRT1 activators in patents",
    "mTOR inhibitors for longevity",
    "Cellular senescence and NAD+",
    "Role of FOXO3 in human longevity",
    "Epigenetic clock reprogramming",
    "Klotho gene therapy"
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

export const MARKETPLACE_INTERVENTIONS: MarketplaceIntervention[] = [
    {
        id: 'mp_epigenetic_test',
        name: 'Epigenetic Age Test Kit',
        description: 'Measure your biological age with a comprehensive analysis of your DNA methylation patterns. Provides a baseline for tracking intervention efficacy.',
        type: 'diagnostic',
        evidence: [
            { type: 'peer_reviewed_study', title: 'DNA methylation-based measures of biological age', source: 'Genome Biology', url: 'https://genomebiology.biomedcentral.com/articles/10.1186/s13059-021-02599-5', summary: 'Horvath and Raj review various epigenetic clocks and their strong correlation with chronological age and mortality risk.', metrics: {effectSize: 'r > 0.9', sampleSize: 'Multiple cohorts'} }
        ],
        researchStages: [],
        engineeringStages: [], // No stages needed, it's a TRL 9 product
        finalProduct: {
            priceUSD: 299,
            provider: 'Tally Health',
            url: 'https://tallyhealth.com/'
        }
    },
    {
        id: 'mp_full_genome_seq',
        name: 'Full Genome Sequencing',
        description: 'Deep, 30x whole-genome sequencing to uncover genetic predispositions (e.g., APOE4 status) and inform personalized interventions.',
        type: 'diagnostic',
        evidence: [
             { type: 'review_article', title: 'Whole-genome sequencing for personalized medicine', source: 'The Lancet', url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)01002-3/fulltext', summary: 'Discusses the utility of WGS in identifying rare disease variants and pharmacogenomic profiles, establishing it as a mature technology for personalized health.', metrics: {} }
        ],
        researchStages: [],
        engineeringStages: [],
        finalProduct: {
            priceUSD: 599,
            provider: 'Nebula Genomics',
            url: 'https://nebula.org/'
        }
    },
    {
        id: 'mp_partial_reprogramming_therapy',
        name: 'Partial Reprogramming Therapy',
        description: 'Systemic rejuvenation therapy using transient expression of Yamanaka factors (OSK) to reset epigenetic clocks without inducing tumorigenesis.',
        type: 'therapy',
        evidence: [
             { 
                type: 'peer_reviewed_study', 
                title: 'In Vivo Amelioration of Age-Associated Hallmarks by Partial Reprogramming', 
                source: 'Cell', 
                url: 'https://www.cell.com/cell/fulltext/S0092-8674(16)31664-6', 
                summary: 'A landmark 2016 study demonstrating that short-term, cyclic expression of Yamanaka factors in progeroid mice reversed signs of aging and extended lifespan, without inducing tumors or losing cell identity.', 
                metrics: { effectSize: '30% lifespan extension (progeroid mice)' } 
             },
             { type: 'patent_filing', title: 'Methods for partial reprogramming of cells', source: 'USPTO', summary: 'Patents filed by major research institutes cover various methods for controlling Yamanaka factor expression to avoid pluripotency.'}
        ],
        researchStages: [
            { id: 'prt_rs1', name: 'Confirm In-Vitro Safety', description: 'Rigorously test various cyclic OSK expression protocols on multiple human cell lines to confirm no loss of cell identity and zero teratoma formation.', agent: AgentType.GeneAnalyst, complexity: 10000, reward: { benchmark: 50, genetic: 500 } },
            { id: 'prt_rs2', name: 'Identify Biomarkers', description: 'Analyze transcriptomic and proteomic data from in-vitro studies to find reliable biomarkers that track rejuvenation state and safety.', agent: AgentType.TrendSpotter, complexity: 25000, reward: { benchmark: 100, genetic: 1000 } }
        ],
        engineeringStages: [
            { id: 'prt_es1', name: 'Develop Delivery Vector', description: 'Engineer a safe and efficient in-vivo delivery mechanism (e.g., AAV, lipid nanoparticle) for the OSK factors with controllable expression.', agent: AgentType.CompoundAnalyst, complexity: 50000, reward: { benchmark: 200, genetic: 2500 } },
            { id: 'prt_es2', name: 'Pre-clinical Primate Study', description: 'Conduct a long-term study in non-human primates to demonstrate safety, efficacy, and optimal dosing strategy.', agent: AgentType.KnowledgeNavigator, complexity: 150000, reward: { benchmark: 500, genetic: 10000 } },
            { id: 'prt_es3', name: 'Design Phase I Trial', description: 'Formulate a comprehensive plan for a Phase I human clinical trial, including inclusion/exclusion criteria, endpoints, and safety protocols.', agent: AgentType.Strategist, complexity: 80000, strategistPrompt: "Design a Phase I clinical trial for a partial reprogramming therapy. Propose three alternative trial designs, focusing on different patient cohorts (e.g., healthy elderly, progeria patients, specific age-related disease). Detail the primary safety endpoints, secondary efficacy biomarkers (e.g., epigenetic clocks), and estimated cost/timeline for each.", reward: { benchmark: 400 } },
        ],
    },
    {
        id: 'mp_nanobot_repair_swarm',
        name: 'Nanobot Cellular Repair Swarm',
        description: 'A theoretical swarm of programmable biological nanobots designed to identify and repair cellular damage, clear waste, and reverse aging processes at the molecular level.',
        type: 'theoretical',
        evidence: [
             { type: 'peer_reviewed_study', title: 'A DNA nanorobot functions as a cancer therapeutic in response to a molecular trigger in vivo', source: 'Nature Biotechnology', url: 'https://www.nature.com/articles/nbt.4071', summary: 'Researchers designed a DNA-based nanorobot that could successfully target and treat tumors in mice, proving the principle of targeted molecular machines.', metrics: { effectSize: 'Significant tumor shrinkage', sampleSize: 'N=mice' } },
             { type: 'expert_projection', title: 'The Singularity Is Near', source: 'Book by Ray Kurzweil', url: 'https://en.wikipedia.org/wiki/The_Singularity_Is_Near', summary: 'Kurzweil projects that by the 2030s, medical nanorobots will be capable of extending life indefinitely by repairing the body at a cellular level.', metrics: {} }
        ],
        researchStages: [
            { id: 'nano_rs1', name: 'Molecular Manufacturing Blueprint', description: 'Design a self-replicating molecular assembler capable of constructing diamondoid components with atomic precision.', agent: AgentType.Strategist, complexity: 500000, reward: { benchmark: 1000 } },
            { id: 'nano_rs2', name: 'Biocompatibility Analysis', description: 'Simulate the long-term interaction of diamondoid nanostructures with biological tissues to identify and mitigate potential toxicity and immune responses.', agent: AgentType.CompoundAnalyst, complexity: 300000, reward: { benchmark: 800 } },
            { id: 'nano_rs3', name: 'Onboard Power Source', description: 'Theorize and model a viable onboard power source for a nanobot, such as glucose metabolism or acoustic energy harvesting.', agent: AgentType.KnowledgeNavigator, complexity: 400000, reward: { benchmark: 900 } },
        ],
        engineeringStages: [
             { id: 'nano_es1', name: 'Swarm Coordination AI', description: 'Develop a decentralized AI capable of coordinating trillions of nanobots to perform complex tasks without a central controller.', agent: AgentType.Strategist, complexity: 1000000, reward: { benchmark: 2500 } },
        ]
    },
];


// --- Ascension Framework Constants ---

export const REALM_DEFINITIONS: RealmDefinition[] = [
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
  FIRST_RESEARCH: { id: 'FIRST_RESEARCH', name: 'First Steps', description: 'Complete your first research quest.', xp: 50 },
  BIO_STRATEGIST: { id: 'BIO_STRATEGIST', name: 'Bio-Strategist', description: 'Unlock your first biological intervention through research.', xp: 150 },
  EXPONENTIAL_THINKER: { id: 'EXPONENTIAL_THINKER', name: 'Exponential Thinker', description: 'Discover a high-velocity trend by spotting emerging patterns.', xp: 250 },
  KNOWLEDGE_ARCHITECT: { id: 'KNOWLEDGE_ARCHITECT', name: 'Knowledge Architect', description: 'Complete a quest that builds out the Knowledge Graph.', xp: 100 },
  TRANSHUMANIST: { id: 'TRANSHUMANIST', name: 'Transhumanist', description: 'Unlock a radical intervention, embracing a post-biological future.', xp: 500 },
  REALM_ASCENSION: { id: 'REALM_ASCENSION', name: 'Ascendant', description: 'Reach the Realm of the Biological Optimizer.', xp: 200 },
};

export const QUESTS: Quest[] = [
    {
        id: 'Q01_TRENDS',
        title: 'Scan the Horizon',
        description: 'The first step is to understand the landscape. Use the Singularity Detector to identify emerging trends in the broader field of longevity.',
        objective: { agent: AgentType.TrendSpotter, topicKeywords: ['longevity', 'rejuvenation', 'anti-aging'] },
        reward: { xp: 100, memic: 150, genetic: 0 },
        citations: [
            { title: "The Hallmarks of Aging (López-Otín et al., 2013)", url: "https://doi.org/10.1016/j.cell.2013.05.039" }
        ],
        unlocksAchievement: 'EXPONENTIAL_THINKER',
        realmRequirement: Realm.MortalShell,
        status: 'available',
    },
    {
        id: 'Q02_SENOLYTICS',
        title: 'Calibrate: Senolytics',
        description: "Cellular senescence is a key hallmark of aging. Investigate the primary senolytic compounds. This quest will test the system's ability to navigate foundational concepts.",
        objective: { agent: AgentType.KnowledgeNavigator, topicKeywords: ['senolytics', 'dasatinib', 'quercetin'] },
        reward: { xp: 150, memic: 200, genetic: 50, benchmark: 5 },
        citations: [
            { title: "The Clinical Potential of Senolytic Drugs (Kirkland et al., 2017)", url: "https://doi.org/10.1111/jgs.14969" }
        ],
        unlocksAchievement: 'BIO_STRATEGIST',
        unlocksIntervention: 'senolytics',
        realmRequirement: Realm.MortalShell,
        status: 'available',
    },
    {
        id: 'Q03_NAD',
        title: 'Investigate NAD+ Decline',
        description: "NAD+ is a critical coenzyme, and its decline is linked to aging. Research the efficacy of its precursors as a restorative therapy.",
        objective: { agent: AgentType.KnowledgeNavigator, topicKeywords: ['NAD+', 'precursors', 'NMN', 'NR'] },
        reward: { xp: 150, memic: 200, genetic: 50 },
        citations: [
            { title: "The NAD+ Precursor Nicotinamide Riboside Enhances Oxidative Metabolism (Cantó et al., 2012)", url: "https://doi.org/10.1016/j.cmet.2012.04.022" }
        ],
        unlocksIntervention: 'nad_precursors',
        realmRequirement: Realm.MortalShell,
        status: 'available',
    },
    {
        id: 'Q04_FOXO3',
        title: 'Calibrate: The FOXO3 Gene',
        description: "The FOXO3 gene is strongly correlated with exceptional human longevity. Use the Gene Analyst to extract its properties. This serves as a calibration test: can the system correctly parse and structure specific genetic data?",
        objective: { agent: AgentType.GeneAnalyst, topicKeywords: ['FOXO3', 'longevity'] },
        reward: { xp: 200, memic: 250, genetic: 75, benchmark: 10 },
        citations: [
            { title: "FOXO3A genotype is strongly associated with human longevity (Willcox et al., 2008)", url: "https://doi.org/10.1073/pnas.0801030105" }
        ],
        unlocksAchievement: 'KNOWLEDGE_ARCHITECT',
        realmRequirement: Realm.BiologicalOptimizer,
        status: 'locked',
    },
     {
        id: 'Q05_NEURAL_INTERFACE',
        title: 'The Substrate Bridge',
        description: "The limits of biology are becoming apparent. Investigate the frontier of brain-computer interfaces, the first step towards a non-biological existence.",
        objective: { agent: AgentType.TrendSpotter, topicKeywords: ['brain-computer interface', 'neural lace', 'exocortex'] },
        reward: { xp: 500, memic: 1000, genetic: 250 },
        citations: [
            { title: "High-performance brain-to-text communication via imagined handwriting (Willett et al., 2021)", url: "https://doi.org/10.1038/s41586-021-03506-2" }
        ],
        unlocksAchievement: 'TRANSHUMANIST',
        unlocksIntervention: 'neuro_interface',
        realmRequirement: Realm.SubstrateEnhanced,
        status: 'locked',
    },
];