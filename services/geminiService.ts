import { GoogleGenAI } from "@google/genai";
import { 
    type AgentResponse, type WorkspaceItem, type GroundingSource, 
    type ModelDefinition, ModelProvider, AgentType, HuggingFaceDevice, SearchDataSource, 
    type OdysseyState, type TrajectoryState, type WorkspaceState, type RealmDefinition, TrendData, RAGContext 
} from '../types';
import { performFederatedSearch } from './searchService';
import { generateTextWithHuggingFace } from './huggingFaceService';
import { buildAgentPrompts } from './agentPrompts';
import { parseAgentResponse, parseJsonFromText } from './agentParser';

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
        
        return data.response || '';

    } catch (error) {
        addLog(`[Ollama] ERROR: Failed to connect to Ollama server. ${error}`);
        throw new Error("Failed to connect to local Ollama server. Is it running at http://localhost:11434?");
    }
}

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
        const isGoogleGemma = isGoogleModel && model.id.includes('gemma');

        // If the model is not a Google model OR it is a Google Gemma model, perform federated search.
        if ((!isGoogleModel || isGoogleGemma) && needsSearch) {
            const modelType = isGoogleGemma ? 'Google Gemma' : 'Local';
            addLog(`[Search] ${modelType} model detected (${model.provider}). Initiating federated search for context...`);
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
                throw new Error(`Federated search failed, cannot proceed. Error: ${message}`);
            }
        } else if (isGoogleModel && !isGoogleGemma && needsSearch) {
            addLog(`[Search] Google Gemini model detected. Skipping local search, will use Google Search grounding.`);
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
            
            const modelConfig: any = {};
            let finalUserPrompt = userPrompt;

            if (isGoogleGemma) {
                // Gemma models do not support systemInstruction or responseSchema. Prepend system instruction to user prompt.
                // The system prompt already contains the necessary "you must output JSON" instruction.
                finalUserPrompt = `${finalSystemInstruction}\n\n${userPrompt}`;
                addLog('[GoogleAI] Gemma model detected. Prepending system instruction to user prompt. Expecting JSON in text response.');
            } else { // It's a Gemini model
                modelConfig.systemInstruction = finalSystemInstruction;
                const useGoogleSearch = needsSearch; // isGoogleGemma is false here
                if (useGoogleSearch) {
                    modelConfig.tools = [{ googleSearch: {} }];
                    addLog(`[GoogleAI] Enabled Google Search tool for Gemini model.`);
                } else if (responseSchema) {
                    modelConfig.responseMimeType = 'application/json';
                    modelConfig.responseSchema = responseSchema;
                    addLog(`[GoogleAI] JSON response format enabled with schema for Gemini model.`);
                }
            }
            
            const response = await ai.models.generateContent({
                model: model.id,
                contents: finalUserPrompt,
                config: modelConfig,
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
        let finalErrorMessage: string;

        // Check for the specific Gemini API error structure from user logs
        const errorCandidate = e as any;
        if (errorCandidate?.error?.message && errorCandidate?.error?.status) {
            // New error from user log: "Developer instruction is not enabled for models/gemma-3n-e4b-it"
            finalErrorMessage = `Google AI API Error: ${errorCandidate.error.message} (Status: ${errorCandidate.error.status})`;
        }
        else if (errorCandidate?.error?.status === 'RESOURCE_EXHAUSTED' || errorCandidate?.error?.code === 429) {
            if (model.id.includes('gemma')) {
                finalErrorMessage = "Rate limit reached for Gemma model. The free tier is often limited to 1 request per minute. Please wait 60 seconds or switch to a Gemini model.";
            } else {
                finalErrorMessage = `API resource exhausted. This may be due to rate limits. Please check your usage quota. (Status: ${errorCandidate.error.status})`;
            }
        } else if (e instanceof Error) {
            finalErrorMessage = e.message;
        } else if (errorCandidate?.error?.message) {
            finalErrorMessage = `Google AI API Error: ${errorCandidate.error.message}`;
        } else {
            finalErrorMessage = 'An unknown error occurred during agent dispatch.';
            // Add raw error to log for debugging
            addLog(`[dispatchAgent] Raw unknown error: ${JSON.stringify(e)}`);
        }
        
        addLog(`[dispatchAgent] FATAL ERROR: ${finalErrorMessage}`);
        // Throw a proper Error object so the UI layer can handle it consistently.
        throw new Error(finalErrorMessage);
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

    const isGoogleGemma = model.id.includes('gemma');
    let finalUserPrompt = userPrompt;
    const modelConfig: any = {};

    if (isGoogleGemma) {
        finalUserPrompt = `${systemInstruction}\n\n${userPrompt}`;
        addLog(`[Synthesize] Using Gemma model. Combining system and user prompts.`);
    } else {
        modelConfig.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
        model: model.id,
        contents: finalUserPrompt,
        config: modelConfig,
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

    const { systemInstruction, userPrompt, responseSchema } = buildAgentPrompts(
        '', // query is not used for oracle
        'AscensionOracle' as any, // A pseudo-type for this call
        undefined, undefined, undefined, undefined, 
        { odysseyState, workspace, trajectoryState } // Pass all context here
    );


    const key = (apiKey || process.env.API_KEY)?.trim();
    if (!key) throw new Error("API Key for Google AI is not provided for the Ascension Oracle.");

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
        model: model.id,
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: responseSchema as any // Cast to any to bypass strict internal schema type
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