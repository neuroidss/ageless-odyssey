import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
    type ModelDefinition, type WorkspaceState, AgentType, TrajectoryState, OdysseyState, ToastMessage, 
    Realm, ModelProvider, HuggingFaceDevice, AgentResponse, type GPUSupportedFeatures, SearchDataSource, 
    Intervention, RealmDefinition, Quest, WorkspaceItem, RAGIndexEntry, RAGContext 
} from './types';
import { dispatchAgent, synthesizeFindings, callAscensionOracle } from './services/geminiService';
import { getInitialTrajectory, applyIntervention } from './services/trajectoryService';
import { buildRAGIndex, queryRAGIndex } from './services/ragService';
import { 
    SUPPORTED_MODELS, ACHIEVEMENTS, REALM_DEFINITIONS, INTERVENTIONS, 
    DEFAULT_HUGGING_FACE_DEVICE, DEFAULT_HUGGING_FACE_QUANTIZATION, 
    AUTONOMOUS_AGENT_QUERY, DEFAULT_AGENT_BUDGET, QUESTS
} from './constants';
import Header from './components/Header';
import AgentControlPanel from './components/SearchBar';
import WorkspaceView from './components/ResultsDisplay';
import { ToastContainer } from './components/Toast';
import DebugLogView from './components/DebugLogView';
import QuestLog from './components/QuestLog';

const APP_STATE_STORAGE_KEY = 'agelessOdysseyState';

const getInitialOdysseyState = (): OdysseyState => {
  const achievements = Object.entries(ACHIEVEMENTS).reduce((acc, [key, value]) => {
    acc[key] = { ...value, unlocked: false };
    return acc;
  }, {} as OdysseyState['achievements']);
  
  return {
    realm: Realm.MortalShell,
    vectors: {
      genetic: 0,
      memic: 0,
      cognitive: 0,
    },
    benchmarkScore: 0,
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
  const [topic, setTopic] = useState<string>('molecules for anti-aging and rejuvenation');
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
  const [quests, setQuests] = useState<Quest[]>(QUESTS);

  const [apiKey, setApiKey] = useState<string>('');
  const [odysseyState, setOdysseyState] = useState<OdysseyState>(getInitialOdysseyState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [gpuFeatures, setGpuFeatures] = useState<GPUSupportedFeatures | null>(null);

  // --- Ascension Oracle State ---
  const [dynamicRealmDefinitions, setDynamicRealmDefinitions] = useState<RealmDefinition[]>([...REALM_DEFINITIONS].reverse());
  const [isOracleLoading, setIsOracleLoading] = useState<boolean>(false);


  // --- Search Source State ---
  const [searchSources, setSearchSources] = useState<SearchDataSource[]>([SearchDataSource.PubMed, SearchDataSource.BioRxivText, SearchDataSource.GooglePatents, SearchDataSource.OpenGenes]);


  // --- Autonomous Mode State ---
  const [isAutonomousMode, setIsAutonomousMode] = useState<boolean>(false);
  const [isAutonomousLoading, setIsAutonomousLoading] = useState<boolean>(false);
  const [agentBudget, setAgentBudget] = useState<number>(DEFAULT_AGENT_BUDGET);
  const [agentCallsMade, setAgentCallsMade] = useState<number>(0);
  const [budgetResetTimestamp, setBudgetResetTimestamp] = useState<number>(0);
  const [autonomousRunCount, setAutonomousRunCount] = useState<number>(0);
  const autonomousTimerRef = useRef<number | null>(null);

  const [ragIndex, setRagIndex] = useState<RAGIndexEntry[]>([]);

  const [debugLog, setDebugLog] = useState<string[]>([]);
    
  const addLog = useCallback((message: string) => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      const finalMessage = `[${timestamp}] ${message}`;
      console.log(finalMessage);
      setDebugLog(prev => [finalMessage, ...prev].slice(0, 100));
  }, []);

  // Check for WebGPU support and fall back if necessary
  useEffect(() => {
    async function checkGpuFeatures() {
        if (navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    setGpuFeatures(adapter.features);
                    addLog(`[GPU Check] WebGPU adapter found. Supported features: ${Array.from(adapter.features).join(', ')}`);
                    if (!adapter.features.has('shader-f16')) {
                         addLog(`[GPU Check] WARN: This device/browser does not support 'shader-f16'. Quantizations using f16 (fp16, q4f16) will be disabled for WebGPU.`);
                    }
                } else {
                    addLog('[GPU Check] WebGPU is supported, but no suitable adapter was found. This can happen on multi-GPU systems or due to power-saving settings.');
                    setDevice('wasm');
                    addLog('[GPU Check] Automatically falling back to WASM device for stability.');
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                addLog(`[GPU Check] Error requesting WebGPU adapter: ${message}`);
                setDevice('wasm');
                addLog('[GPU Check] Error during adapter request. Automatically falling back to WASM device for stability.');
            }
        } else {
            addLog('[GPU Check] WebGPU API not found in this browser.');
            setDevice('wasm');
            addLog('[GPU Check] Automatically falling back to WASM device.');
        }
    }
    checkGpuFeatures();
  }, [addLog]);

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
            if (savedState.searchSources) setSearchSources(savedState.searchSources);
            if (savedState.workspaceHistory && savedState.workspaceHistory.length > 0) {
              setWorkspaceHistory(savedState.workspaceHistory);
              setTimeLapseIndex(savedState.workspaceHistory.length - 1);
            }
            if (savedState.hasSearched) setHasSearched(savedState.hasSearched);
            if (savedState.trajectoryState) setTrajectoryState(savedState.trajectoryState);
            if (savedState.odysseyState) setOdysseyState(savedState.odysseyState);
            if (savedState.quests) setQuests(savedState.quests);
            if (savedState.dynamicRealmDefinitions) setDynamicRealmDefinitions(savedState.dynamicRealmDefinitions);

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
            setOdysseyState(prev => ({...prev, longevityScore, vectors: {...prev.vectors, cognitive: longevityScore}}));
            setBudgetResetTimestamp(Date.now());
            addLog("No saved state found. Initialized new session.");
        }
    } catch (error) {
        addLog(`Failed to load state from localStorage: ${error}. Starting fresh session.`);
        localStorage.removeItem(APP_STATE_STORAGE_KEY);
        setTrajectoryState(getInitialTrajectory());
        setQuests(QUESTS);
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
            topic, model, quantization, device, searchSources,
            workspaceHistory, hasSearched, trajectoryState, odysseyState,
            quests,
            isAutonomousMode, agentBudget, agentCallsMade, budgetResetTimestamp,
            dynamicRealmDefinitions,
        };
        localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        addLog(`Error saving state to localStorage: ${error}`);
    }
  }, [topic, model, quantization, device, searchSources, workspaceHistory, hasSearched, trajectoryState, odysseyState, quests, isAutonomousMode, agentBudget, agentCallsMade, budgetResetTimestamp, dynamicRealmDefinitions]);


  // Effect to build the RAG index whenever history or quests change
  useEffect(() => {
    const buildIndex = async () => {
        const completedQuests = quests.filter(q => q.status === 'completed');
        const allItems = workspaceHistory.flatMap(w => w.items);
        // Deduplicate items to ensure the RAG context isn't cluttered
        const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());

        if (uniqueItems.length === 0 && completedQuests.length === 0) {
            setRagIndex([]);
            return;
        }

        const newIndex = await buildRAGIndex(uniqueItems, completedQuests, addLog);
        setRagIndex(newIndex);
    };

    buildIndex();
  }, [workspaceHistory, quests, addLog]);

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
  
  const handleToggleSearchSource = (source: SearchDataSource) => {
    setSearchSources(prev => 
        prev.includes(source) 
            ? prev.filter(s => s !== source) 
            : [...prev, source]
    );
    addLog(`Toggled search source: ${source}`);
  };

  // --- Odyssey Logic ---
  const updateAscensionState = useCallback((action: 'QUEST_COMPLETED' | 'UNLOCK_ACHIEVEMENT' | 'UPDATE_LONGEVITY_SCORE', payload?: any) => {
    setOdysseyState(prevOdysseyState => {
        let newMemic = prevOdysseyState.vectors.memic;
        let newGenetic = prevOdysseyState.vectors.genetic;
        let updatedOdysseyState = { ...prevOdysseyState };
        let newAchievements = { ...prevOdysseyState.achievements };
        let newBenchmarkScore = prevOdysseyState.benchmarkScore || 0;
        const newToasts: ToastMessage[] = [];
        
        switch(action) {
            case 'QUEST_COMPLETED': {
                if (payload?.quest) {
                    const quest = payload.quest as Quest;
                    const benchmarkMultiplier = 1 + (newBenchmarkScore / 1000);
                    newMemic += Math.round((quest.reward.memic || 0) * benchmarkMultiplier);
                    newGenetic += (quest.reward.genetic || 0);
                    if (quest.reward.benchmark) {
                        newBenchmarkScore += quest.reward.benchmark;
                    }
                }
                if (!newAchievements.FIRST_RESEARCH.unlocked) {
                    newAchievements.FIRST_RESEARCH.unlocked = true;
                    newToasts.push({ id: Date.now() + 1, title: 'Achievement Unlocked!', message: newAchievements.FIRST_RESEARCH.name, icon: 'achievement' });
                }
                break;
            }
            case 'UNLOCK_ACHIEVEMENT':
                 if (payload?.achievementId && newAchievements[payload.achievementId] && !newAchievements[payload.achievementId].unlocked) {
                    newAchievements[payload.achievementId].unlocked = true;
                    newToasts.push({ id: Date.now() + 1, title: 'Achievement Unlocked!', message: newAchievements[payload.achievementId].name, icon: 'achievement' });
                 }
                break;
            case 'UPDATE_LONGEVITY_SCORE': {
                 const newLongevityScore = Math.max(0, (100 - payload.biologicalAge) * 10);
                 updatedOdysseyState.longevityScore = newLongevityScore;
            }
        }
        
        const newCognitive = Math.round(updatedOdysseyState.longevityScore * (1 + Math.log1p(newMemic)));
        updatedOdysseyState.vectors = { genetic: newGenetic, memic: newMemic, cognitive: newCognitive };
        updatedOdysseyState.achievements = newAchievements;
        updatedOdysseyState.benchmarkScore = newBenchmarkScore;

        // Check for Realm Ascension
        const currentRealmIndex = dynamicRealmDefinitions.findIndex(r => r.realm === updatedOdysseyState.realm);
        const nextRealmDef = dynamicRealmDefinitions[currentRealmIndex + 1];

        if (nextRealmDef) {
            if (updatedOdysseyState.vectors.cognitive >= nextRealmDef.thresholds.cognitive && 
                updatedOdysseyState.vectors.genetic >= nextRealmDef.thresholds.genetic && 
                updatedOdysseyState.vectors.memic >= nextRealmDef.thresholds.memic) {
                
                updatedOdysseyState.realm = nextRealmDef.realm;
                newToasts.push({ id: Date.now(), title: 'Realm Ascension!', message: `You have ascended to the Realm of the ${nextRealmDef.realm}.`, icon: 'ascension' });
                
                if (!newAchievements.REALM_ASCENSION.unlocked && nextRealmDef.realm === Realm.BiologicalOptimizer) {
                    newAchievements.REALM_ASCENSION.unlocked = true;
                }
            }
        } else if (!isOracleLoading) { // At the final frontier, call the oracle
            setIsOracleLoading(true);
            addLog("Reached final frontier. Calling Ascension Oracle...");
            const googleAIModel = SUPPORTED_MODELS.find(m => m.provider === ModelProvider.GoogleAI) || model;

            callAscensionOracle(updatedOdysseyState, workspaceHistory[timeLapseIndex], trajectoryState, googleAIModel, apiKey, addLog)
                .then(newRealm => {
                    setDynamicRealmDefinitions(prev => [...prev, newRealm]);
                    setOdysseyState(prev => ({...prev, realm: newRealm.realm})); // Ascend immediately
                    setToasts(t => [...t, { id: Date.now(), title: 'The Oracle Has Spoken!', message: `A new path is revealed: The Realm of ${newRealm.realm}.`, icon: 'oracle' }]);
                })
                .catch(err => {
                    setError(`The Ascension Oracle failed: ${err.message}`);
                    addLog(`ORACLE ERROR: ${err.message}`);
                })
                .finally(() => setIsOracleLoading(false));
        }

        if (newToasts.length > 0) setToasts(prevToasts => [...prevToasts, ...newToasts.filter(t => t.id > (prevToasts[prevToasts.length - 1]?.id || 0))]);
        
        return updatedOdysseyState;
    });
  }, [dynamicRealmDefinitions, isOracleLoading, apiKey, model, addLog, workspaceHistory, timeLapseIndex, trajectoryState]);

  const handleQuestCompletion = useCallback((quest: Quest) => {
      addLog(`Quest Completed: ${quest.title}`);
      // 1. Toast
      setToasts(prev => [...prev, { id: Date.now(), title: "Quest Complete!", message: quest.title, icon: 'quest' }]);
      
      // 2. Update Odyssey vectors
      updateAscensionState('QUEST_COMPLETED', { quest });

      // 3. Unlock achievement
      if (quest.unlocksAchievement) {
        updateAscensionState('UNLOCK_ACHIEVEMENT', { achievementId: quest.unlocksAchievement });
      }

      // 4. Unlock intervention
      if (quest.unlocksIntervention) {
        setTrajectoryState(prev => {
          if (!prev) return null;
          addLog(`Unlocking intervention: ${quest.unlocksIntervention}`);
          const newInterventions = prev.interventions.map(i => 
            i.id === quest.unlocksIntervention ? { ...i, status: 'unlocked' as const } : i
          );
          return { ...prev, interventions: newInterventions };
        });
      }
  }, [updateAscensionState, addLog]);

  const updateQuestProgress = useCallback((topic: string, agentType: AgentType, response: AgentResponse) => {
      setQuests(prevQuests => {
          const newQuests = [...prevQuests];
          let questCompleted = false;

          newQuests.forEach((quest, index) => {
              if (quest.status === 'available') {
                  const { objective } = quest;
                  const agentMatch = objective.agent === agentType;
                  const topicMatch = objective.topicKeywords.every(kw => topic.toLowerCase().includes(kw.toLowerCase()));
                  
                  // For now, success is based on matching agent & topic, and getting a valid response.
                  const responseSufficient = response.items.length > 0;

                  if (agentMatch && topicMatch && responseSufficient) {
                      newQuests[index] = { ...quest, status: 'completed' };
                      questCompleted = true;
                      handleQuestCompletion(newQuests[index]);
                  }
              }
          });

          return questCompleted ? newQuests : prevQuests;
      });
  }, [handleQuestCompletion]);

    // Effect to update available quests based on current realm
  useEffect(() => {
    setQuests(prevQuests =>
      prevQuests.map(quest => {
        const realmIndex = dynamicRealmDefinitions.findIndex(r => r.realm === odysseyState.realm);
        const questRealmIndex = dynamicRealmDefinitions.findIndex(r => r.realm === quest.realmRequirement);
        
        if (quest.status === 'locked' && realmIndex >= questRealmIndex) {
          addLog(`Quest unlocked by realm progression: ${quest.title}`);
          return { ...quest, status: 'available' };
        }
        return quest;
      })
    );
  }, [odysseyState.realm, dynamicRealmDefinitions, addLog]);

  
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
            const ragContext = await queryRAGIndex(AUTONOMOUS_AGENT_QUERY, ragIndex, addLog);
            const response = await dispatchAgent(
                AUTONOMOUS_AGENT_QUERY, AgentType.TrendSpotter, model, quantization, addLog, apiKey, 
                device, searchSources, undefined, undefined, ragContext ?? undefined
            );
            addLog(`[Autonomous] Agent finished. Found ${response.items.length} new items.`);
            
            setAgentCallsMade(prev => prev + 1);
            updateQuestProgress(AUTONOMOUS_AGENT_QUERY, AgentType.TrendSpotter, response);

            if (response.items.length > 0) {
                setHasSearched(prev => prev ? prev : true);
                setWorkspaceHistory(prevHistory => {
                    const lastWorkspace = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : null;
                    const newWorkspace = createNextWorkspaceState(AUTONOMOUS_AGENT_QUERY, lastWorkspace, response);
                    setTimeLapseIndex(prevHistory.length);
                    return [...prevHistory, newWorkspace];
                });
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
            addLog(`[Autonomous] ERROR during periodic search: ${errorMessage}`);
        } finally {
            setAutonomousRunCount(prev => prev + 1);
            setIsAutonomousLoading(false);
        }
    }, finalInterval);

    return () => {
        if (autonomousTimerRef.current) {
            clearTimeout(autonomousTimerRef.current);
        }
    };
  }, [isAutonomousMode, agentBudget, agentCallsMade, budgetResetTimestamp, model, quantization, apiKey, device, searchSources, addLog, updateQuestProgress, autonomousRunCount, ragIndex]);

  const handleTimeLapseChange = (index: number) => {
    setTimeLapseIndex(index);
    addLog(`Time-lapsed to history snapshot #${index+1}.`);
  };

  const handleDispatchAgent = useCallback(async (agentType: AgentType) => {
    if (!topic) {
        setError("Please enter a research topic first.");
        return;
    }
    if (model.provider === ModelProvider.GoogleAI && !apiKey && !process.env.API_KEY) {
        setError("Please enter your Google AI API Key in the settings to use this model.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setSynthesisError(null);
    setLoadingMessage(`Dispatching ${agentType}...`);
    addLog(`Dispatching agent '${agentType}' for topic: "${topic}"`);

    try {
      const ragContext = await queryRAGIndex(topic, ragIndex, addLog);
      
      const response = await dispatchAgent(
        topic,
        agentType,
        model,
        quantization,
        addLog,
        apiKey,
        device,
        searchSources,
        (msg) => setLoadingMessage(msg),
        undefined,
        ragContext ?? undefined
      );
      
      addLog(`Agent '${agentType}' finished. Found ${response.items.length} items and ${response.sources?.length || 0} sources.`);
      
      const previousWorkspace = workspaceHistory.length > 0 ? workspaceHistory[workspaceHistory.length - 1] : null;
      const newWorkspace = createNextWorkspaceState(topic, previousWorkspace, response);
      
      // Check for quest completion
      updateQuestProgress(topic, agentType, response);
      
      setWorkspaceHistory(prev => [...prev, newWorkspace]);
      setTimeLapseIndex(workspaceHistory.length);
      setHasSearched(true);
      
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(message);
      addLog(`ERROR during agent dispatch: ${message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [topic, model, quantization, apiKey, device, searchSources, addLog, workspaceHistory, updateQuestProgress, ragIndex]);
  
  const handleSynthesize = useCallback(async () => {
    const currentWorkspace = workspaceHistory[timeLapseIndex];
    if (!currentWorkspace || currentWorkspace.items.length === 0) return;
    
    setIsSynthesizing(true);
    setSynthesisError(null);
    addLog(`Synthesizing ${currentWorkspace.items.length} items...`);
    
    try {
        const synthesisText = await synthesizeFindings(currentWorkspace.topic, currentWorkspace.items, model, quantization, addLog, apiKey, device);
        addLog(`Synthesis successful. Length: ${synthesisText.length}`);
        
        setWorkspaceHistory(prev => {
            const newHistory = [...prev];
            newHistory[timeLapseIndex] = { ...newHistory[timeLapseIndex], synthesis: synthesisText, timestamp: Date.now() };
            return newHistory;
        });
        
        // After synthesis, if no trajectory state exists, initialize it.
        if (!trajectoryState) {
            const initialState = getInitialTrajectory();
            setTrajectoryState(initialState);
            const biologicalAge = initialState.overallScore.projection[0].value;
            updateAscensionState('UPDATE_LONGEVITY_SCORE', { biologicalAge });
        }

    } catch(e) {
        const message = e instanceof Error ? e.message : 'An unknown error occurred.';
        setSynthesisError(message);
        addLog(`ERROR during synthesis: ${message}`);
    } finally {
        setIsSynthesizing(false);
    }
  }, [workspaceHistory, timeLapseIndex, model, quantization, apiKey, device, addLog, odysseyState.achievements, trajectoryState, updateAscensionState]);

  const handleApplyIntervention = (interventionId: string | null) => {
    if (!trajectoryState) return;
    const newState = applyIntervention(trajectoryState, interventionId);
    setTrajectoryState(newState);
    
    const newBioAge = newState.overallScore.interventionProjection?.[0].value ?? newState.overallScore.projection[0].value;
    updateAscensionState('UPDATE_LONGEVITY_SCORE', { biologicalAge: newBioAge });
    
    addLog(`Applied intervention: ${interventionId || 'None'}`);
  };

  const handleForgeQuest = useCallback(async (item: WorkspaceItem) => {
    if (!item.trendData || item.questForged) return;

    addLog(`[QuestCrafter] Forging quest from trend: "${item.title}"`);
    setIsLoading(true);
    setError(null);
    setLoadingMessage(`Forging quest from trend...`);

    try {
      const ragContext = await queryRAGIndex(item.title, ragIndex, addLog);
      
      const response = await dispatchAgent(
        item.title,
        AgentType.QuestCrafter,
        model,
        quantization,
        addLog,
        apiKey,
        device,
        [], // No search needed for quest crafting
        (msg) => setLoadingMessage(msg),
        item.trendData,
        ragContext ?? undefined
      );

      if (response.newQuest) {
        const createdQuest: Quest = {
          ...response.newQuest,
          id: `dynamic-${Date.now()}`,
          status: 'available',
          isDynamic: true,
          sourceTrendId: item.id,
          realmRequirement: odysseyState.realm as Realm, // Assign to current realm
        };
        setQuests(prev => [...prev, createdQuest]);
        setToasts(prev => [...prev, { id: Date.now(), title: 'New Quest Available!', message: `Forged from trend: ${item.title}`, icon: 'quest' }]);

        // Mark the trend as having a quest forged
        setWorkspaceHistory(prevHistory => {
            const newHistory = JSON.parse(JSON.stringify(prevHistory));
            const latestWorkspace = newHistory[newHistory.length-1];
            const trendIndex = latestWorkspace.items.findIndex((i: WorkspaceItem) => i.id === item.id);
            if (trendIndex !== -1) {
                latestWorkspace.items[trendIndex].questForged = true;
            }
            return newHistory;
        });

        addLog(`[QuestCrafter] Successfully forged quest: "${createdQuest.title}"`);
      } else {
        throw new Error("Quest Crafter agent did not return a valid new quest object.");
      }

    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(message);
      addLog(`[QuestCrafter] ERROR during quest forging: ${message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [model, quantization, addLog, apiKey, device, odysseyState.realm, ragIndex]);


  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset all progress? This will clear your workspace, trajectory, and achievements.")) {
        localStorage.removeItem(APP_STATE_STORAGE_KEY);
        setTopic('');
        setWorkspaceHistory([]);
        setTimeLapseIndex(0);
        setHasSearched(false);
        setError(null);
        setSynthesisError(null);
        setTrajectoryState(getInitialTrajectory());
        setOdysseyState(getInitialOdysseyState());
        setQuests(QUESTS);
        setIsAutonomousMode(false);
        setAgentBudget(DEFAULT_AGENT_BUDGET);
        setAgentCallsMade(0);
        setBudgetResetTimestamp(Date.now());
        addLog("Application state has been reset.");
        window.location.reload();
    }
  };
  
  const handleResetBudget = () => {
    if (window.confirm("Reset the daily autonomous agent call budget? This is for debugging purposes.")) {
        setAgentCallsMade(0);
        setBudgetResetTimestamp(Date.now());
        addLog("Autonomous agent budget reset for the current cycle.");
    }
  };

  const currentWorkspace = workspaceHistory[timeLapseIndex];
  
  const Dashboard = () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-8">
            <QuestLog quests={quests} />
        </div>
        <div className="lg:col-span-2">
            <WorkspaceView
              workspace={currentWorkspace}
              workspaceHistory={workspaceHistory}
              timeLapseIndex={timeLapseIndex}
              onTimeLapseChange={handleTimeLapseChange}
              isLoading={isLoading}
              error={error}
              hasSearched={hasSearched}
              isSynthesizing={isSynthesizing}
              synthesisError={synthesisError}
              onSynthesize={handleSynthesize}
              onForgeQuest={handleForgeQuest}
              trajectoryState={trajectoryState}
              onApplyIntervention={handleApplyIntervention}
              loadingMessage={loadingMessage}
              isAutonomousMode={isAutonomousMode}
              isAutonomousLoading={isAutonomousLoading}
            />
        </div>
      </div>
  );

  return (
    <main className="min-h-screen text-slate-200">
      <div className="container mx-auto px-4 py-8">
        <Header odysseyState={odysseyState} dynamicRealmDefinitions={dynamicRealmDefinitions} isOracleLoading={isOracleLoading} />
        <AgentControlPanel
          topic={topic}
          setTopic={setTopic}
          onDispatchAgent={handleDispatchAgent}
          isLoading={isLoading || isSynthesizing || isOracleLoading}
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
          gpuFeatures={gpuFeatures}
          searchSources={searchSources}
          onToggleSearchSource={handleToggleSearchSource}
        />
        <Dashboard />
      </div>
      <ToastContainer 
        toasts={toasts}
        onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />
      <DebugLogView logs={debugLog} onReset={handleResetProgress} onResetBudget={handleResetBudget} />
    </main>
  );
};

export default App;