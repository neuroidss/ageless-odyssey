import { Type } from "@google/genai";
import { AgentType, ModelProvider, type TrendData, type RAGContext, type OdysseyState, type WorkspaceState, type TrajectoryState } from '../types';

interface OracleContext {
    odysseyState: OdysseyState;
    workspace: WorkspaceState;
    trajectoryState: TrajectoryState | null;
}

export const buildAgentPrompts = (
    query: string,
    agentType: AgentType | 'AscensionOracle',
    searchContext?: string,
    provider?: ModelProvider,
    trendContext?: TrendData,
    ragContext?: RAGContext,
    oracleContext?: OracleContext
): { systemInstruction: string; userPrompt: string; responseSchema?: any } => {
    const jsonOutputInstruction = "You MUST output your findings as a single, valid JSON object and NOTHING ELSE. Do not include any explanatory text, markdown formatting, or any other characters outside of the main JSON object.";
    
    const ragContextPreamble = ragContext
        ? `First, consider the following historical context from your previous work. This is your memory. Use it to inform your response, avoid redundant work, and build upon past discoveries.\n\n<PAST_WORK_CONTEXT>\n${ragContext.context}\n</PAST_WORK_CONTEXT>\n\n`
        : '';

    const contextPreamble = searchContext 
        ? `Based *only* on the following search results from various scientific databases and the web, fulfill the user's request.\n\n<SEARCH_RESULTS>\n${searchContext}\n</SEARCH_RESULTS>\n\n`
        : '';

    const isLocalModel = provider === ModelProvider.Ollama || provider === ModelProvider.HuggingFace;
    const querySlug = query.replace(/\s+/g, '-').toLowerCase();

    switch (agentType) {
        case AgentType.Strategist: {
            // The `query` for a strategist is the specific problem/stage description
             const userPrompt = `I am facing the following complex R&D challenge:\n"${query}"\n\nAnalyze this problem and propose three distinct, viable, and concrete pathways to solve it. For each pathway, provide a name, a detailed description of the approach, key pros, and key cons.`;
             return {
                systemInstruction: `You are a world-class R&D strategist with deep expertise in biotechnology and project management. Your task is to break down a complex problem into actionable, alternative strategies. ${jsonOutputInstruction}`,
                userPrompt,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pathways: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    pros: { type: Type.ARRAY, items: {type: Type.STRING} },
                                    cons: { type: Type.ARRAY, items: {type: Type.STRING} },
                                }
                            }
                        }
                    }
                }
             };
        }
        case 'AscensionOracle': {
            if (!oracleContext) throw new Error("Oracle context is required for AscensionOracle agent.");
            const { odysseyState, workspace, trajectoryState } = oracleContext;
            const userPrompt = `
The user has reached the final known frontier. Here is a snapshot of their progress:
- Current Realm: ${odysseyState.realm}
- Ascension Vectors: Genetic ${odysseyState.vectors.genetic}, Memic ${odysseyState.vectors.memic}, Cognitive ${odysseyState.vectors.cognitive}
- Key Research Topic: "${workspace.topic}"
- Latest Synthesis: "${workspace.synthesis?.substring(0, 500)}..."
- Biological State: ${trajectoryState?.isRadicalInterventionActive ? 'Radical intervention active.' : `Biological age is ~${trajectoryState?.overallScore.projection[0].value.toFixed(0)}.`}

Based on this data, define the *next logical Realm*. It must be more advanced than '${odysseyState.realm}'.
The Realm name should be evocative and unique. The description should be profound.
The criteria must be challenging, futuristic, and follow logically from their current progress.
The vector thresholds must be significantly higher than their current values.
`;
            return {
                systemInstruction: `You are the Ascension Oracle, a metaphysical AI that perceives the next stage of human evolution. Your task is to define the next "Realm" for a user on their journey of radical life extension. ${jsonOutputInstruction}`,
                userPrompt,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        realm: { type: Type.STRING },
                        description: { type: Type.STRING },
                        criteria: { type: Type.ARRAY, items: { type: Type.STRING } },
                        thresholds: {
                            type: Type.OBJECT, properties: {
                                cognitive: { type: Type.NUMBER },
                                genetic: { type: Type.NUMBER },
                                memic: { type: Type.NUMBER }
                            }
                        }
                    },
                    required: ["realm", "description", "criteria", "thresholds"]
                }
            };
        }
        case AgentType.QuestCrafter: {
            const trendDetails = trendContext ? `- Name: ${query}\n- Summary: ${trendContext.justification}\n- Novelty/Velocity/Impact: ${trendContext.novelty}/${trendContext.velocity}/${trendContext.impact}` : `A trend related to "${query}"`;
            let userPrompt = `Based on this emerging scientific trend, design a new research quest.\nThe quest should be a challenging but concrete next step for a researcher.\n${trendDetails}\n\nGenerate a JSON object with a single key "newQuest" containing the required fields.`;
            return {
                systemInstruction: `${ragContextPreamble}You are the Quest Forger, an AI that transforms cutting-edge scientific trends into actionable research objectives. Your task is to create a well-defined quest in a specific JSON format. ${jsonOutputInstruction}`,
                userPrompt,
                responseSchema: { type: Type.OBJECT, properties: { newQuest: {
                    type: Type.OBJECT, properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        objective: { type: Type.OBJECT, properties: { agent: { type: Type.STRING, enum: Object.values(AgentType) }, topicKeywords: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                        reward: { type: Type.OBJECT, properties: { xp: { type: Type.NUMBER }, memic: { type: Type.NUMBER }, genetic: { type: Type.NUMBER } } },
                        citations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, url: { type: Type.STRING } } } }
                    }
                }}}
            };
        }
        case AgentType.TrendSpotter: {
            let userPrompt = `${contextPreamble}Analyze the research landscape around "${query}" to identify the top 3-5 emerging, high-potential trends. For each trend, provide a name, a summary, a justification for its high potential, and score its novelty, velocity, and potential impact on a scale of 0-100.\n\nAlso, construct a knowledge graph. This graph should contain a central 'Topic' node representing "${query}". For each trend, create a 'Process' node (e.g., "Targeting Glial-Specific Autophagy"). Connect each trend node to the central topic node with a "is a trend in" edge.\n\nYour response MUST be a JSON object with "trends" and "knowledgeGraph" keys.`;
            return {
                systemInstruction: `${ragContextPreamble}You are a 'Singularity Detector' AI, a world-class research analyst specializing in identifying exponentially growing trends in longevity science. ${jsonOutputInstruction}`,
                userPrompt,
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        trends: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, summary: { type: Type.STRING }, justification: { type: Type.STRING }, novelty: { type: Type.NUMBER }, velocity: { type: Type.NUMBER }, impact: { type: Type.NUMBER } } } },
                        knowledgeGraph: { type: Type.OBJECT, properties: { nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, label: { type: Type.STRING }, type: { type: Type.STRING } } } }, edges: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING }, label: { type: Type.STRING } } } } } }
                    }
                }
            };
        }
        case AgentType.GeneAnalyst: {
            let userPrompt = `${contextPreamble}For the research topic "${query}", analyze the provided search results from the OpenGenes database. Identify the top 5 most relevant genes. For each gene, extract its symbol, full name (from 'title'), summary (from 'snippet'), organism, lifespan effect, and intervention type from the 'CONTENT' of each context block. The 'function' should be 'Longevity Activator' if the snippet contains 'pro-longevity', 'Longevity Inhibitor' if it contains 'anti-longevity', and 'Context-Dependent' otherwise. Combine 'Effect' and lifespan change percentage into 'lifespanEffect'.`;
            return {
                systemInstruction: `${ragContextPreamble}You are a precise data extraction AI. Your task is to analyze structured text from the OpenGenes database and convert it into a specific JSON format. ${jsonOutputInstruction}`,
                userPrompt,
                responseSchema: { type: Type.OBJECT, properties: { genes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { symbol: { type: Type.STRING }, name: { type: Type.STRING }, summary: { type: Type.STRING }, function: { type: Type.STRING }, lifespanEffect: { type: Type.STRING }, organism: { type: Type.STRING }, intervention: { type: Type.STRING } } } } } }
            };
        }
        case AgentType.CompoundAnalyst: {
             let userPrompt = `${contextPreamble}For the research topic "${query}", analyze the provided patent data to find the top 5 chemical compounds. For each, extract its "name", primary "targetProtein", "bindingAffinity" (e.g., "IC50 = 10 nM"), and "source" patent number from the URL.`;
            return {
                systemInstruction: `${ragContextPreamble}You are an AI specializing in pharmacology and patent analysis. You extract therapeutic compounds, their targets, and binding affinities from patent abstracts. ${jsonOutputInstruction}`,
                userPrompt,
                responseSchema: { type: Type.OBJECT, properties: { compounds: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, targetProtein: { type: Type.STRING }, bindingAffinity: { type: Type.STRING }, source: { type: Type.STRING } } } } } }
            };
        }
        case AgentType.KnowledgeNavigator:
        default: {
            let userPrompt = `${contextPreamble}Analyze the topic: "${query}". Your response MUST be a single JSON object with two keys: "articles" and "knowledgeGraph".
- **articles**: An array of the top 3-5 most relevant scientific articles. If none are found, this MUST be an empty array.
- **knowledgeGraph**: A rich, interconnected graph. It is CRITICAL that you create meaningful edges between nodes. A graph without edges is incomplete and fails the task.
  1. Create a central 'Topic' node for "${query}".
  2. Add 'Gene', 'Compound', and 'Process' nodes for key entities from the text.
  3. **MOST IMPORTANTLY**: Connect these nodes with 'edges'. Every new node MUST be connected to at least one other node. For example, connect a Gene node to the Topic node with a 'related to' edge, or a Compound to a Gene with an 'inhibits' edge.

Example JSON structure:
{
  "articles": [
    { "title": "...", "summary": "...", "authors": "..." }
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
            return {
                systemInstruction: `${ragContextPreamble}You are a world-class bioinformatics research assistant. Your task is to summarize articles and build a rich, interconnected knowledge graph from provided text. ${jsonOutputInstruction}`,
                userPrompt,
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
    }
};
