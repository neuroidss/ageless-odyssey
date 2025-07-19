import { WorkspaceState, AgentResponse, WorkspaceItem, KnowledgeGraph } from '../types';

export const createNextWorkspaceState = (
    currentTopic: string,
    previousState: WorkspaceState | null,
    agentResponse: AgentResponse | null
): WorkspaceState => {
    const baseWorkspace = previousState || { topic: currentTopic, items: [], sources: [], knowledgeGraph: null, synthesis: null, timestamp: 0 };

    if (!agentResponse) {
        return { ...baseWorkspace, topic: currentTopic, timestamp: Date.now() };
    }

    const newItems = (agentResponse.items ?? [])
        .filter((newItem): newItem is WorkspaceItem => !!newItem)
        .filter((newItem: WorkspaceItem) => 
            !(baseWorkspace.items || []).some(existing => existing.id === newItem.id)
        );

    const newSources = (agentResponse.sources ?? [])
        .filter(newSrc => !!newSrc?.uri)
        .filter(newSrc => 
            !(baseWorkspace.sources || []).some(existing => existing.uri === newSrc.uri)
        );
    
    let newGraph: KnowledgeGraph | null = baseWorkspace.knowledgeGraph;
    if (agentResponse.knowledgeGraph) {
        const existingNodes = baseWorkspace.knowledgeGraph?.nodes || [];
        const existingEdges = baseWorkspace.knowledgeGraph?.edges || [];
        const existingNodeIds = new Set(existingNodes.map(n => n.id));
        
        const newNodes = (agentResponse.knowledgeGraph.nodes || []).filter(n => n && !existingNodeIds.has(n.id));
        
        const existingEdgeIds = new Set(existingEdges.map(e => `${e.source}-${e.target}-${e.label}`));
        const newEdges = (agentResponse.knowledgeGraph.edges || []).filter(e => e && !existingEdgeIds.has(`${e.source}-${e.target}-${e.label}`));
        
        newGraph = {
            nodes: [...existingNodes, ...newNodes],
            edges: [...existingEdges, ...newEdges],
        };
    }

    return {
        topic: currentTopic,
        items: [...(baseWorkspace.items || []), ...newItems],
        sources: [...(baseWorkspace.sources || []), ...newSources],
        knowledgeGraph: newGraph,
        synthesis: baseWorkspace.synthesis, // Synthesis isn't updated here
        timestamp: Date.now()
    };
};
