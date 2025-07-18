

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

export enum SearchType {
  Articles = "Scientific Articles",
  Patents = "Patents",
  BioData = "Biological Data",
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


// A more generic item to hold data from any source
export interface WorkspaceItem {
  id:string;
  type: 'article' | 'patent' | 'gene' | 'compound' | 'protein' | 'process' | 'trend';
  title: string;
  summary: string;
  details: string; // e.g., Authors, Inventors, Gene ID, Compound Formula
  sourceUri?: string; // Link to pubmed, patent office, etc.
  trendData?: TrendData;
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
  items: WorkspaceItem[];
  sources?: GroundingSource[];
  knowledgeGraph?: KnowledgeGraph;
  synthesis?: string;
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
    type: 'biological' | 'radical';
    effects: Record<string, number>; // biomarkerId -> improvementFactor (e.g., 0.1 for 10% improvement)
}

export interface TrajectoryState {
    biomarkers: Biomarker[];
    interventions: Intervention[];
    activeInterventionId: string | null;
    isRadicalInterventionActive: boolean;
    overallScore: {
        history: TrajectoryDataPoint[];
        projection: TrajectoryDataPoint[];
        interventionProjection?: TrajectoryDataPoint[];
    };
}

// --- Gamification: The Ascension Framework ---

export enum Realm {
    MortalBaseline = "Mortal Baseline",
    OptimizedMortal = "Optimized Mortal",
    AgeReversalPioneer = "Age Reversal Pioneer",
    BiologicalEscapeVelocity = "Biological Escape Velocity",
    SubstrateIndependence = "Substrate Independence",
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  xp: number; // Keep XP for bonus points/achievements, but not for leveling
}

export interface GamificationState {
  realm: Realm;
  vectors: {
    genetic: number;  // Represents biological integrity, improved by interventions
    memic: number;    // Represents knowledge contribution, improved by research
    cognitive: number;// Represents consciousness health, tied to longevity score
  };
  longevityScore: number; // The core metric driving the cognitive vector
  achievements: Record<string, Achievement>;
}

export interface ToastMessage {
    id: number;
    title: string;
    message: string;
    icon?: 'achievement' | 'levelup' | 'ascension';
}