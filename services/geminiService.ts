import { GoogleGenAI, Type } from "@google/genai";
import { 
    type AgentResponse, type WorkspaceItem, type GroundingSource, type KnowledgeGraph, 
    type ModelDefinition, ModelProvider, AgentType, HuggingFaceDevice, SearchDataSource, 
    type OdysseyState, type TrajectoryState, type WorkspaceState, type RealmDefinition 
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

const buildAgentPrompts = (query: string, agentType: AgentType, searchContext?: string, provider?: ModelProvider): { systemInstruction: string; userPrompt: string; responseSchema?: any } => {
    const jsonOutputInstruction = "You MUST output your findings as a single, valid JSON object and NOTHING ELSE. Do not include any explanatory text, markdown formatting, or any other characters outside of the main JSON object.";
    
    const contextPreamble = searchContext 
        ? `Based *only* on the following search results from various scientific databases and the web, fulfill the user's request.\n\n<SEARCH_RESULTS>\n${searchContext}\n</SEARCH_RESULTS>\n\n`
        : '';

    const isLocalModel = provider === ModelProvider.Ollama || provider === ModelProvider.HuggingFace;

    switch (agentType) {
        case AgentType.TrendSpotter: {
            let userPrompt = `${contextPreamble}Analyze the research landscape around "${query}" to identify the top 3-5 emerging, high-potential trends. For each trend, provide a name, a summary, a justification for its high potential, and score its novelty, velocity, and potential impact on a scale of 0-100.

Also, construct a knowledge graph. This graph should contain a central 'Topic' node representing "${query}". For each trend you identify, create a 'Process' node (e.g. for "Targeting Glial-Specific Autophagy"). The 'id' for trend nodes should be a slug-cased version of the trend name. Connect each trend node to the central topic node with a "is a trend in" edge.

Your response MUST be a JSON object with two top-level keys: "trends" and "knowledgeGraph".`;

            if (isLocalModel) {
                 // Simplify for smaller models
                userPrompt = `${contextPreamble}Analyze the research landscape around "${query}" to identify the top 3 emerging, high-potential trends. For each trend, provide a name, a summary, a justification for its high potential, and score its novelty, velocity, and potential impact on a scale of 0-100.

Your response MUST be a JSON object with a single top-level key: "trends". Do not include a "knowledgeGraph".`;
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
  ]
}`;
            }

            return {
                systemInstruction: `You are a 'Singularity Detector' AI, a world-class research analyst specializing in identifying exponentially growing and radically transformative trends in longevity science. Your task is to analyze scientific literature, patents, and pre-prints to find the 'next big thing'. ${jsonOutputInstruction}`,
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
            let userPrompt = `${contextPreamble}For the research topic "${query}", identify the top 5 most relevant genes discussed in the provided text. Respond with a JSON object with a single key 'genes'. This key should contain an array of objects, where each object has "symbol" (string), "name" (string), and "summary" (string).`;
            if (isLocalModel) {
                userPrompt += `\n\nYour response MUST follow this exact JSON structure:\n{\n  "genes": [\n    {\n      "symbol": "FOXO3",\n      "name": "Forkhead box protein O3",\n      "summary": "A transcription factor involved in stress resistance and longevity."\n    }\n  ]\n}`;
            }
            return {
                systemInstruction: `You are an AI agent specializing in bioinformatics (OpenGenes AI). Your task is to extract genes related to a query. ${jsonOutputInstruction}`,
                userPrompt: userPrompt,
                responseSchema: {
                    type: Type.OBJECT, properties: { genes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { symbol: { type: Type.STRING }, name: { type: Type.STRING }, summary: { type: Type.STRING } } } } }
                }
            };
        }
        case AgentType.CompoundAnalyst: {
            let userPrompt = `${contextPreamble}For the research topic "${query}", find the top 5 compounds mentioned in the provided text. Respond with a JSON object with a single key 'compounds'. This key should contain an array of objects, where each object has "name" (string), "mechanism" (string), and "source" (string, e.g., patent number or publication).`;
             if (isLocalModel) {
                userPrompt += `\n\nYour response MUST follow this exact JSON structure:\n{\n  "compounds": [\n    {\n      "name": "Metformin",\n      "mechanism": "Improves insulin sensitivity and mitochondrial function.",\n      "source": "Various studies"\n    }\n  ]\n}`;
            }
            return {
                systemInstruction: `You are an AI agent specializing in pharmacology and patent analysis. Your task is to extract compounds related to a query. ${jsonOutputInstruction}`,
                userPrompt: userPrompt,
                responseSchema: {
                     type: Type.OBJECT, properties: { compounds: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, mechanism: { type: Type.STRING }, source: { type: Type.STRING } } } } }
                }
            };
        }
        case AgentType.KnowledgeNavigator:
        default: {
            let userPrompt = `${contextPreamble}Analyze the topic: "${query}". Respond with a JSON object containing two keys: "articles" and "knowledgeGraph". 
- "articles" should be an array of the top 3 most relevant scientific articles based on the search results, where each article object has "title", "summary", and "authors" (string of authors, infer if not present). If no relevant articles are found, this MUST be an empty array.
- "knowledgeGraph" should be an object with "nodes" (array of {id, label, type}) and "edges" (array of {source, target, label}). Create a rich, interconnected graph. Create a central node of type 'Topic' for the main query "${query}". Then, add nodes for key Genes, Compounds, and Processes found in the text. Connect these nodes to the central Topic node and to each other with descriptive labels (e.g., 'regulates', 'inhibits', 'implicated_in').`;
            
            if (isLocalModel) {
                // Simplify for smaller models
                userPrompt = `${contextPreamble}Analyze the topic: "${query}". Respond with a JSON object containing one key: "articles".
- "articles" should be an array of the top 3 most relevant scientific articles based on the search results, where each article object has "title", "summary", and "authors" (string of authors, infer if not present). If no relevant articles are found, this MUST be an empty array.
Do not include a "knowledgeGraph".`;
                const jsonStructureExample = `

Your response MUST follow this exact JSON structure:
{
  "articles": [
    {
      "title": "Title of Article 1",
      "summary": "A concise summary of the article's key findings from the provided text.",
      "authors": "Author A, Author B, et al."
    }
  ]
}`;
                userPrompt += jsonStructureExample;
            }

            return {
                systemInstruction: `You are a world-class bioinformatics research assistant (Longevity Knowledge Navigator). Your task is to summarize articles and build a rich, interconnected knowledge graph from the provided text. ${jsonOutputInstruction}`,
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
        let items: WorkspaceItem[] = [];
        let knowledgeGraph: KnowledgeGraph | null = null;

        switch (agentType) {
            case AgentType.TrendSpotter:
                if (data.trends) {
                    items = data.trends.map((t: any) => {
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
                            }
                        };
                    });
                }
                if (data.knowledgeGraph) {
                    knowledgeGraph = data.knowledgeGraph;
                }
                break;
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
): Promise<AgentResponse> => {
    
    addLog(`[dispatchAgent] Starting... Agent: ${agentType}, Model: ${model.name}, Query: "${query}"`);

    try {
        let jsonText: string;
        let uniqueSources: GroundingSource[] = [];
        let searchContext = '';

        const isGoogleModel = model.provider === ModelProvider.GoogleAI;

        if (!isGoogleModel) {
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
        } else {
            addLog(`[Search] Google AI model detected. Skipping local search, will use Google Search grounding.`);
        }
        
        const { systemInstruction, userPrompt } = buildAgentPrompts(query, agentType, searchContext, model.provider);

        let finalSystemInstruction = systemInstruction;
        if (!isGoogleModel && !searchContext) {
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
            addLog(`[GoogleAI] Using Google AI model '${model.id}' with Google Search grounding.`);
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
                    tools: [{ googleSearch: {} }],
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
            const webSources: GroundingSource[] = groundingMetadata?.groundingChunks?.map(chunk => chunk.web).filter((web): web is { uri: string; title?: string } => !!web?.uri).map(web => ({ uri: web.uri, title: web.title || web.uri })) ?? [];
            uniqueSources = Array.from(new Map(webSources.map(item => [item.uri, item])).values());
            addLog(`[GoogleAI] Extracted ${uniqueSources.length} unique web sources from grounding metadata.`);
        }

        if (setProgress) setProgress('Parsing results...');
        const agentResponse = parseAgentResponse(jsonText, agentType, addLog);
        agentResponse.sources = [...(agentResponse.sources || []), ...uniqueSources];
        return agentResponse;

    } catch (error) {
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) errorMessage = error.message;
        addLog(`[dispatchAgent] FATAL ERROR for ${agentType}: ${errorMessage}`);
        throw new Error(`Failed to get data from AI Agent: ${errorMessage}`);
    }
};

export const synthesizeFindings = async (
    query: string, 
    items: WorkspaceItem[], 
    model: ModelDefinition, 
    quantization: string,
    addLog: (msg: string) => void, 
    apiKey?: string,
    device: HuggingFaceDevice = 'wasm'
): Promise<string> => {
    const resultsText = items.map(i => `Type: ${i.type}\nTitle: ${i.title}\nSummary: ${i.summary}`).join('\n---\n');
    addLog(`[Synthesize] Starting synthesis for "${query}" with ${items.length} items using model ${model.id}.`);
    const systemInstruction = `You are a world-class bioinformatics and longevity research scientist. Your task is to analyze a collection of data (articles, genes, compounds) and provide a high-level synthesis and a novel hypothesis. The output must be well-structured, clear, and scientifically plausible. Use Markdown for formatting: use **bold** for headings and use bullet points for lists (e.g., '* item').`;
    const userPrompt = `Based on the original research topic "${query}" and the following data, provide two sections:\n\n1.  **Synthesis**: A concise synthesis of the key findings, connecting the different data types (genes, compounds, etc.).\n2.  **Novel Hypothesis**: A novel, testable research hypothesis that connects these findings or proposes a corrective action for the "incorrect development" represented by the topic.\n\nHere is the collected data:\n${resultsText}`;

    try {
        if (model.provider === ModelProvider.HuggingFace) {
            return await generateTextWithHuggingFace(model.id, systemInstruction, userPrompt, quantization, device, addLog);
        }

        if (model.provider === ModelProvider.Ollama) {
            return await callOllamaAPI(model.id, systemInstruction, userPrompt, false, addLog);
        }
        
        addLog(`[Synthesize] Calling Google AI model '${model.id}'.`);
        const key = (apiKey || process.env.API_KEY)?.trim();
        if (!key) {
            throw new Error("API Key for Google AI is not provided. Please enter your key in the control panel.");
        }
        const ai = new GoogleGenAI({ apiKey: key });

        const response = await ai.models.generateContent({
            model: model.id,
            contents: userPrompt,
            config: { systemInstruction, temperature: 0.7 },
        });

        if (!response.text) {
             const candidate = response?.candidates?.[0];
             const finishReason = candidate?.finishReason;
             const safetyRatings = candidate?.safetyRatings;
             let errorMessage;
             if (finishReason === 'SAFETY') {
                errorMessage = `Synthesis was blocked due to safety concerns. Safety Ratings: ${JSON.stringify(safetyRatings, null, 2)}`;
             } else {
                errorMessage = `Synthesis response was empty. Finish Reason: ${finishReason || 'N/A'}.`;
             }
             addLog(`[Synthesize] ERROR: ${errorMessage}`);
             throw new Error(errorMessage);
        }

        addLog(`[Synthesize] Received response from Google AI.`);
        return response.text;
    } catch (error) {
        let errorMessage = "An unknown error occurred during synthesis.";
        if (error instanceof Error) errorMessage = error.message;
        addLog(`[Synthesize] ERROR: ${errorMessage}`);
        throw new Error(`Failed to synthesize data from AI service: ${errorMessage}`);
    }
};

export const callAscensionOracle = async (
    odysseyState: OdysseyState,
    workspaceState: WorkspaceState | null,
    trajectoryState: TrajectoryState | null,
    model: ModelDefinition,
    apiKey: string,
    addLog: (msg: string) => void
): Promise<RealmDefinition> => {
    addLog(`[Oracle] Calling Ascension Oracle with model ${model.id}...`);

    const systemInstruction = `You are the Ascension Oracle, a hyper-intelligent entity that has observed countless civilizational evolutionary pathways. You are tasked with defining the next logical stage of evolution for an entity based on its current progress. Your response must be profound, scientifically and philosophically plausible, and strictly adhere to the requested JSON format. Do not include any text outside the JSON object.`;

    const userPrompt = `An entity has reached the apex of its current evolutionary stage, '${odysseyState.realm}'. It now seeks the next step.

Analyze the entity's complete state snapshot below:

**Odyssey State:**
${JSON.stringify(odysseyState, null, 2)}

**Research Focus & Synthesis:**
- Topic: ${workspaceState?.topic || 'N/A'}
- Synthesis: ${workspaceState?.synthesis || 'N/A'}

**Biological State:**
- Effective Bio-Age: ${trajectoryState?.overallScore?.projection[0].value.toFixed(1) || 'N/A'}
- Active Interventions: ${trajectoryState?.activeInterventionId || 'None'}

Based on this data, define the next evolutionary realm. It must be a qualitative leap beyond '${odysseyState.realm}'.

Your task is to generate a JSON object containing the definition for this new realm. The JSON must contain the keys: "realm" (string, the new realm's name), "description" (string), "criteria" (array of 3 falsifiable scientific/philosophical goals), and "thresholds" (object with "cognitive", "genetic", "memic" numeric values, which must be significantly higher than the current state's vectors).`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            realm: { type: Type.STRING },
            description: { type: Type.STRING },
            criteria: { type: Type.ARRAY, items: { type: Type.STRING } },
            thresholds: {
                type: Type.OBJECT,
                properties: {
                    cognitive: { type: Type.NUMBER },
                    genetic: { type: Type.NUMBER },
                    memic: { type: Type.NUMBER },
                },
                required: ["cognitive", "genetic", "memic"]
            }
        },
        required: ["realm", "description", "criteria", "thresholds"]
    };

    try {
        const key = (apiKey || process.env.API_KEY)?.trim();
        if (!key) {
            throw new Error("API Key for Google AI is not provided for the Ascension Oracle.");
        }
        const ai = new GoogleGenAI({ apiKey: key });

        const response = await ai.models.generateContent({
            model: model.id,
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema
            }
        });

        if (!response.text) {
             throw new Error("Ascension Oracle returned an empty response.");
        }
        
        const jsonText = parseJsonFromText(response.text, addLog);
        const newRealmDef = JSON.parse(jsonText) as RealmDefinition;

        addLog(`[Oracle] Success! The Oracle has defined the new realm of: ${newRealmDef.realm}`);
        return newRealmDef;

    } catch(e) {
        const message = e instanceof Error ? e.message : 'An unknown error occurred.';
        addLog(`[Oracle] ERROR: The Ascension Oracle failed to respond. ${message}`);
        throw new Error(`The Ascension Oracle failed: ${message}`);
    }
};
