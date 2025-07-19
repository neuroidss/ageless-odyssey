

import { GoogleGenAI, Type } from "@google/genai";
import { 
    type AgentResponse, type WorkspaceItem, type GroundingSource, type KnowledgeGraph, 
    type ModelDefinition, ModelProvider, AgentType, HuggingFaceDevice, SearchDataSource, 
    type OdysseyState, type TrajectoryState, type WorkspaceState, type RealmDefinition, GeneData, Quest, TrendData, RAGContext 
} from '../types';
import { performFederatedSearch, type SearchResult } from './searchService';
import { generateTextWithHuggingFace } from './huggingFaceService';

const OLLAMA_BASE_URL = 'http://localhost:11434/api/generate';

const callOllamaAPI = async (modelId: string, systemInstruction: string, userPrompt: string, isJson: boolean = false, addLog: (msg: string) => void): Promise<string> => {
    const fullPrompt = `${systemInstruction}\n\n${userPrompt}`;
    addLog(`[Ollama] Calling model '${modelId}'...`);
    
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
            addLog(`[Ollama] ERROR: API request failed with status ${response.status}: ${errorBody}`);
            throw new Error(`Ollama API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        addLog(`[Ollama] Successfully received response from model '${modelId}'. Raw length: ${data.response?.length || 0}`);
        
        let cleanedResponse = data.response || '';

        // Remove <think>...</think> blocks that some models (like Qwen) might output.
        const thinkTagRegex = /<think>[\s\S]*?<\/think>/gi;
        if (thinkTagRegex.test(cleanedResponse)) {
            const originalLength = cleanedResponse.length;
            cleanedResponse = cleanedResponse.replace(thinkTagRegex, '').trim();
            addLog(`[Ollama] Removed <think> tags from the response. New length: ${cleanedResponse.length} (was ${originalLength})`);
        }
        
        return cleanedResponse;

    } catch (error) {
        addLog(`[Ollama] ERROR: Failed to connect to Ollama server. ${error}`);
        throw new Error("Failed to connect to local Ollama server. Is it running at http://localhost:11434?");
    }
}

const buildAgentPrompts = (query: string, agentType: AgentType, searchContext?: string, provider?: ModelProvider, trendContext?: TrendData, ragContext?: RAGContext): { systemInstruction: string; userPrompt: string; responseSchema?: any } => {
    const jsonOutputInstruction = "You MUST output your findings as a single, valid JSON object and NOTHING ELSE. Do not include any explanatory text, markdown formatting, or any other characters outside of the main JSON object.";
    
    const ragContextPreamble = ragContext
        ? `First, consider the following historical context from your previous work. This is your memory. Use it to inform your response, avoid redundant work, and build upon past discoveries.\n\n<PAST_WORK_CONTEXT>\n${ragContext.context}\n</PAST_WORK_CONTEXT>\n\n`
        : '';

    const contextPreamble = searchContext 
        ? `Based *only* on the following search results from various scientific databases and the web, fulfill the user's request.\n\n<SEARCH_RESULTS>\n${searchContext}\n</SEARCH_RESULTS>\n\n`
        : '';

    const isLocalModel = provider === ModelProvider.Ollama || provider === ModelProvider.HuggingFace;

    switch (agentType) {
        case AgentType.QuestCrafter: {
            const trendDetails = trendContext ? `
- **Name**: ${query}
- **Summary**: ${trendContext.justification}
- **Novelty/Velocity/Impact**: ${trendContext.novelty}/${trendContext.velocity}/${trendContext.impact}
` : `A trend related to "${query}"`;

            let userPrompt = `Based on this emerging scientific trend, design a new research quest.
The quest should be a challenging but concrete next step for a researcher.
${trendDetails}

Generate a JSON object with a single key "newQuest" containing:
- **title**: A compelling, action-oriented name for the quest.
- **description**: A brief, motivating summary of why this research is important.
- **objective**: An object with "agent" (the most suitable AgentType for the task, e.g., "Knowledge Navigator" or "Gene Analyst") and "topicKeywords" (an array of 3-4 specific keywords for the agent to search).
- **reward**: An object with "xp", "memic", and "genetic" points. Balance them based on the quest's difficulty and potential impact. (e.g., xp: 200, memic: 300, genetic: 100).
- **citations**: An array containing one or two key scientific papers that form the basis for this trend. Include "title" and a valid "url". If you must invent a citation because none was provided, base it on the trend data.
`;
            
             const questSchema = {
                type: Type.OBJECT, properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    objective: {
                        type: Type.OBJECT, properties: {
                            agent: { type: Type.STRING, enum: Object.values(AgentType) },
                            topicKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    },
                    reward: {
                        type: Type.OBJECT, properties: {
                            xp: { type: Type.NUMBER },
                            memic: { type: Type.NUMBER },
                            genetic: { type: Type.NUMBER }
                        }
                    },
                    citations: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                title: { type: Type.STRING },
                                url: { type: Type.STRING }
                            }
                        }
                    }
                }
            };

            return {
                systemInstruction: `${ragContextPreamble}You are the Quest Forger, an AI that transforms cutting-edge scientific trends into actionable research objectives. Your task is to create a well-defined quest in a specific JSON format. ${jsonOutputInstruction}`,
                userPrompt,
                responseSchema: { type: Type.OBJECT, properties: { newQuest: questSchema } }
            };
        }
        case AgentType.TrendSpotter: {
            let userPrompt = `${contextPreamble}Analyze the research landscape around "${query}" to identify the top 3-5 emerging, high-potential trends. For each trend, provide a name, a summary, a justification for its high potential, and score its novelty, velocity, and potential impact on a scale of 0-100.

Also, construct a knowledge graph. This graph should contain a central 'Topic' node representing "${query}". For each trend you identify, create a 'Process' node (e.g. for "Targeting Glial-Specific Autophagy"). The 'id' for trend nodes should be a slug-cased version of the trend name. Connect each trend node to the central topic node with a "is a trend in" edge.

Your response MUST be a JSON object with two top-level keys: "trends" and "knowledgeGraph".`;

            if (isLocalModel) {
                // Add a clear example for local models to follow, but still request the graph.
                const querySlug = query.replace(/\s+/g, '-').toLowerCase();
                userPrompt += `

Example JSON structure:
{
  "trends": [
    {
      "name": "Targeting Glial-Specific Autophagy",
      "summary": "A new focus on clearing cellular debris specifically within glial cells of the brain to combat neuroinflammation and cognitive decline.",
      "justification": "Recent papers show a direct link between impaired glial autophagy and Alzheimer's models. This moves beyond general autophagy to a highly specific and impactful target.",
      "novelty": 85,
      "velocity": 70,
      "impact": 90
    }
  ],
  "knowledgeGraph": {
    "nodes": [
      { "id": "topic-${querySlug}", "label": "${query}", "type": "Topic" },
      { "id": "process-targeting-glial-specific-autophagy", "label": "Targeting Glial-Specific Autophagy", "type": "Process" }
    ],
    "edges": [
      { "source": "process-targeting-glial-specific-autophagy", "target": "topic-${querySlug}", "label": "is a trend in" }
    ]
  }
}`;
            }

            return {
                systemInstruction: `${ragContextPreamble}You are a 'Singularity Detector' AI, a world-class research analyst specializing in identifying exponentially growing and radically transformative trends in longevity science. Your task is to analyze scientific literature, patents, and pre-prints to find the 'next big thing'. ${jsonOutputInstruction}`,
                userPrompt: userPrompt,
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        trends: {
                            type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    name: { type: Type.STRING },
                                    summary: { type: Type.STRING },
                                    justification: { type: Type.STRING },
                                    novelty: { type: Type.NUMBER },
                                    velocity: { type: Type.NUMBER },
                                    impact: { type: Type.NUMBER },
                                }
                            }
                        },
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
        case AgentType.GeneAnalyst: {
            let userPrompt = `${contextPreamble}For the research topic "${query}", analyze the provided search results from the OpenGenes database. Identify the top 5 most relevant genes. For each gene, extract its symbol, full name (from the 'title' field), summary (from the 'snippet' field), organism, lifespan effect, and intervention type directly from the provided 'CONTENT' of each context block. The 'function' should be 'Longevity Activator' if the snippet contains 'pro-longevity', 'Longevity Inhibitor' if it contains 'anti-longevity', and 'Context-Dependent' otherwise. Combine the 'Effect' and lifespan change percentage into the 'lifespanEffect' field.`;

            if (isLocalModel) {
                 userPrompt += `\n\nYour response MUST follow this exact JSON structure:\n{\n  "genes": [\n    {\n      "symbol": "FOXO3",\n      "name": "Forkhead box protein O3",\n      "summary": "A key transcription factor that regulates the expression of genes involved in stress resistance, metabolism, and cell apoptosis, strongly linked to exceptional human longevity.",\n      "function": "Longevity Activator",\n      "lifespanEffect": "pro-longevity (+10% to +30%)",\n      "organism": "Homo sapiens",\n      "intervention": "Genetic variant (SNP)"\n    }\n  ]\n}`;
            }
            return {
                systemInstruction: `${ragContextPreamble}You are a precise data extraction AI. Your task is to analyze structured text from the OpenGenes database and convert it into a specific JSON format. You must extract information *only* from the provided context. ${jsonOutputInstruction}`,
                userPrompt: userPrompt,
                responseSchema: {
                    type: Type.OBJECT, properties: { genes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { 
                        symbol: { type: Type.STRING }, 
                        name: { type: Type.STRING }, 
                        summary: { type: Type.STRING },
                        function: { type: Type.STRING },
                        lifespanEffect: { type: Type.STRING },
                        organism: { type: Type.STRING },
                        intervention: { type: Type.STRING },
                    } } } }
                }
            };
        }
        case AgentType.CompoundAnalyst: {
             let userPrompt = `${contextPreamble}For the research topic "${query}", analyze the provided patent data to find the top 5 chemical compounds or molecules. For each compound, extract its "name", its primary biological "targetProtein", its "bindingAffinity" (e.g., "IC50 = 10 nM", "Ki = 50 uM", or "activity at 1 uM"), and the "source" patent number (e.g., US11331305B2) which can be found in the URL.`;
             if (isLocalModel) {
                userPrompt += `\n\nYour response MUST follow this exact JSON structure:\n{\n  "compounds": [\n    {\n      "name": "N-Octanoyl Carnosine",\n      "targetProtein": "Extracellular matrix components",\n      "bindingAffinity": "Not specified, stimulates formation",\n      "source": "US11331305B2"\n    }\n  ]\n}`;
            }
            return {
                systemInstruction: `${ragContextPreamble}You are an AI agent specializing in pharmacology and patent analysis. Your task is to extract potential therapeutic compounds, their targets, and binding affinities from patent abstracts. ${jsonOutputInstruction}`,
                userPrompt: userPrompt,
                responseSchema: {
                     type: Type.OBJECT, properties: { compounds: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { 
                        name: { type: Type.STRING }, 
                        targetProtein: { type: Type.STRING }, 
                        bindingAffinity: { type: Type.STRING }, 
                        source: { type: Type.STRING } 
                    } } } }
                }
            };
        }
        case AgentType.KnowledgeNavigator:
        default: {
            let userPrompt = `${contextPreamble}Analyze the topic: "${query}". Respond with a JSON object containing two keys: "articles" and "knowledgeGraph". 
- "articles" should be an array of the top 3 most relevant scientific articles based on the search results, where each article object has "title", "summary", and "authors" (string of authors, infer if not present). If no relevant articles are found, this MUST be an empty array.
- "knowledgeGraph" should be an object with "nodes" (array of {id, label, type}) and "edges" (array of {source, target, label}). Create a rich, interconnected graph. Create a central node of type 'Topic' for the main query "${query}". Then, add nodes for key Genes, Compounds, and Processes found in the text. Connect these nodes to the central Topic node and to each other with descriptive labels (e.g., 'regulates', 'inhibits', 'implicated_in').`;
            
            if (isLocalModel) {
                 // Add a clear example for local models to follow, but still request the graph.
                const querySlug = query.replace(/\s+/g, '-').toLowerCase();
                const jsonStructureExample = `

Your response MUST follow this exact JSON structure:
{
  "articles": [
    {
      "title": "Title of Article 1",
      "summary": "A concise summary of the article's key findings from the provided text.",
      "authors": "Author A, Author B, et al."
    }
  ],
  "knowledgeGraph": {
    "nodes": [
      { "id": "topic-${querySlug}", "label": "${query}", "type": "Topic" },
      { "id": "gene-sirt1", "label": "SIRT1", "type": "Gene" }
    ],
    "edges": [
      { "source": "gene-sirt1", "target": "topic-${querySlug}", "label": "related to" }
    ]
  }
}`;
                userPrompt += jsonStructureExample;
            }

            return {
                systemInstruction: `${ragContextPreamble}You are a world-class bioinformatics research assistant (Longevity Knowledge Navigator). Your task is to summarize articles and build a rich, interconnected knowledge graph from the provided text. ${jsonOutputInstruction}`,
                userPrompt,
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        articles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: 'STRING' }, authors: { type: 'STRING' } } } },
                        knowledgeGraph: {
                            type: Type.OBJECT, properties: {
                                nodes: { type: Type.ARRAY, items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, label: { type: 'STRING' }, type: { type: 'STRING' } } } },
                                edges: { type: Type.ARRAY, items: { type: 'OBJECT', properties: { source: { type: 'STRING' }, target: { type: 'STRING' }, label: { type: 'STRING' } } } }
                            }
                        }
                    }
                }
            };
        }
    }
};

const parseJsonFromText = (text: string, addLog: (msg: string) => void): string => {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        addLog('[Parser] Extracted JSON from markdown code block.');
        return jsonMatch[1];
    }
    
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        addLog('[Parser] Extracted JSON by finding curly braces.');
        return text.substring(firstBrace, lastBrace + 1);
    }
    
    addLog(`[Parser] WARN: Could not find any JSON-like structures in the response. Using raw text, which will likely fail parsing.`);
    return text;
}


const parseAgentResponse = (jsonText: string, agentType: AgentType, addLog: (msg: string) => void): AgentResponse => {
    try {
        const data = JSON.parse(jsonText);
        addLog(`[Parser] Successfully parsed JSON for ${agentType}.`);
        const response: AgentResponse = {};

        switch (agentType) {
            case AgentType.QuestCrafter:
                if (data.newQuest) {
                    response.newQuest = data.newQuest;
                }
                break;
            case AgentType.TrendSpotter:
                if (data.trends) {
                    response.items = data.trends.map((t: any) => {
                        const novelty = Number(t.novelty) || 0;
                        const velocity = Number(t.velocity) || 0;
                        const impact = Number(t.impact) || 0;
                        return {
                            id: `trend-${t.name.replace(/\s+/g, '-')}`,
                            type: 'trend',
                            title: t.name,
                            summary: t.summary,
                            details: `Novelty: ${novelty}/100 | Velocity: ${velocity}/100 | Impact: ${impact}/100`,
                            trendData: {
                                novelty,
                                velocity,
                                impact,
                                justification: t.justification,
                            },
                            questForged: false,
                        };
                    });
                }
                if (data.knowledgeGraph) {
                    response.knowledgeGraph = data.knowledgeGraph;
                }
                break;
            case AgentType.GeneAnalyst:
                if (data.genes) {
                    response.items = data.genes.map((g: any) => {
                        const geneData: GeneData = {
                            function: g.function || 'N/A',
                            organism: g.organism || 'N/A',
                            lifespanEffect: g.lifespanEffect || 'N/A',
                            intervention: g.intervention || 'N/A',
                        };
                        return {
                            id: `gene-${g.symbol}`, 
                            type: 'gene', 
                            title: g.symbol, 
                            summary: g.summary, 
                            details: g.name, // Use full name for details
                            geneData: geneData
                        };
                    });
                }
                break;
            case AgentType.CompoundAnalyst:
                if (data.compounds) {
                    response.items = data.compounds.map((c: any) => ({
                        id: `compound-${c.name.replace(/\s+/g, '-')}`, 
                        type: 'compound', 
                        title: c.name, 
                        summary: `Target: ${c.targetProtein || 'N/A'} | Affinity: ${c.bindingAffinity || 'N/A'}`, 
                        details: `Source: ${c.source}`
                    }));
                }
                break;
            case AgentType.KnowledgeNavigator:
            default:
                 if (data.articles) {
                    response.items = data.articles.map((a: any) => ({
                        id: `article-${a.title.slice(0, 20).replace(/\s+/g, '-')}`, type: 'article', title: a.title, summary: a.summary, details: `Authors: ${a.authors}`
                    }));
                }
                if (data.knowledgeGraph) {
                    response.knowledgeGraph = data.knowledgeGraph;
                }
                break;
        }
        
        return response;

    } catch (error) {
        addLog(`[Parser] ERROR: Error parsing response for ${agentType}: ${error}\nRaw text: ${jsonText}`);
        return { items: [{ id: 'fallback-item', type: 'article', title: 'Raw Response', summary: jsonText, details: 'Could not parse structured data.' }] };
    }
};


export const dispatchAgent = async (
    query: string, 
    agentType: AgentType, 
    model: ModelDefinition, 
    quantization: string,
    addLog: (msg: string) => void, 
    apiKey: string | undefined,
    device: HuggingFaceDevice,
    searchSources: SearchDataSource[],
    setProgress?: (msg: string) => void,
    trendContext?: TrendData,
    ragContext?: RAGContext,
): Promise<AgentResponse> => {
    
    addLog(`[dispatchAgent] Starting... Agent: ${agentType}, Model: ${model.name}, Query: "${query}"`);

    try {
        let jsonText: string;
        let uniqueSources: GroundingSource[] = [];
        let searchContext = '';

        const isGoogleModel = model.provider === ModelProvider.GoogleAI;
        const needsSearch = agentType !== AgentType.QuestCrafter;

        if (!isGoogleModel && needsSearch) {
            addLog(`[Search] Local model detected (${model.provider}). Initiating federated search for context...`);
            if (setProgress) setProgress('Performing search for context...');
            try {
                const searchResults = await performFederatedSearch(query, searchSources, addLog);
                if (searchResults.length > 0) {
                    searchContext = searchResults.map((r, i) => `[CONTEXT ${i+1} from ${r.source}]\nURL: ${r.link}\nTITLE: ${r.title}\nCONTENT: ${r.snippet}`).join('\n\n');
                    uniqueSources = searchResults.map(r => ({ uri: r.link, title: r.title }));
                    addLog(`[Search] Federated search successful. Provided ${searchResults.length} results to the model as context.`);
                } else {
                    addLog(`[Search] ERROR: Federated search returned no results. Aborting agent dispatch to prevent hallucination.`);
                    throw new Error("Federated search returned no results. Agent dispatch aborted for data reliability.");
                }
            } catch (searchError) {
                const message = searchError instanceof Error ? searchError.message : String(searchError);
                addLog(`[Search] ERROR: Federated search failed. Aborting agent dispatch. Error: ${message}`);
                throw new Error(`Federated search failed, cannot proceed with local model. Error: ${message}`);
            }
        } else if (isGoogleModel && needsSearch) {
            addLog(`[Search] Google AI model detected. Skipping local search, will use Google Search grounding.`);
        }
        
        const { systemInstruction, userPrompt, responseSchema } = buildAgentPrompts(query, agentType, searchContext, model.provider, trendContext, ragContext);

        let finalSystemInstruction = systemInstruction;
        if (!isGoogleModel && !searchContext && needsSearch) {
            const antiHallucinationPrompt = `\n\nIMPORTANT INSTRUCTION: You have been provided with NO search results for this query. You MUST answer using only your pre-existing knowledge. DO NOT invent or hallucinate any facts, articles, search results, or web links. For the "articles" field in your JSON response, you MUST return an empty array.`;
            finalSystemInstruction += antiHallucinationPrompt;
            addLog(`[dispatchAgent] Added anti-hallucination instructions for local model due to empty search results.`);
        }

        if (model.provider === ModelProvider.HuggingFace) {
            const rawText = await generateTextWithHuggingFace(model.id, finalSystemInstruction, userPrompt, quantization, device, addLog, setProgress);
            jsonText = parseJsonFromText(rawText, addLog);
        
        } else if (model.provider === ModelProvider.Ollama) {
            if (setProgress) setProgress('Querying local Ollama model...');
            const rawText = await callOllamaAPI(model.id, finalSystemInstruction, userPrompt, true, addLog);
            jsonText = parseJsonFromText(rawText, addLog);
        
        } else { // Google AI provider
            addLog(`[GoogleAI] Using Google AI model '${model.id}'...`);
            if (setProgress) setProgress('Querying Google AI...');
            const key = (apiKey || process.env.API_KEY)?.trim();
            if (!key) {
                addLog(`[GoogleAI] ERROR: API_KEY is not set.`);
                throw new Error("API Key for Google AI is not provided. Please enter your key in the control panel.");
            }
            const ai = new GoogleGenAI({ apiKey: key });
            
            addLog(`[GoogleAI] Calling model '${model.id}'...`);
            const response = await ai.models.generateContent({
                model: model.id,
                contents: userPrompt,
                config: {
                    systemInstruction: finalSystemInstruction,
                    tools: needsSearch ? [{ googleSearch: {} }] : undefined,
                    responseMimeType: responseSchema ? 'application/json' : undefined,
                    responseSchema: responseSchema,
                },
            });
            
            if (!response || !response.text || typeof response.text !== 'string' || response.text.trim() === '') {
                const candidate = response?.candidates?.[0];
                const finishReason = candidate?.finishReason;
                const safetyRatings = candidate?.safetyRatings;
                let errorMessage;

                if (finishReason === 'SAFETY') {
                    errorMessage = `The response was blocked due to safety concerns. Please modify your query. Safety Ratings: ${JSON.stringify(safetyRatings, null, 2)}`;
                } else {
                    errorMessage = `Google AI response was empty or invalid. Finish Reason: ${finishReason || 'N/A'}.`;
                }
                
                addLog(`[GoogleAI] ERROR: ${errorMessage}`);
                addLog(`[GoogleAI] Full response object: ${JSON.stringify(response, null, 2)}`);
                throw new Error(errorMessage);
            }

            const rawText = response.text;
            addLog(`[GoogleAI] Received valid response. Length: ${rawText.length}. Attempting to parse JSON.`);
            jsonText = parseJsonFromText(rawText, addLog);
            
            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
                const webSources: GroundingSource[] = groundingMetadata.groundingChunks
                    .map(chunk => chunk.web)
                    .filter((web): web is { uri: string; title?: string } => !!web?.uri)
                    .map(web => ({
                        uri: web.uri,
                        title: web.title || web.uri, // Fallback title
                    }));
                uniqueSources.push(...webSources);
                addLog(`[GoogleAI] Extracted ${webSources.length} web sources from grounding metadata.`);
            }
        }

        const finalAgentResponse = parseAgentResponse(jsonText, agentType, addLog);
        finalAgentResponse.sources = uniqueSources;
        addLog(`[dispatchAgent] Finished successfully. Returning ${finalAgentResponse.items?.length || 0} items.`);
        return finalAgentResponse;

    } catch (e) {
        const message = e instanceof Error ? e.message : 'An unknown error occurred';
        addLog(`[dispatchAgent] FATAL ERROR: ${message}`);
        throw e;
    }
};

export const synthesizeFindings = async (
    topic: string,
    items: WorkspaceItem[],
    model: ModelDefinition,
    quantization: string,
    addLog: (msg: string) => void,
    apiKey: string | undefined,
    device: HuggingFaceDevice
): Promise<string> => {
    addLog(`[Synthesize] Starting synthesis for topic: "${topic}" with ${items.length} items.`);

    const context = items.map((item, index) =>
        `Item ${index + 1} (${item.type}):\nTitle: ${item.title}\nSummary: ${item.summary}\nDetails: ${item.details}`
    ).join('\n\n---\n\n');

    const systemInstruction = `You are an expert research analyst and futurist. Your task is to synthesize information from a collection of research items and formulate a novel, testable hypothesis.`;
    const userPrompt = `Based on the following research items about "${topic}", provide a concise, insightful synthesis of the key findings. Conclude with a single, clear, and testable hypothesis for the next phase of research. Format your response with clear headings (e.g., **Synthesis** and **Hypothesis**).\n\n<RESEARCH_ITEMS>\n${context}\n</RESEARCH_ITEMS>`;

    if (model.provider === ModelProvider.HuggingFace) {
        return generateTextWithHuggingFace(model.id, systemInstruction, userPrompt, quantization, device, addLog);
    }

    if (model.provider === ModelProvider.Ollama) {
        return callOllamaAPI(model.id, systemInstruction, userPrompt, false, addLog);
    }

    // Google AI
    const key = (apiKey || process.env.API_KEY)?.trim();
    if (!key) throw new Error("API Key for Google AI is not provided.");

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
        model: model.id,
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    if (!response.text) {
        throw new Error("Synthesis failed: Google AI returned an empty response.");
    }
    return response.text;
};

export const callAscensionOracle = async (
    odysseyState: OdysseyState,
    workspace: WorkspaceState,
    trajectoryState: TrajectoryState | null,
    model: ModelDefinition,
    apiKey: string | undefined,
    addLog: (msg: string) => void
): Promise<RealmDefinition> => {
    addLog("[Oracle] Calling the Ascension Oracle to define the next realm...");

    const systemInstruction = `You are the Ascension Oracle, a metaphysical AI that perceives the next stage of human evolution. Your task is to define the next "Realm" for a user on their journey of radical life extension. You must respond with a single, valid JSON object that strictly adheres to the provided schema and nothing else.`;

    const userContext = `
    The user has reached the final known frontier. Here is a snapshot of their progress:
    - Current Realm: ${odysseyState.realm}
    - Ascension Vectors: Genetic ${odysseyState.vectors.genetic}, Memic ${odysseyState.vectors.memic}, Cognitive ${odysseyState.vectors.cognitive}
    - Key Research Topic: "${workspace.topic}"
    - Latest Synthesis: "${workspace.synthesis?.substring(0, 500)}..."
    - Biological State: ${trajectoryState?.isRadicalInterventionActive ? 'Radical intervention active.' : `Biological age is ~${trajectoryState?.overallScore.projection[0].value.toFixed(0)}.`}

    Based on this data, define the *next logical Realm*. It must be more advanced than '${odysseyState.realm}'.
    The Realm name should be evocative and unique.
    The description should be profound.
    The criteria must be challenging, futuristic, and follow logically from their current progress.
    The vector thresholds must be significantly higher than their current values.
    `;

    const realmSchema = {
        type: Type.OBJECT,
        properties: {
            realm: { type: Type.STRING, description: "The name of the new realm." },
            description: { type: Type.STRING, description: "A profound description of this state of being." },
            criteria: {
                type: Type.ARRAY,
                description: "Three challenging, futuristic criteria to achieve this realm.",
                items: { type: Type.STRING }
            },
            thresholds: {
                type: Type.OBJECT,
                properties: {
                    cognitive: { type: Type.NUMBER, description: "The required cognitive vector score." },
                    genetic: { type: Type.NUMBER, description: "The required genetic vector score." },
                    memic: { type: Type.NUMBER, description: "The required memic vector score." }
                }
            }
        },
        required: ["realm", "description", "criteria", "thresholds"]
    };

    const key = (apiKey || process.env.API_KEY)?.trim();
    if (!key) throw new Error("API Key for Google AI is not provided for the Ascension Oracle.");

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
        model: model.id,
        contents: userContext,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: realmSchema as any // Cast to any to bypass strict internal schema type
        }
    });

    if (!response.text) {
        throw new Error("The Ascension Oracle remained silent (empty response).");
    }

    try {
        const newRealm = JSON.parse(response.text);
        // Basic validation
        if (newRealm.realm && newRealm.description && newRealm.criteria?.length >= 1 && newRealm.thresholds) {
            addLog(`[Oracle] The Oracle has spoken. The new realm is: ${newRealm.realm}`);
            return newRealm;
        } else {
            throw new Error(`Oracle response has an invalid structure: ${JSON.stringify(newRealm)}`);
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown parsing error";
        addLog(`[Oracle] ERROR: Failed to parse the Oracle's response. ${message}. Raw: ${response.text}`);
        throw new Error(`The Ascension Oracle's message was incomprehensible: ${message}`);
    }
};