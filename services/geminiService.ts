import { GoogleGenAI, Type } from "@google/genai";
import { type AgentResponse, type WorkspaceItem, type GroundingSource, type KnowledgeGraph, type ModelDefinition, ModelProvider, AgentType } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Google AI models will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const OLLAMA_BASE_URL = 'http://localhost:11434/api/generate';

const callOllamaAPI = async (modelId: string, systemInstruction: string, userPrompt: string, isJson: boolean = false): Promise<string> => {
    const fullPrompt = `${systemInstruction}\n\n${userPrompt}`;
    
    try {
        const response = await fetch(OLLAMA_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelId,
                prompt: fullPrompt,
                stream: false,
                format: isJson ? 'json' : undefined,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        return data.response; 

    } catch (error) {
        console.error("Error calling Ollama API:", error);
        throw new Error("Failed to connect to local Ollama server. Is it running at http://localhost:11434?");
    }
}

const buildAgentPrompts = (query: string, agentType: AgentType): { systemInstruction: string, userPrompt: string, responseSchema?: any } => {
    switch (agentType) {
        case AgentType.GeneAnalyst:
            return {
                systemInstruction: "You are an AI agent specializing in bioinformatics (OpenGenes AI). Extract genes related to the user's query from scientific literature. Provide output as structured JSON.",
                userPrompt: `For the research topic "${query}", identify the top 5 most relevant genes discussed in scientific literature. For each gene, provide its standard symbol, full name, and a brief summary of its role in the specified context.`,
                responseSchema: {
                    type: Type.OBJECT, properties: { genes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { symbol: { type: Type.STRING }, name: { type: Type.STRING }, summary: { type: Type.STRING } } } } }
                }
            };
        case AgentType.CompoundAnalyst:
            return {
                systemInstruction: "You are an AI agent specializing in pharmacology and patent analysis. Extract compounds and their bioactivity from patents and research papers related to the user's query. Provide output as structured JSON.",
                userPrompt: `For the research topic "${query}", find the top 5 compounds mentioned in patents or papers. For each compound, provide its name, a summary of its mechanism of action, and the associated patent number or primary publication.`,
                responseSchema: {
                     type: Type.OBJECT, properties: { compounds: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, mechanism: { type: Type.STRING }, source: { type: Type.STRING } } } } }
                }
            };
        case AgentType.KnowledgeNavigator:
        default:
            return {
                systemInstruction: "You are a world-class bioinformatics research assistant (Longevity Knowledge Navigator). Summarize scientific articles and build a knowledge graph based on the user's query.",
                userPrompt: `Topic: "${query}". Find the top 3 most relevant scientific articles. For each, provide its Title, a concise Summary of findings, and the primary Authors. Also, extract a knowledge graph of the key biological entities and their relationships.`,
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        articles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, authors: { type: Type.STRING } } } },
                        knowledgeGraph: {
                            type: Type.OBJECT, properties: {
                                nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, label: { type: Type.STRING }, type: { type: Type.STRING } } } },
                                edges: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING }, label: { type: Type.STRING } } } }
                            }
                        }
                    }
                }
            };
    }
};

const parseAgentResponse = (jsonText: string, agentType: AgentType): AgentResponse => {
    try {
        const data = JSON.parse(jsonText);
        let items: WorkspaceItem[] = [];
        let knowledgeGraph: KnowledgeGraph | null = null;

        switch (agentType) {
            case AgentType.GeneAnalyst:
                if (data.genes) {
                    items = data.genes.map((g: any) => ({
                        id: `gene-${g.symbol}`, type: 'gene', title: g.symbol, summary: g.summary, details: g.name
                    }));
                }
                break;
            case AgentType.CompoundAnalyst:
                if (data.compounds) {
                    items = data.compounds.map((c: any) => ({
                        id: `compound-${c.name.replace(/\s+/g, '-')}`, type: 'compound', title: c.name, summary: c.mechanism, details: `Source: ${c.source}`
                    }));
                }
                break;
            case AgentType.KnowledgeNavigator:
            default:
                 if (data.articles) {
                    items = data.articles.map((a: any) => ({
                        id: `article-${a.title.slice(0, 20).replace(/\s+/g, '-')}`, type: 'article', title: a.title, summary: a.summary, details: `Authors: ${a.authors}`
                    }));
                }
                if (data.knowledgeGraph) {
                    knowledgeGraph = data.knowledgeGraph;
                }
                break;
        }
        
        return { items, knowledgeGraph: knowledgeGraph ?? undefined };

    } catch (error) {
        console.error(`Error parsing response for ${agentType}:`, error);
        // Fallback for non-JSON or malformed responses
        return { items: [{ id: 'fallback-item', type: 'article', title: 'Raw Response', summary: jsonText, details: 'Could not parse structured data.' }] };
    }
};


export const dispatchAgent = async (query: string, agentType: AgentType, model: ModelDefinition): Promise<AgentResponse> => {
    const { systemInstruction, userPrompt, responseSchema } = buildAgentPrompts(query, agentType);
    
    try {
        let jsonText: string;
        let uniqueSources: GroundingSource[] = [];

        if (model.provider === ModelProvider.Ollama) {
            jsonText = await callOllamaAPI(model.id, systemInstruction, userPrompt, true);
        } else {
             if (!process.env.API_KEY) throw new Error("API_KEY is not set. Please set it to use Google AI models.");
            const response = await ai.models.generateContent({
                model: model.id,
                contents: userPrompt,
                config: { systemInstruction, tools: [{ googleSearch: {} }], responseMimeType: 'application/json', responseSchema },
            });
            jsonText = response.text;
            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            const webSources: GroundingSource[] = groundingMetadata?.groundingChunks?.map(chunk => chunk.web).filter((web): web is { uri: string; title?: string } => !!web?.uri).map(web => ({ uri: web.uri, title: web.title || web.uri })) ?? [];
            uniqueSources = Array.from(new Map(webSources.map(item => [item.uri, item])).values());
        }

        const agentResponse = parseAgentResponse(jsonText, agentType);
        agentResponse.sources = uniqueSources;
        return agentResponse;

    } catch (error) {
        console.error(`Error in dispatchAgent for ${agentType}:`, error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) errorMessage = error.message;
        throw new Error(`Failed to get data from AI Agent: ${errorMessage}`);
    }
};

export const synthesizeFindings = async (query: string, items: WorkspaceItem[], model: ModelDefinition): Promise<string> => {
    const resultsText = items.map(i => `Type: ${i.type}\nTitle: ${i.title}\nSummary: ${i.summary}`).join('\n---\n');
    const systemInstruction = `You are a world-class bioinformatics and longevity research scientist. Your task is to analyze a collection of data (articles, genes, compounds) and provide a high-level synthesis and a novel hypothesis. The output must be well-structured, clear, and scientifically plausible. Use Markdown for formatting: use **bold** for headings and use bullet points for lists (e.g., '* item').`;
    const userPrompt = `Based on the original research topic "${query}" and the following data, provide two sections:\n\n1.  **Synthesis**: A concise synthesis of the key findings, connecting the different data types (genes, compounds, etc.).\n2.  **Novel Hypothesis**: A novel, testable research hypothesis that connects these findings or proposes a corrective action for the "incorrect development" represented by the topic.\n\nHere is the collected data:\n${resultsText}`;

    try {
        if (model.provider === ModelProvider.Ollama) {
            return await callOllamaAPI(model.id, systemInstruction, userPrompt);
        }
        
        if (!process.env.API_KEY) throw new Error("API_KEY is not set. Please set it to use Google AI models.");
        const response = await ai.models.generateContent({
            model: model.id,
            contents: userPrompt,
            config: { systemInstruction, temperature: 0.7 },
        });
        return response.text;
    } catch (error) {
        console.error("Error calling AI for synthesis:", error);
        let errorMessage = "An unknown error occurred during synthesis.";
        if (error instanceof Error) errorMessage = error.message;
        throw new Error(`Failed to synthesize data from AI service: ${errorMessage}`);
    }
};