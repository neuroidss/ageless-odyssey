

import React, { useState, useCallback, useEffect } from 'react';
import { type ModelDefinition, type WorkspaceState, AgentType, TrajectoryState, GamificationState, ToastMessage, Realm, ModelProvider, HuggingFaceDevice } from './types';
import { dispatchAgent, synthesizeFindings } from './services/geminiService';
import { getInitialTrajectory, applyIntervention } from './services/trajectoryService';
import { 
    SUPPORTED_MODELS, ACHIEVEMENTS, VECTOR_POINTS, REALM_DEFINITIONS, INTERVENTIONS, 
    DEFAULT_HUGGING_FACE_DEVICE, DEFAULT_HUGGING_FACE_QUANTIZATION, 
    AUTONOMOUS_AGENT_QUERY, DEFAULT_AGENT_BUDGET, AUTONOMOUS_INTERVAL_MS 
} from './constants';
import Header from './components/Header';
import AgentControlPanel from './components/SearchBar';
import WorkspaceView from './components/ResultsDisplay';
import { ToastContainer } from './components/Toast';
import DebugLogView from './components/DebugLogView';

const APP_STATE_STORAGE_KEY = 'agelessOdysseyState';

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
  const [model, setModel] = useState<ModelDefinition>(SUPPORTED_MODELS.find(m => m.id === 'gemini-2.5-flash') || SUPPORTED_MODELS[0]);
  const [quantization, setQuantization] = useState<string>(DEFAULT_HUGGING_FACE_QUANTIZATION);
  const [device, setDevice] = useState<HuggingFaceDevice>(DEFAULT_HUGGING_FACE_DEVICE);
  
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

  // --- Autonomous Mode State ---
  const [isAutonomousMode, setIsAutonomousMode] = useState<boolean>(false);
  const [isAutonomousLoading, setIsAutonomousLoading] = useState<boolean>(false);
  const [agentBudget, setAgentBudget] = useState<number>(DEFAULT_AGENT_BUDGET);
  const [agentCallsMade, setAgentCallsMade] = useState<number>(0);

  const [debugLog, setDebugLog] = useState<string[]>([]);
    
  const addLog = useCallback((message: string) => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      const finalMessage = `[${timestamp}] ${message}`;
      console.log(finalMessage);
      setDebugLog(prev => [finalMessage, ...prev].slice(0, 100));
  }, []);

  // --- State Persistence ---

  // Load state from localStorage on initial mount
  useEffect(() => {
    // Load API Key from session storage
    const savedKey = sessionStorage.getItem('google-api-key');
    if (savedKey) {
        setApiKey(savedKey);
        addLog("Loaded Google AI API Key from session storage.");
    }
    
    // Load main application state from local storage
    try {
        const savedStateJSON = localStorage.getItem(APP_STATE_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);

            if (savedState.topic) setTopic(savedState.topic);
            const savedModel = SUPPORTED_MODELS.find(m => m.id === savedState.model?.id) || SUPPORTED_MODELS[0];
            setModel(savedModel);
            if (savedState.quantization) setQuantization(savedState.quantization);
            if (savedState.device) setDevice(savedState.device);
            if (savedState.workspace) setWorkspace(savedState.workspace);
            if (savedState.hasSearched) setHasSearched(savedState.hasSearched);
            if (savedState.trajectoryState) setTrajectoryState(savedState.trajectoryState);
            if (savedState.gamification) setGamification(savedState.gamification);
            if (savedState.exploredTopics) setExploredTopics(new Set(savedState.exploredTopics));
            // Load autonomous mode state
            if (savedState.isAutonomousMode) setIsAutonomousMode(savedState.isAutonomousMode);
            if (savedState.agentBudget) setAgentBudget(savedState.agentBudget);
            if (savedState.agentCallsMade) setAgentCallsMade(savedState.agentCallsMade);

            addLog("Successfully restored application state from previous session.");
        } else {
            // If no saved state, initialize with defaults
            const initialState = getInitialTrajectory();
            setTrajectoryState(initialState);
            const biologicalAge = initialState.overallScore.projection[0].value;
            const longevityScore = Math.max(0, (100 - biologicalAge) * 10);
            setGamification(prev => ({...prev, longevityScore, vectors: {...prev.vectors, cognitive: longevityScore}}));
            addLog("No saved state found. Initialized new session.");
        }
    } catch (error) {
        addLog(`Failed to load state from localStorage: ${error}. Starting fresh session.`);
        localStorage.removeItem(APP_STATE_STORAGE_KEY);
        setTrajectoryState(getInitialTrajectory());
    }
  }, [addLog]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Avoid saving the initial blank state on first load
    if (!hasSearched && !workspace && !topic && !isAutonomousMode) {
        return;
    }

    try {
        const stateToSave = {
            topic, model, quantization, device,
            workspace, hasSearched, trajectoryState, gamification,
            exploredTopics: Array.from(exploredTopics),
            isAutonomousMode, agentBudget, agentCallsMade,
        };
        localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        addLog(`Error saving state to localStorage: ${error}`);
    }
  }, [topic, model, quantization, device, workspace, hasSearched, trajectoryState, gamification, exploredTopics, isAutonomousMode, agentBudget, agentCallsMade]);


  const handleApiKeyChange = (key: string) => {
      setApiKey(key);
      sessionStorage.setItem('google-api-key', key);
      addLog("Google AI API Key has been updated for this session.");
  };

  const handleModelChange = (newModel: ModelDefinition) => {
    setModel(newModel);
    if (newModel.provider === ModelProvider.HuggingFace) {
        setQuantization(DEFAULT_HUGGING_FACE_QUANTIZATION);
        addLog(`Switched to Hugging Face model. Default quantization set to '${DEFAULT_HUGGING_FACE_QUANTIZATION}'.`);
    }
  };

  // --- Gamification Logic ---
  const updateAscensionState = useCallback((action: string, payload?: any) => {
    setGamification(prev => {
        let newVectors = { ...prev.vectors };
        const newToasts: ToastMessage[] = [];
        let updatedState = { ...prev, vectors: newVectors };
        let newAchievements = { ...prev.achievements };
        
        switch(action) {
            case 'DISPATCH_AGENT': newVectors.memic += VECTOR_POINTS.MEMIC.DISPATCH_AGENT; break;
            case 'SYNTHESIZE': newVectors.memic += VECTOR_POINTS.MEMIC.SYNTHESIZE; break;
            case 'NEW_TOPIC': newVectors.memic += VECTOR_POINTS.MEMIC.NEW_TOPIC; break;
            case 'UPDATE_KNOWLEDGE_GRAPH': newVectors.memic += (payload.nodesAdded || 0) * VECTOR_POINTS.MEMIC.BUILD_GRAPH_NODE; break;
            case 'DISCOVER_TREND':
                if (payload.trendData) {
                    const { velocity, impact } = payload.trendData;
                    newVectors.memic += VECTOR_POINTS.MEMIC.DISCOVER_TREND;
                    newVectors.memic += velocity * VECTOR_POINTS.MEMIC.TREND_VELOCITY_MULTIPLIER;
                    newVectors.memic += impact * VECTOR_POINTS.MEMIC.TREND_IMPACT_MULTIPLIER;
                    
                    if (!newAchievements.TREND_SPOTTER.unlocked) {
                        newAchievements.TREND_SPOTTER.unlocked = true;
                        newToasts.push({ id: Date.now() + 2, title: 'Achievement Unlocked!', message: newAchievements.TREND_SPOTTER.name, icon: 'achievement' });
                    }
                    if (velocity >= 80 && !newAchievements.EXPONENTIAL_THINKER.unlocked) {
                        newAchievements.EXPONENTIAL_THINKER.unlocked = true;
                        newToasts.push({ id: Date.now() + 3, title: 'Achievement Unlocked!', message: newAchievements.EXPONENTIAL_THINKER.name, icon: 'achievement' });
                    }
                }
                break;
            case 'UPDATE_TRAJECTORY': {
                const newLongevityScore = Math.max(0, (100 - payload.biologicalAge) * 10);
                updatedState.longevityScore = newLongevityScore;
                newVectors.cognitive = newLongevityScore; 
                
                if (payload.interventionEffect) newVectors.genetic += Math.round(payload.interventionEffect * VECTOR_POINTS.GENETIC.BIOMARKER_IMPROVEMENT_MULTIPLIER);
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
        
        const currentRealmDef = REALM_DEFINITIONS.find(r => r.realm === updatedState.realm);
        const nextRealmIndex = REALM_DEFINITIONS.indexOf(currentRealmDef!) - 1;

        if (nextRealmIndex >= 0) {
            const nextRealmDef = REALM_DEFINITIONS[nextRealmIndex];
            if (updatedState.vectors.cognitive >= nextRealmDef.thresholds.cognitive && updatedState.vectors.genetic >= nextRealmDef.thresholds.genetic && updatedState.vectors.memic >= nextRealmDef.thresholds.memic) {
                updatedState.realm = nextRealmDef.realm;
                newToasts.push({ id: Date.now(), title: 'Realm Ascension!', message: `You have ascended to the Realm of the ${nextRealmDef.realm}.`, icon: 'ascension' });
                if (!newAchievements.REALM_ASCENSION.unlocked && nextRealmDef.realm === Realm.OptimizedMortal) newAchievements.REALM_ASCENSION.unlocked = true;
            }
        }
        
        updatedState.achievements = newAchievements;
        if (newToasts.length > 0) setToasts(prevToasts => [...prevToasts, ...newToasts]);
        
        return updatedState;
    });
  }, []);
  
  const mergeAgentResponse = useCallback((response: any) => {
    setWorkspace(prev => {
        const baseWorkspace = prev || { topic: '', items: [], sources: [], knowledgeGraph: { nodes: [], edges: [] }, synthesis: null };
        const newItems = response.items.filter((newItem: any) => !baseWorkspace.items.some(existing => existing.id === newItem.id));
        const newSources = response.sources?.filter((newSrc: any) => !baseWorkspace.sources.some(existing => existing.uri === newSrc.uri)) ?? [];
        
        let newGraph = baseWorkspace.knowledgeGraph;
        if (response.knowledgeGraph) {
            const existingNodeIds = new Set(baseWorkspace.knowledgeGraph?.nodes.map(n => n.id) || []);
            const newNodes = response.knowledgeGraph.nodes.filter((n: any) => !existingNodeIds.has(n.id));
            const existingEdgeIds = new Set(baseWorkspace.knowledgeGraph?.edges.map(e => `${e.source}-${e.target}-${e.label}`) || []);
            const newEdges = response.knowledgeGraph.edges.filter((e: any) => !existingEdgeIds.has(`${e.source}-${e.target}-${e.label}`));
            newGraph = {
                nodes: [...(baseWorkspace.knowledgeGraph?.nodes || []), ...newNodes],
                edges: [...(baseWorkspace.knowledgeGraph?.edges || []), ...newEdges],
            };
        }
        
        return {
            topic: baseWorkspace.topic,
            items: [...baseWorkspace.items, ...newItems],
            sources: [...baseWorkspace.sources, ...newSources],
            knowledgeGraph: newGraph,
            synthesis: baseWorkspace.synthesis
        };
      });
  }, []);

  // Effect for Autonomous Agent
  useEffect(() => {
    if (!isAutonomousMode) return;

    let intervalId: number | undefined;

    const runAutonomousAgent = async () => {
      if (agentCallsMade >= agentBudget) {
        addLog("[Autonomous] Daily budget reached. Stopping periodic checks.");
        if (intervalId) clearInterval(intervalId);
        setIsAutonomousLoading(false);
        return;
      }
      
      addLog(`[Autonomous] Triggering search for: "${AUTONOMOUS_AGENT_QUERY}"`);
      setIsAutonomousLoading(true);

      try {
        const response = await dispatchAgent(AUTONOMOUS_AGENT_QUERY, AgentType.TrendSpotter, model, quantization, addLog, apiKey, device);
        addLog(`[Autonomous] Agent finished. Found ${response.items.length} new items.`);
        
        if (response.items.length > 0) {
            setHasSearched(prev => prev ? prev : true);

            setWorkspace(prev => {
                if (!prev) {
                    // If workspace is empty, initialize it.
                    return {
                        topic: AUTONOMOUS_AGENT_QUERY,
                        items: response.items || [],
                        sources: response.sources || [],
                        knowledgeGraph: response.knowledgeGraph || { nodes: [], edges: [] },
                        synthesis: null
                    };
                }
                // If workspace exists, merge into it.
                const newItems = response.items.filter((newItem: any) => !prev.items.some(existing => existing.id === newItem.id));
                const newSources = response.sources?.filter((newSrc: any) => !prev.sources.some(existing => existing.uri === newSrc.uri)) ?? [];
                
                let newGraph = prev.knowledgeGraph;
                if (response.knowledgeGraph) {
                    const existingNodeIds = new Set(prev.knowledgeGraph?.nodes.map(n => n.id) || []);
                    const newNodes = response.knowledgeGraph.nodes.filter((n: any) => !existingNodeIds.has(n.id));
                    const existingEdgeIds = new Set(prev.knowledgeGraph?.edges.map(e => `${e.source}-${e.target}-${e.label}`) || []);
                    const newEdges = response.knowledgeGraph.edges.filter((e: any) => !existingEdgeIds.has(`${e.source}-${e.target}-${e.label}`));
                    newGraph = {
                        nodes: [...(prev.knowledgeGraph?.nodes || []), ...newNodes],
                        edges: [...(prev.knowledgeGraph?.edges || []), ...newEdges],
                    };
                }
                
                return {
                    ...prev,
                    items: [...prev.items, ...newItems],
                    sources: [...prev.sources, ...newSources],
                    knowledgeGraph: newGraph,
                };
            });

            response.items.forEach(item => {
                if (item.type === 'trend' && item.trendData) {
                    updateAscensionState('DISCOVER_TREND', { trendData: item.trendData });
                }
            });
            setAgentCallsMade(prev => prev + 1);
        }

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
        addLog(`[Autonomous] ERROR during periodic search: ${errorMessage}`);
      } finally {
        setIsAutonomousLoading(false);
      }
    };

    runAutonomousAgent();
    intervalId = window.setInterval(runAutonomousAgent, AUTONOMOUS_INTERVAL_MS);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        addLog("[Autonomous] Mode deactivated. Interval cleared.");
      }
    };
  }, [isAutonomousMode, agentBudget, agentCallsMade, model, quantization, apiKey, device, addLog, updateAscensionState]);


  const handleDispatchAgent = useCallback(async (agentType: AgentType) => {
    if (!topic.trim()) { addLog(`[handleDispatchAgent] Aborted: topic is empty.`); return; }
    
    addLog(`[handleDispatchAgent] Processing topic: "${topic}"`);
    updateAscensionState('DISPATCH_AGENT');
    if (!gamification.achievements.FIRST_RESEARCH.unlocked) {
        setGamification(prev => ({...prev, achievements: {...prev.achievements, FIRST_RESEARCH: {...prev.achievements.FIRST_RESEARCH, unlocked: true}}}));
        setToasts(prev => [...prev, {id: Date.now(), title: "Achievement Unlocked!", message: "Budding Scientist", icon: 'achievement'}]);
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Dispatching Agent...');
    if (!hasSearched) setHasSearched(true);
    
    const currentWorkspace = workspace || { topic, items: [], sources: [], knowledgeGraph: { nodes: [], edges: [] }, synthesis: null };

    try {
      const response = await dispatchAgent(topic, agentType, model, quantization, addLog, apiKey, device, setLoadingMessage);
      addLog(`Agent "${agentType}" finished. Found ${response.items.length} items.`);
      
      response.items.forEach(item => {
          if (item.type === 'trend' && item.trendData) updateAscensionState('DISCOVER_TREND', { trendData: item.trendData });
      });
      if (response.knowledgeGraph && response.knowledgeGraph.nodes.length > (currentWorkspace.knowledgeGraph?.nodes.length ?? 0)) {
           if (!gamification.achievements.KNOWLEDGE_ARCHITECT.unlocked && response.knowledgeGraph.nodes.length >= 5) {
              setGamification(prev => ({...prev, achievements: {...prev.achievements, KNOWLEDGE_ARCHITECT: {...prev.achievements.KNOWLEDGE_ARCHITECT, unlocked: true}}}));
              setToasts(prev => [...prev, {id: Date.now(), title: "Achievement Unlocked!", message: "Knowledge Architect", icon: 'achievement'}]);
          }
          const nodesAdded = response.knowledgeGraph.nodes.length - (currentWorkspace.knowledgeGraph?.nodes.length ?? 0);
          if (nodesAdded > 0) updateAscensionState('UPDATE_KNOWLEDGE_GRAPH', { nodesAdded });
      }

      mergeAgentResponse(response);

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'An unknown agent error occurred.';
      addLog(`ERROR in handleDispatchAgent: ${msg}`);
      if (model.provider === ModelProvider.HuggingFace && (msg.includes('Failed to fetch') || msg.includes('Failed to run model'))) {
           setError('Failed to load the Hugging Face model. This can be caused by a network issue, an ad blocker, or a temporary problem with the model servers. Please check your connection, disable browser extensions like ad blockers, and try again. If the problem persists, try selecting a different model.');
      } else {
          setError(msg);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [topic, model, quantization, device, apiKey, hasSearched, workspace, updateAscensionState, addLog, gamification.achievements, mergeAgentResponse]);

  const handleSynthesize = useCallback(async () => {
    if (!workspace?.items || workspace.items.length === 0) return;

    addLog(`Synthesizing findings for "${workspace.topic}"...`);
    updateAscensionState('SYNTHESIZE');
    if (!gamification.achievements.SYNTHESIZER.unlocked) {
        setGamification(prev => ({...prev, achievements: {...prev.achievements, SYNTHESIZER: {...prev.achievements.SYNTHESIZER, unlocked: true}}}));
        setToasts(prev => [...prev, {id: Date.now(), title: "Achievement Unlocked!", message: "The Synthesizer", icon: 'achievement'}]);
    }
    
    setIsSynthesizing(true);
    setSynthesisError(null);
    setWorkspace(prev => prev ? {...prev, synthesis: null} : null);

    try {
      const response = await synthesizeFindings(workspace.topic || topic, workspace.items, model, quantization, addLog, apiKey, device);
      addLog('Synthesis complete.');
      setWorkspace(prev => prev ? {...prev, synthesis: response} : null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'An unknown error occurred during synthesis.';
      addLog(`ERROR during synthesis: ${msg}`);
      setSynthesisError(msg);
    } finally {
      setIsSynthesizing(false);
    }
  }, [workspace, topic, model, quantization, device, updateAscensionState, addLog, apiKey, gamification.achievements]);
  
    const handleTopicChange = (newTopic: string) => {
        setTopic(newTopic);
        const newTopicLower = newTopic.toLowerCase().trim();
        const exploredTopicsLower = new Set(Array.from(exploredTopics).map(t => t.toLowerCase().trim()));
        
        if (newTopicLower && !exploredTopicsLower.has(newTopicLower)) {
            const newExplored = new Set(exploredTopics).add(newTopic);
            setExploredTopics(newExplored);
            updateAscensionState('NEW_TOPIC');
            if (newExplored.size >= 3 && !gamification.achievements.HALLMARK_EXPLORER.unlocked) {
                setGamification(prev => ({...prev, achievements: {...prev.achievements, HALLMARK_EXPLORER: {...prev.achievements.HALLMARK_EXPLORER, unlocked: true}}}));
                setToasts(prev => [...prev, {id: Date.now(), title: "Achievement Unlocked!", message: "Hallmark Explorer", icon: 'achievement'}]);
            }
        }
    }

  const handleApplyIntervention = useCallback((interventionId: string | null) => {
      const intervention = INTERVENTIONS.find(i => i.id === interventionId);
      const updatedState = applyIntervention(interventionId);
      setTrajectoryState(updatedState);
      addLog(`Applied intervention: ${intervention?.name || 'None'}`);
      
      if (!gamification.achievements.BIO_STRATEGIST.unlocked && interventionId) {
          setGamification(prev => ({...prev, achievements: {...prev.achievements, BIO_STRATEGIST: {...prev.achievements.BIO_STRATEGIST, unlocked: true}}}));
          setToasts(prev => [...prev, {id: Date.now(), title: "Achievement Unlocked!", message: "Bio-Strategist", icon: 'achievement'}]);
      }
      
      if (intervention?.type === 'radical') {
          if (!gamification.achievements.TRANSHUMANIST.unlocked) {
               updateAscensionState('UPDATE_TRAJECTORY', { biologicalAge: updatedState.overallScore.projection[0].value, isRadical: true });
          }
      }
  }, [gamification.achievements, updateAscensionState, addLog]);

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
  
  const handleResetState = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all your progress and saved data? This action cannot be undone.")) {
        localStorage.removeItem(APP_STATE_STORAGE_KEY);
        sessionStorage.removeItem('google-api-key');
        addLog("User triggered a full state reset. Reloading the application...");
        window.location.reload();
    }
  }, [addLog]);

  const handleResetBudget = useCallback(() => {
    setAgentCallsMade(0);
    addLog("Autonomous agent daily budget has been reset.");
    setToasts(prev => [...prev, {id: Date.now(), title: "Budget Reset", message: "Autonomous agent call count is now 0."}]);
  }, [addLog]);

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
          isAutonomousMode={isAutonomousMode}
          setIsAutonomousMode={setIsAutonomousMode}
          agentBudget={agentBudget}
          setAgentBudget={setAgentBudget}
          agentCallsMade={agentCallsMade}
        />
        <div className="mt-4">
          <WorkspaceView
            workspace={workspace}
            isLoading={isLoading && !hasSearched}
            loadingMessage={loadingMessage}
            error={error}
            hasSearched={hasSearched}
            isSynthesizing={isSynthesizing}
            synthesisError={synthesisError}
            onSynthesize={handleSynthesize}
            trajectoryState={trajectoryState}
            onApplyIntervention={handleApplyIntervention}
            isAutonomousMode={isAutonomousMode}
            isAutonomousLoading={isAutonomousLoading}
          />
        </div>
      </main>
      <DebugLogView logs={debugLog} onReset={handleResetState} onResetBudget={handleResetBudget} />
    </div>
  );
};

export default App;