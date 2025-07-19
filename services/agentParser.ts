import { type AgentResponse, type WorkspaceItem, AgentType, GeneData } from '../types';

export const parseJsonFromText = (text: string, addLog: (msg: string) => void): string => {
    let cleanedText = text;

    // Remove <think>...</think> blocks that some models (like Qwen) might output.
    const thinkTagRegex = /<think>[\s\S]*?<\/think>/gi;
    if (thinkTagRegex.test(cleanedText)) {
        const originalLength = cleanedText.length;
        cleanedText = cleanedText.replace(thinkTagRegex, '').trim();
        addLog(`[Parser] Removed <think> tags from the response. New length: ${cleanedText.length} (was ${originalLength})`);
    }
    
    const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        addLog('[Parser] Extracted JSON from markdown code block.');
        return jsonMatch[1];
    }
    
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        addLog('[Parser] Extracted JSON by finding curly braces.');
        return cleanedText.substring(firstBrace, lastBrace + 1);
    }
    
    addLog(`[Parser] WARN: Could not find any JSON-like structures in the response. Using raw text, which will likely fail parsing.`);
    return cleanedText;
};

export const parseAgentResponse = (jsonText: string, agentType: AgentType, addLog: (msg: string) => void): AgentResponse => {
    try {
        const data = JSON.parse(jsonText);
        addLog(`[Parser] Successfully parsed JSON for ${agentType}.`);
        const response: AgentResponse = {};

        switch (agentType) {
            case AgentType.QuestCrafter:
                if (data.newQuest) response.newQuest = data.newQuest;
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
                            trendData: { novelty, velocity, impact, justification: t.justification },
                            questForged: false,
                        };
                    });
                }
                if (data.knowledgeGraph) response.knowledgeGraph = data.knowledgeGraph;
                break;
            case AgentType.GeneAnalyst:
                if (data.genes) {
                    response.items = data.genes.map((g: any) => ({
                        id: `gene-${g.symbol}`, 
                        type: 'gene', 
                        title: g.symbol, 
                        summary: g.summary, 
                        details: g.name,
                        geneData: {
                            function: g.function || 'N/A',
                            organism: g.organism || 'N/A',
                            lifespanEffect: g.lifespanEffect || 'N/A',
                            intervention: g.intervention || 'N/A',
                        }
                    }));
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
                if (data.knowledgeGraph) response.knowledgeGraph = data.knowledgeGraph;
                break;
        }
        
        return response;

    } catch (error) {
        addLog(`[Parser] ERROR: Error parsing response for ${agentType}: ${error}\nRaw text: ${jsonText}`);
        return { items: [{ id: 'fallback-item', type: 'article', title: 'Raw Response', summary: jsonText, details: 'Could not parse structured data.' }] };
    }
};