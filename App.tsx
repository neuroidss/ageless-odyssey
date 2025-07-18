



import React, { useState, useCallback, useEffect, useRef } from 'react';
import { type ModelDefinition, type WorkspaceState, AgentType, TrajectoryState, GamificationState, ToastMessage, Realm, ModelProvider, HuggingFaceDevice, AgentResponse } from './types';
import { dispatchAgent, synthesizeFindings } from './services/geminiService';
import { getInitialTrajectory, applyIntervention } from './services/trajectoryService';
import { 
    SUPPORTED_MODELS, ACHIEVEMENTS, VECTOR_POINTS, REALM_DEFINITIONS, INTERVENTIONS, 
    DEFAULT_HUGGING_FACE_DEVICE, DEFAULT_HUGGING_FACE_QUANTIZATION, 
    AUTONOMOUS_AGENT_QUERY, DEFAULT_AGENT_BUDGET
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

const createNextWorkspaceState = (
    currentTopic: string,
    previousState: WorkspaceState | null,
    agentResponse: AgentResponse
): WorkspaceState => {
    const baseWorkspace = previousState || { topic: currentTopic, items: [], sources: [], knowledgeGraph: { nodes: [], edges: [] }, synthesis: null, timestamp: 0 };
    
    const newItems = agentResponse.items.filter((newItem: any) => !baseWorkspace.items.some(existing => existing.id === newItem.id));
    const newSources = agentResponse.sources?.filter((newSrc: any) => !baseWorkspace.sources.some(existing => existing.uri === newSrc.uri)) ?? [];
    
    let newGraph = baseWorkspace.knowledgeGraph;
    if (agentResponse.knowledgeGraph) {
        const existingNodeIds = new Set(baseWorkspace.knowledgeGraph?.nodes.map(n => n.id) || []);
        const newNodes = agentResponse.knowledgeGraph.nodes.filter((n: any) => !existingNodeIds.has(n.id));
        const existingEdgeIds = new Set(baseWorkspace.knowledgeGraph?.edges.map(e => `${e.source}-${e.target}-${e.label}`) || []);
        const newEdges = agentResponse.knowledgeGraph.edges.filter((e: any) => !existingEdgeIds.has(`${e.source}-${e.target}-${e.label}`));
        newGraph = {
            nodes: [...(baseWorkspace.knowledgeGraph?.nodes || []), ...newNodes],
            edges: [...(baseWorkspace.knowledgeGraph?.edges || []), ...newEdges],
        };
    }

    return {
        topic: currentTopic,
        items: [...baseWorkspace.items, ...newItems],
        sources: [...baseWorkspace.sources, ...newSources],
        knowledgeGraph: newGraph,
        synthesis: baseWorkspace.synthesis,
        timestamp: Date.now()
    };
};


const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [model, setModel] = useState<ModelDefinition>(SUPPORTED_MODELS.find(m => m.id === 'gemini-2.5-flash') || SUPPORTED_MODELS[0]);
  const [quantization, setQuantization] = useState<string>(DEFAULT_HUGGING_FACE_QUANTIZATION);
  const [device, setDevice] = useState<HuggingFaceDevice>(DEFAULT_HUGGING_FACE_DEVICE);
  
  const [workspaceHistory, setWorkspaceHistory] = useState<WorkspaceState[]>([]);
  const [timeLapseIndex, setTimeLapseIndex] = useState<number>(0);
  
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
  const [budgetResetTimestamp, setBudgetResetTimestamp] = useState<number>(0);
  const autonomousTimerRef = useRef<number | null>(null);


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
            if (savedState.workspaceHistory && savedState.workspaceHistory.length > 0) {
              setWorkspaceHistory(savedState.workspaceHistory);
              setTimeLapseIndex(savedState.workspaceHistory.length - 1);
            }
            if (savedState.hasSearched) setHasSearched(savedState.hasSearched);
            if (savedState.trajectoryState) setTrajectoryState(savedState.trajectoryState);
            if (savedState.gamification) setGamification(savedState.gamification);
            if (savedState.exploredTopics) setExploredTopics(new Set(savedState.exploredTopics));
            // Load autonomous mode state
            if (savedState.isAutonomousMode) setIsAutonomousMode(savedState.isAutonomousMode);
            if (savedState.agentBudget) setAgentBudget(savedState.agentBudget);
            if (savedState.agentCallsMade) setAgentCallsMade(savedState.agentCallsMade);
            const savedTimestamp = savedState.budgetResetTimestamp || 0;
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if(now - savedTimestamp > oneDay) {
                addLog("Daily budget cycle expired. Resetting calls for new cycle.");
                setAgentCallsMade(0);
                setBudgetResetTimestamp(now);
            } else {
                setBudgetResetTimestamp(savedTimestamp);
            }

            addLog("Successfully restored application state from previous session.");
        } else {
            // If no saved state, initialize with defaults
            const initialState = getInitialTrajectory();
            setTrajectoryState(initialState);
            const biologicalAge = initialState.overallScore.projection[0].value;
            const longevityScore = Math.max(0, (100 - biologicalAge) * 10);
            setGamification(prev => ({...prev, longevityScore, vectors: {...prev.vectors, cognitive: longevityScore}}));
            setBudgetResetTimestamp(Date.now());
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
    if (!hasSearched && workspaceHistory.length === 0 && !topic && !isAutonomousMode) {
        return;
    }

    try {
        const stateToSave = {
            topic, model, quantization, device,
            workspaceHistory, hasSearched, trajectoryState, gamification,
            exploredTopics: Array.from(exploredTopics),
            isAutonomousMode, agentBudget, agentCallsMade, budgetResetTimestamp,
        };
        localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        addLog(`Error saving state to localStorage: ${error}`);
    }
  }, [topic, model, quantization, device, workspaceHistory, hasSearched, trajectoryState, gamification, exploredTopics, isAutonomousMode, agentBudget, agentCallsMade, budgetResetTimestamp]);


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
  
  // Effect for Autonomous Agent - Refactored for correctness and responsiveness
  useEffect(() => {
    if (autonomousTimerRef.current) {
        clearTimeout(autonomousTimerRef.current);
    }

    if (!isAutonomousMode) {
        addLog("[Autonomous] Mode is disabled.");
        setIsAutonomousLoading(false);
        return;
    }

    // Check if the budget cycle needs to be reset
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - budgetResetTimestamp > oneDay) {
        addLog("[Autonomous] New 24-hour cycle started. Resetting budget.");
        setBudgetResetTimestamp(now);
        setAgentCallsMade(0);
        return; // The effect will re-run with the reset values.
    }

    // Check if budget is exhausted
    if (agentCallsMade >= agentBudget) {
        addLog(`[Autonomous] Budget of ${agentBudget} exhausted for this cycle. Checking again later.`);
        const timeUntilNextCycle = (budgetResetTimestamp + oneDay) - now;
        autonomousTimerRef.current = window.setTimeout(() => {
            // This will trigger the effect to re-run and reset the budget.
            addLog("[Autonomous] Timer fired to re-check budget status.");
            setAgentCallsMade(0);
            setBudgetResetTimestamp(Date.now());
        }, timeUntilNextCycle > 0 ? timeUntilNextCycle + 1000 : 1000);
        return;
    }

    const timeElapsedToday = now - budgetResetTimestamp;
    const timeRemainingToday = oneDay - timeElapsedToday;
    const callsRemaining = agentBudget - agentCallsMade;

    // Make the first call of a cycle happen quickly
    const isFirstCallOfCycle = agentCallsMade === 0;
    const calculatedInterval = callsRemaining > 0 ? timeRemainingToday / callsRemaining : timeRemainingToday;
    const finalInterval = isFirstCallOfCycle ? Math.min(calculatedInterval, 10 * 1000) : calculatedInterval;

    addLog(`[Autonomous] Calls remaining: ${callsRemaining}/${agentBudget}. Time left: ${(timeRemainingToday / 3600000).toFixed(1)}h. Next call in ${(finalInterval / 60000).toFixed(1)} mins.`);

    autonomousTimerRef.current = window.setTimeout(async () => {
        addLog(`[Autonomous] Triggering search for: "${AUTONOMOUS_AGENT_QUERY}"`);
        setIsAutonomousLoading(true);
        try {
            const response = await dispatchAgent(AUTONOMOUS_AGENT_QUERY, AgentType.TrendSpotter, model, quantization, addLog, apiKey, device);
            addLog(`[Autonomous] Agent finished. Found ${response.items.length} new items.`);
            
            if (response.items.length > 0) {
                setHasSearched(prev => prev ? prev : true);
                setWorkspaceHistory(prevHistory => {
                    const lastWorkspace = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : null;
                    const newWorkspace = createNextWorkspaceState(AUTONOMOUS_AGENT_QUERY, lastWorkspace, response);
                    setTimeLapseIndex(prevHistory.length);
                    return [...prevHistory, newWorkspace];
                });

                response.items.forEach(item => {
                    if (item.type === 'trend' && item.trendData) {
                        updateAscensionState('DISCOVER_TREND', { trendData: item.trendData });
                    }
                });
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
            addLog(`[Autonomous] ERROR during periodic search: ${errorMessage}`);
        } finally {
            // This state update will trigger this effect to re-run and schedule the next call correctly.
            // It's in `finally` to ensure we don't get stuck in a loop on error.
            setAgentCallsMade(prev => prev + 1);
            setIsAutonomousLoading(false);
        }
    }, finalInterval);

    return () => {
        if (autonomousTimerRef.current) {
            clearTimeout(autonomousTimerRef.current);
        }
    };
  }, [isAutonomousMode, agentBudget, agentCallsMade, budgetResetTimestamp, model, quantization, apiKey, device, addLog, updateAscensionState]);


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
    
    const lastWorkspace = workspaceHistory.length > 0 ? workspaceHistory[workspaceHistory.length - 1] : null;

    try {
      const response = await dispatchAgent(topic, agentType, model, quantization, addLog, apiKey, device, setLoadingMessage);
      addLog(`Agent "${agentType}" finished. Found ${response.items.length} items.`);
      
      const newWorkspace = createNextWorkspaceState(topic, lastWorkspace, response);
      
      response.items.forEach(item => {
          if (item.type === 'trend' && item.trendData) updateAscensionState('DISCOVER_TREND', { trendData: item.trendData });
      });
      if (newWorkspace.knowledgeGraph && newWorkspace.knowledgeGraph.nodes.length > (lastWorkspace?.knowledgeGraph?.nodes.length ?? 0)) {
           if (!gamification.achievements.KNOWLEDGE_ARCHITECT.unlocked && newWorkspace.knowledgeGraph.nodes.length >= 5) {
              setGamification(prev => ({...prev, achievements: {...prev.achievements, KNOWLEDGE_ARCHITECT: {...prev.achievements.KNOWLEDGE_ARCHITECT, unlocked: true}}}));
              setToasts(prev => [...prev, {id: Date.now(), title: "Achievement Unlocked!", message: "Knowledge Architect", icon: 'achievement'}]);
          }
          const nodesAdded = newWorkspace.knowledgeGraph.nodes.length - (lastWorkspace?.knowledgeGraph?.nodes.length ?? 0);
          if (nodesAdded > 0) updateAscensionState('UPDATE_KNOWLEDGE_GRAPH', { nodesAdded });
      }

      setWorkspaceHistory(prev => [...prev, newWorkspace]);
      setTimeLapseIndex(workspaceHistory.length);

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
  }, [topic, model, quantization, device, apiKey, hasSearched, workspaceHistory, updateAscensionState, addLog, gamification.achievements]);

  const handleSynthesize = useCallback(async () => {
    const currentWorkspace = workspaceHistory[timeLapseIndex];
    if (!currentWorkspace?.items || currentWorkspace.items.length === 0) return;

    addLog(`Synthesizing findings for "${currentWorkspace.topic}"...`);
    updateAscensionState('SYNTHESIZE');
    if (!gamification.achievements.SYNTHESIZER.unlocked) {
        setGamification(prev => ({...prev, achievements: {...prev.achievements, SYNTHESIZER: {...prev.achievements.SYNTHESIZER, unlocked: true}}}));
        setToasts(prev => [...prev, {id: Date.now(), title: "Achievement Unlocked!", message: "The Synthesizer", icon: 'achievement'}]);
    }
    
    setIsSynthesizing(true);
    setSynthesisError(null);
    setWorkspaceHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[timeLapseIndex]) {
        newHistory[timeLapseIndex] = {...newHistory[timeLapseIndex], synthesis: null};
      }
      return newHistory;
    });


    try {
      const response = await synthesizeFindings(currentWorkspace.topic || topic, currentWorkspace.items, model, quantization, addLog, apiKey, device);
      addLog('Synthesis complete.');
      setWorkspaceHistory(prev => {
        const newHistory = [...prev];
        if (newHistory[timeLapseIndex]) {
          newHistory[timeLapseIndex] = {...newHistory[timeLapseIndex], synthesis: response};
        }
        return newHistory;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'An unknown error occurred during synthesis.';
      addLog(`ERROR during synthesis: ${msg}`);
      setSynthesisError(msg);
    } finally {
      setIsSynthesizing(false);
    }
  }, [workspaceHistory, timeLapseIndex, topic, model, quantization, device, updateAscensionState, addLog, apiKey, gamification.achievements]);
  
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
    setBudgetResetTimestamp(Date.now());
    addLog("Autonomous agent daily budget and 24-hour timer have been reset.");
    setToasts(prev => [...prev, {id: Date.now(), title: "Budget Reset", message: "Agent call count is 0 and 24-hour cycle restarted."}]);
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
            workspace={workspaceHistory[timeLapseIndex]}
            workspaceHistory={workspaceHistory}
            timeLapseIndex={timeLapseIndex}
            onTimeLapseChange={setTimeLapseIndex}
            isLoading={isLoading && workspaceHistory.length === 0}
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