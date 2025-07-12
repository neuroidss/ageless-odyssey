

import React, { useState, useCallback, useEffect } from 'react';
import { type ModelDefinition, type WorkspaceState, AgentType, TrajectoryState, GamificationState, ToastMessage, Realm, ModelProvider, HuggingFaceDevice } from './types';
import { dispatchAgent, synthesizeFindings } from './services/geminiService';
import { getInitialTrajectory, applyIntervention } from './services/trajectoryService';
import { SUPPORTED_MODELS, ACHIEVEMENTS, VECTOR_POINTS, REALM_DEFINITIONS, INTERVENTIONS } from './constants';
import Header from './components/Header';
import AgentControlPanel from './components/SearchBar';
import WorkspaceView from './components/ResultsDisplay';
import { ToastContainer } from './components/Toast';
import DebugLogView from './components/DebugLogView';

const getInitialGamificationState = (): GamificationState => {
  const achievements = Object.entries(ACHIEVEMENTS).reduce((acc, [key, value]) => {
    acc[key] = { ...value, unlocked: false };
    return acc;
  }, {} as GamificationState['achievements']);
  
  return {
    realm: Realm.MortalBaseline,
    vectors: {
      genetic: 0,
      memic: 0,
      cognitive: 0,
    },
    longevityScore: 0,
    achievements,
  };
};

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [model, setModel] = useState<ModelDefinition>(SUPPORTED_MODELS[0]);
  const [quantization, setQuantization] = useState<string>(SUPPORTED_MODELS[0].quantizations?.[0] ?? 'q4');
  const [device, setDevice] = useState<HuggingFaceDevice>('wasm');
  
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);

  const [trajectoryState, setTrajectoryState] = useState<TrajectoryState | null>(null);

  const [apiKey, setApiKey] = useState<string>('');
  const [gamification, setGamification] = useState<GamificationState>(getInitialGamificationState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [exploredTopics, setExploredTopics] = useState<Set<string>>(new Set());

  const [debugLog, setDebugLog] = useState<string[]>([]);
    
  const addLog = useCallback((message: string) => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      const finalMessage = `[${timestamp}] ${message}`;
      console.log(finalMessage);
      setDebugLog(prev => [finalMessage, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    const savedKey = sessionStorage.getItem('google-api-key');
    if (savedKey) {
        setApiKey(savedKey);
        addLog("Loaded Google AI API Key from session storage.");
    }
  }, [addLog]);

  const handleApiKeyChange = (key: string) => {
      setApiKey(key);
      sessionStorage.setItem('google-api-key', key);
      addLog("Google AI API Key has been updated for this session.");
  };

  const handleModelChange = (newModel: ModelDefinition) => {
    setModel(newModel);
    if (newModel.provider === ModelProvider.HuggingFace && newModel.quantizations) {
        setQuantization(newModel.quantizations[0]);
        addLog(`Switched to Hugging Face model. Default quantization set to '${newModel.quantizations[0]}'.`);
    }
  };

  // --- Ascension Framework Logic ---
  const updateAscensionState = useCallback((action: string, payload?: any) => {
    setGamification(prev => {
        let newVectors = { ...prev.vectors };
        const newToasts: ToastMessage[] = [];
        let updatedState = { ...prev, vectors: newVectors };
        let newAchievements = { ...prev.achievements };
        
        // 1. Update Vectors based on actions
        switch(action) {
            case 'DISPATCH_AGENT':
                newVectors.memic += VECTOR_POINTS.MEMIC.DISPATCH_AGENT;
                break;
            case 'SYNTHESIZE':
                newVectors.memic += VECTOR_POINTS.MEMIC.SYNTHESIZE;
                break;
            case 'NEW_TOPIC':
                newVectors.memic += VECTOR_POINTS.MEMIC.NEW_TOPIC;
                break;
            case 'UPDATE_KNOWLEDGE_GRAPH':
                newVectors.memic += (payload.nodesAdded || 0) * VECTOR_POINTS.MEMIC.BUILD_GRAPH_NODE;
                break;
            case 'UPDATE_TRAJECTORY': {
                const newLongevityScore = Math.max(0, (100 - payload.biologicalAge) * 10);
                updatedState.longevityScore = newLongevityScore;
                newVectors.cognitive = newLongevityScore; // Cognitive vector is directly tied to the score
                
                if (payload.interventionEffect) {
                    newVectors.genetic += Math.round(payload.interventionEffect * VECTOR_POINTS.GENETIC.BIOMARKER_IMPROVEMENT_MULTIPLIER);
                }
                if (payload.isRadical) {
                    newVectors.genetic += VECTOR_POINTS.GENETIC.RADICAL_INTERVENTION_BONUS;
                    if (!newAchievements.TRANSHUMANIST.unlocked) {
                        newAchievements.TRANSHUMANIST.unlocked = true;
                        newToasts.push({ id: Date.now() + 1, title: 'Achievement Unlocked!', message: newAchievements.TRANSHUMANIST.name, icon: 'achievement' });
                    }
                }
                break;
            }
        }
        
        // 2. Check for Realm Advancement
        const currentRealmDef = REALM_DEFINITIONS.find(r => r.realm === updatedState.realm);
        const nextRealmIndex = REALM_DEFINITIONS.indexOf(currentRealmDef!) - 1;

        if (nextRealmIndex >= 0) {
            const nextRealmDef = REALM_DEFINITIONS[nextRealmIndex];
            if (
                updatedState.vectors.cognitive >= nextRealmDef.thresholds.cognitive &&
                updatedState.vectors.genetic >= nextRealmDef.thresholds.genetic &&
                updatedState.vectors.memic >= nextRealmDef.thresholds.memic
            ) {
                updatedState.realm = nextRealmDef.realm;
                newToasts.push({ id: Date.now(), title: 'Realm Ascension!', message: `You have ascended to the Realm of the ${nextRealmDef.realm}.`, icon: 'ascension' });
                if (!newAchievements.REALM_ASCENSION.unlocked && nextRealmDef.realm === Realm.OptimizedMortal) {
                   newAchievements.REALM_ASCENSION.unlocked = true;
                }
            }
        }
        
        updatedState.achievements = newAchievements;

        if (newToasts.length > 0) {
            setToasts(prevToasts => [...prevToasts, ...newToasts]);
        }
        
        return updatedState;
    });
  }, []);


  useEffect(() => {
    const initialState = getInitialTrajectory();
    setTrajectoryState(initialState);
    const biologicalAge = initialState.overallScore.projection[0].value;
    const longevityScore = Math.max(0, (100 - biologicalAge) * 10);
    setGamification(prev => ({...prev, longevityScore, vectors: {...prev.vectors, cognitive: longevityScore}}));
  }, []);

  // Effect to update score and check achievements when trajectory changes
  useEffect(() => {
    if (trajectoryState) {
        const biologicalAge = trajectoryState.overallScore.projection[0].value;
        let interventionEffect = 0;
        let isRadical = trajectoryState.isRadicalInterventionActive;
        if (trajectoryState.activeInterventionId && trajectoryState.overallScore.interventionProjection) {
            const baselineFuture = trajectoryState.overallScore.projection[10].value;
            const interventionFuture = trajectoryState.overallScore.interventionProjection[10].value;
            interventionEffect = baselineFuture - interventionFuture;
        }
        updateAscensionState('UPDATE_TRAJECTORY', { biologicalAge, interventionEffect, isRadical });
    }
  }, [trajectoryState, updateAscensionState]);

  const handleDispatchAgent = useCallback(async (agentType: AgentType) => {
    addLog(`[handleDispatchAgent] Triggered for agent: ${agentType}`);
    if (!topic.trim()) {
        addLog(`[handleDispatchAgent] Aborted: topic is empty or whitespace.`);
        return;
    }
    
    addLog(`[handleDispatchAgent] Processing topic: "${topic}"`);

    updateAscensionState('DISPATCH_AGENT');
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Dispatching Agent...');
    if (!hasSearched) setHasSearched(true);
    
    const currentWorkspace = workspace || {
        topic: topic,
        items: [],
        sources: [],
        knowledgeGraph: { nodes: [], edges: [] },
        synthesis: null,
    };

    try {
      const response = await dispatchAgent(topic, agentType, model, quantization, addLog, apiKey, device, setLoadingMessage);
      addLog(`Agent "${agentType}" finished. Found ${response.items.length} items.`);
      
      setWorkspace(prev => {
        const baseWorkspace = prev || currentWorkspace;
        const newItems = response.items.filter(newItem => !baseWorkspace.items.some(existing => existing.id === newItem.id));
        const newSources = response.sources?.filter(newSrc => !baseWorkspace.sources.some(existing => existing.uri === newSrc.uri)) ?? [];
        
        let newGraph = baseWorkspace.knowledgeGraph;
        let nodesAdded = 0;
        if(response.knowledgeGraph) {
            const existingNodeIds = new Set(baseWorkspace.knowledgeGraph?.nodes.map(n => n.id));
            const newNodes = response.knowledgeGraph.nodes.filter(n => !existingNodeIds.has(n.id));
            nodesAdded = newNodes.length;
            const newEdges = response.knowledgeGraph.edges; // for simplicity, overwrite edges
            if (nodesAdded > 0) {
                 addLog(`Adding ${nodesAdded} new nodes to the knowledge graph.`);
                 newGraph = {
                    nodes: [...(baseWorkspace.knowledgeGraph?.nodes || []), ...newNodes],
                    edges: [...(baseWorkspace.knowledgeGraph?.edges || []), ...newEdges],
                 }
                 updateAscensionState('UPDATE_KNOWLEDGE_GRAPH', { nodesAdded });
            }
        }
        
        return {
            ...baseWorkspace,
            topic: topic,
            items: [...baseWorkspace.items, ...newItems],
            sources: [...baseWorkspace.sources, ...newSources],
            knowledgeGraph: newGraph,
        };
      });

    } catch (e) {
      if (e instanceof Error) {
        addLog(`ERROR in handleDispatchAgent: ${e.message}`);
        if (model.provider === ModelProvider.HuggingFace && (e.message.includes('Failed to fetch') || e.message.includes('Failed to run model'))) {
             setError('Failed to load the Hugging Face model. This can be caused by a network issue, an ad blocker, or a temporary problem with the model servers. Please check your connection, disable browser extensions like ad blockers, and try again. If the problem persists, try selecting a different model.');
        } else {
            setError(e.message);
        }
      } else {
        addLog(`ERROR in handleDispatchAgent: An unknown agent error occurred.`);
        setError('An unknown agent error occurred.');
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [topic, model, quantization, device, apiKey, hasSearched, workspace, updateAscensionState, addLog]);

  const handleSynthesize = useCallback(async () => {
    if (!workspace?.items || workspace.items.length === 0) return;

    addLog(`Synthesizing findings for "${workspace.topic}"...`);
    updateAscensionState('SYNTHESIZE');
    setIsSynthesizing(true);
    setSynthesisError(null);
    setWorkspace(prev => prev ? {...prev, synthesis: null} : null);

    try {
      const response = await synthesizeFindings(workspace.topic, workspace.items, model, quantization, addLog, apiKey, device);
      addLog('Synthesis complete.');
      setWorkspace(prev => prev ? {...prev, synthesis: response} : null);
    } catch (e) {
      if (e instanceof Error) {
        addLog(`ERROR during synthesis: ${e.message}`);
        setSynthesisError(e.message);
      } else {
        addLog('ERROR during synthesis: An unknown error occurred.');
        setSynthesisError('An unknown error occurred during synthesis.');
      }
    } finally {
      setIsSynthesizing(false);
    }
  }, [workspace, model, quantization, device, updateAscensionState, addLog, apiKey]);
  
    const handleTopicChange = (newTopic: string) => {
        setTopic(newTopic);
        if (!exploredTopics.has(newTopic)) {
            const newExplored = new Set(exploredTopics).add(newTopic);
            setExploredTopics(newExplored);
            updateAscensionState('NEW_TOPIC');
        }
    }

  const handleApplyIntervention = useCallback((interventionId: string | null) => {
      const intervention = INTERVENTIONS.find(i => i.id === interventionId);
      const updatedState = applyIntervention(interventionId);
      setTrajectoryState(updatedState);
      addLog(`Applied intervention: ${intervention?.name || 'None'}`);
      
      if (intervention?.type === 'radical') {
          if (!gamification.achievements.TRANSHUMANIST.unlocked) {
               updateAscensionState('UPDATE_TRAJECTORY', { biologicalAge: updatedState.overallScore.projection[0].value, isRadical: true });
          }
      }
  }, [gamification.achievements.TRANSHUMANIST.unlocked, updateAscensionState, addLog]);

  const dismissToast = (id: number) => {
    setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <main className="container mx-auto px-4">
        <Header gamification={gamification} />
        <AgentControlPanel
          topic={topic}
          setTopic={handleTopicChange}
          onDispatchAgent={handleDispatchAgent}
          isLoading={isLoading}
          model={model}
          setModel={handleModelChange}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          quantization={quantization}
          setQuantization={setQuantization}
          device={device}
          setDevice={setDevice}
        />
        <div className="mt-4">
          <WorkspaceView
            workspace={workspace}
            isLoading={isLoading && !workspace}
            loadingMessage={loadingMessage}
            error={error}
            hasSearched={hasSearched}
            isSynthesizing={isSynthesizing}
            synthesisError={synthesisError}
            onSynthesize={handleSynthesize}
            currentTopic={topic}
            onSelectTopic={handleTopicChange}
            trajectoryState={trajectoryState}
            onApplyIntervention={handleApplyIntervention}
          />
        </div>
      </main>
      <footer className="text-center py-6 mt-12 text-slate-500 text-sm">
        <p>Built for the For Immortality AI Hackathon.</p>
        <p>&copy; 2024 Longevity Analyst Workbench. All data is for informational purposes only.</p>
      </footer>
      <DebugLogView logs={debugLog} />
    </div>
  );
};

export default App;