
// --- WebGPU Type Definitions for Experimental APIs ---
// These declarations are added to resolve TypeScript errors related to
// experimental WebGPU features, such as `GPUSupportedFeatures` and `navigator.gpu`.

export type GPUFeatureName =
    | 'depth-clip-control'
    | 'depth24unorm-stencil8'
    | 'depth32float-stencil8'
    | 'texture-compression-bc'
    | 'texture-compression-etc2'
    | 'texture-compression-astc'
    | 'timestamp-query'
    | 'indirect-first-instance'
    | 'shader-f16'
    | 'rg11b10ufloat-renderable';

export interface GPUSupportedFeatures extends ReadonlySet<GPUFeatureName> {}

export interface GPUAdapter {
    readonly features: GPUSupportedFeatures;
    requestDevice(): Promise<GPUDevice>;
}

export interface GPUDevice {}

export interface GPU {
    requestAdapter(): Promise<GPUAdapter | null>;
}

// Augment the global Navigator interface
declare global {
    interface Navigator {
        readonly gpu?: GPU;
    }
}

// --- End WebGPU Type Definitions ---


export type HuggingFaceDevice = 'wasm' | 'webgpu';

export enum SearchDataSource {
  PubMed = "PubMed",
  BioRxivSearch = "bioRxiv (Search)",
  BioRxivFeed = "bioRxiv (Live Feed)",
  GooglePatents = "Google Patents",
  WebSearch = "Web Search",
  OpenGenes = "OpenGenes",
}

export enum ModelProvider {
    GoogleAI = 'Google AI',
    Ollama = 'Ollama',
    HuggingFace = 'Hugging Face',
}

export enum AgentType {
    KnowledgeNavigator = "Knowledge Navigator",
    GeneAnalyst = "Gene Analyst",
    CompoundAnalyst = "Compound Analyst",
    TrendSpotter = "Trend Spotter",
    QuestCrafter = "Quest Crafter",
    Strategist = "Strategist", // New agent for decision support
}

export interface ModelDefinition {
    id: string;
    name: string;
    provider: ModelProvider;
}

export type TrendData = {
    novelty: number; // Score 0-100
    velocity: number; // Score 0-100
    impact: number; // Score 0-100
    justification: string;
};

export interface GeneData {
    function: string;
    organism: string;
    lifespanEffect: string;
    intervention: string;
}

// A more generic item to hold data from any source
export interface WorkspaceItem {
  id:string;
  type: 'article' | 'patent' | 'gene' | 'compound' | 'protein' | 'process' | 'trend';
  title: string;
  summary: string;
  details: string; // e.g., Authors, Inventors, Gene ID, Compound Formula
  sourceUri?: string; // Link to pubmed, patent office, etc.
  trendData?: TrendData;
  geneData?: GeneData;
  questForged?: boolean; // For trends, indicates if a quest has been generated
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface KnowledgeGraphNode {
    id: string;
    label: string;
    type: 'Gene' | 'Protein' | 'Compound' | 'Pathway' | 'Disease' | 'Process' | 'Topic';
    status?: 'normal' | 'dysregulated' | 'intervention_target';
    x?: number;
    y?: number;
}

export interface KnowledgeGraphEdge {
    source: string; // node id
    target: string; // node id
    label: string;
}

export interface KnowledgeGraph {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
}

export interface WorkspaceState {
  topic: string;
  items: WorkspaceItem[];
  sources: GroundingSource[];
  knowledgeGraph: KnowledgeGraph | null;
  synthesis: string | null;
  timestamp: number;
}

// The API response is now more modular
export interface AgentResponse {
  items?: WorkspaceItem[];
  sources?: GroundingSource[];
  knowledgeGraph?: KnowledgeGraph;
  synthesis?: string;
  newQuest?: Omit<Quest, 'id' | 'status' | 'realmRequirement' | 'isDynamic' | 'sourceTrendId'>;
}

// Trajectory and Biomarker Simulation
export interface TrajectoryDataPoint {
    year: number;
    value: number;
}

export interface Biomarker {
    id: string;
    name: string;
    description: string;
    unit: string; // e.g., '%', 'kb', 'μM'
    trendDirection: 'up' | 'down'; // 'up' means higher is better
    history: TrajectoryDataPoint[];
    projection: TrajectoryDataPoint[];
    interventionProjection?: TrajectoryDataPoint[];
    bypassed?: boolean; // New: To handle radical interventions
}

export interface Intervention {
    id: string;
    name: string;
    description: string;
    type: 'biological' | 'environmental' | 'radical'; // Expanded types
    effects: Record<string, number>; // biomarkerId -> improvementFactor (e.g., 0.1 for 10% improvement)
    status: 'locked' | 'unlocked';
}

export interface TrajectoryState {
    biomarkers: Biomarker[];
    interventions: (Intervention & { sophistication: number })[];
    activeInterventionId: string | null;
    isRadicalInterventionActive: boolean;
    overallScore: {
        history: TrajectoryDataPoint[];
        projection: TrajectoryDataPoint[];
        interventionProjection?: TrajectoryDataPoint[];
    };
}

// --- The Ageless Odyssey Framework ---

export enum Realm {
    MortalShell = "Mortal Shell",
    BiologicalOptimizer = "Biological Optimizer",
    SubstrateEnhanced = "Substrate Enhanced",
    ExocortexIntegrator = "ExocortexIntegrator",
    DigitalAscendant = "Digital Ascendant",
    DistributedEntity = "Distributed Entity",
    StellarMetamorph = "Stellar Metamorph",
}

export interface RealmDefinition {
    realm: string;
    description: string;
    criteria: string[];
    thresholds: {
        cognitive: number;
        genetic: number;
        memic: number;
    };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  xp: number; 
}


export interface Evidence {
    type: 'peer_reviewed_study' | 'clinical_trial_result' | 'review_article' | 'patent_filing' | 'expert_projection';
    title: string;
    source: string;
    url?: string;
    summary: string;
    metrics?: {
        effectSize?: string;
        pValue?: string;
        sampleSize?: string;
    };
}

export interface RAndDStage {
    id: string;
    name: string;
    description: string;
    complexity: number; // Memic cost to complete
    agent: AgentType;
    strategistPrompt?: string; // Optional complex prompt for strategist agent
    reward?: {
        memic?: number;
        genetic?: number;
        benchmark?: number;
    };
}

export enum HypeCyclePhase {
    InnovationTrigger = "Innovation Trigger",
    PeakOfInflatedExpectations = "Peak of Inflated Expectations",
    TroughOfDisillusionment = "Trough of Disillusionment",
    SlopeOfEnlightenment = "Slope of Enlightenment",
    PlateauOfProductivity = "Plateau of Productivity",
}


export interface MarketplaceIntervention {
    id: string;
    name: string;
    description: string;
    type: 'diagnostic' | 'supplement' | 'therapy' | 'theoretical';
    
    evidence: Evidence[];

    // TRL is now implicit, calculated from stage completion
    researchStages: RAndDStage[];
    engineeringStages: RAndDStage[];
    
    // Final product details, for when TRL 9 is reached
    finalProduct?: {
        priceUSD: number;
        provider: string;
        url: string;
    };
}

// --- Investment & Portfolio Types ---
export interface CartItem {
    interventionId: string;
    name: string;
    price: number;
}

export interface InvestmentItem {
    interventionId: string;
    name: string;
    stageName: string;
    amount: number;
}
// --- End Investment Types ---


export interface OdysseyState {
  realm: string; // Changed to string to allow dynamic, AI-generated realms
  vectors: {
    genetic: number;  // Represents Substrate Engineering: the degree of deliberate control over your biological and non-biological hardware.
    memic: number;    // Represents Knowledge Contribution: the accumulation and synthesis of information towards a complete model of the universe.
    cognitive: number;// Represents Consciousness Integrity: the performance of your conscious substrate, driven by self-mastery.
    capital: number;  // Represents financial resources for investment.
  };
  benchmarkScore: number; // Represents the clarity and predictive power of your engineering models of the universe.
  longevityScore: number; // The core metric representing self-mastery and system integrity, which drives the cognitive vector.
  achievements: Record<string, Achievement>;
  completedStages: Record<string, string[]>; // interventionId -> array of completed stageIds
  rejuvenationCart: CartItem[];
  investmentPortfolio: InvestmentItem[];
}

export interface ToastMessage {
    id: number;
    title: string;
    message: string;
    icon?: 'achievement' | 'levelup' | 'ascension' | 'oracle' | 'quest' | 'error' | 'success' | 'purchase' | 'investment';
}

export interface Citation {
    title: string;
    url: string;
}

export interface Quest {
    id:string;
    title: string;
    description: string;
    objective: {
        agent: AgentType;
        topicKeywords: string[];
        source?: SearchDataSource; // Optional: require a specific source
    };
    reward: {
        xp: number;
        memic: number;
        genetic: number;
        benchmark?: number;
    };
    citations: Citation[];
    unlocksAchievement?: string;
    unlocksIntervention?: string;
    status: 'locked' | 'available' | 'completed';
    realmRequirement: Realm; // Quest becomes available in this realm
    isDynamic?: boolean; // True if the quest was generated by an AI
    sourceTrendId?: string; // ID of the trend that generated this quest
}

// --- RAG System Types ---
export interface RAGIndexEntry {
    text: string;
    id: string; // id of the source item (quest or workspace item)
    embedding: number[];
}

export interface RAGContext {
    context: string;
    sources: string[];
}