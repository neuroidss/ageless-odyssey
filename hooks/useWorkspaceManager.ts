import { useState, useEffect, useCallback } from 'react';
import { type WorkspaceState, type AgentResponse, type WorkspaceItem, type RAGIndexEntry, type Quest, type OdysseyState, type ToastMessage, type TrajectoryState, AgentType } from '../types';
import { dispatchAgent, synthesizeFindings } from '../services/geminiService';
import { buildRAGIndex, queryRAGIndex } from '../services/ragService';
import { useAppSettings } from './useAppSettings'; // Assuming settings hook provides necessary props
import { getInitialTrajectory } from '../services/trajectoryService';
import { createNextWorkspaceState } from '../services/workspaceUtils';

export const useWorkspaceManager = (
    settings: ReturnType<typeof useAppSettings>,
    addLog: (msg: string) => void,
    storageKey: string
) => {
    const [topic, setTopic] = useState<string>('molecules for anti-aging and rejuvenation');
    const [workspaceHistory, setWorkspaceHistory] = useState<WorkspaceState[]>([]);
    const [timeLapseIndex, setTimeLapseIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
    const [synthesisError, setSynthesisError] = useState<string | null>(null);
    const [ragIndex, setRagIndex] = useState<RAGIndexEntry[]>([]);

    useEffect(() => {
        try {
            const savedStateJSON = localStorage.getItem(storageKey);
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                if (savedState.topic) setTopic(savedState.topic);
                if (savedState.workspaceHistory && savedState.workspaceHistory.length > 0) {
                    setWorkspaceHistory(savedState.workspaceHistory);
                    setTimeLapseIndex(savedState.workspaceHistory.length - 1);
                }
                if (savedState.hasSearched) setHasSearched(savedState.hasSearched);
                addLog("Successfully restored workspace state from previous session.");
            }
        } catch (e) {
            addLog(`Failed to load workspace state from localStorage: ${e}.`);
        }
    }, [addLog, storageKey]);

    useEffect(() => {
        const allItems = workspaceHistory.flatMap(w => w.items);
        const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());

        if (uniqueItems.length === 0) {
            setRagIndex([]);
            return;
        }

        buildRAGIndex(uniqueItems, [], addLog).then(setRagIndex);
    }, [workspaceHistory, addLog]);

    const handleTimeLapseChange = (index: number) => {
        setTimeLapseIndex(index);
        addLog(`Time-lapsed to history snapshot #${index + 1}.`);
    };

    const updateQuestProgress = useCallback((topic: string, agentType: string, response: AgentResponse, quests: Quest[], onQuestCompleted: (quest: Quest) => void) => {
        let questCompleted = false;
        quests.forEach(quest => {
            if (quest.status === 'available') {
                const { objective } = quest;
                const agentMatch = objective.agent === agentType;
                const topicMatch = objective.topicKeywords.every(kw => topic.toLowerCase().includes(kw.toLowerCase()));
                const responseSufficient = (response.items ?? []).length > 0;
                if (agentMatch && topicMatch && responseSufficient) {
                    onQuestCompleted({ ...quest, status: 'completed' });
                    questCompleted = true;
                }
            }
        });
        return questCompleted;
    }, []);

    const handleDispatchAgent = useCallback(async ({ agentType, query }: { agentType: AgentType; query?: string }) => {
        const dispatchQuery = query || topic;
        if (!dispatchQuery) {
            setError("Please enter a research topic first.");
            return null;
        }
        if (settings.model.provider === 'Google AI' && !settings.apiKey && !process.env.API_KEY) {
            setError("Please enter your Google AI API Key in the settings to use this model.");
            return null;
        }

        setIsLoading(true);
        setError(null);
        setSynthesisError(null);
        setLoadingMessage(`Dispatching ${agentType}...`);
        addLog(`Dispatching agent '${agentType}' for topic: "${dispatchQuery}"`);

        try {
            const ragContext = await queryRAGIndex(dispatchQuery, ragIndex, addLog);
            const response = await dispatchAgent(
                dispatchQuery, agentType, settings.model, settings.quantization, addLog, settings.apiKey,
                settings.device, settings.searchSources, setLoadingMessage, undefined, ragContext ?? undefined
            );
            addLog(`Agent '${agentType}' finished. Found ${(response.items?.length || 0)} items.`);

            const previousWorkspace = workspaceHistory.length > 0 ? workspaceHistory[workspaceHistory.length - 1] : null;
            const newWorkspace = createNextWorkspaceState(dispatchQuery, previousWorkspace, response);
            
            setWorkspaceHistory(prev => [...prev, newWorkspace]);
            setTimeLapseIndex(workspaceHistory.length);
            setHasSearched(true);
            
            return response;
        } catch (e) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(message);
            addLog(`ERROR during agent dispatch: ${message}`);
            return null;
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [topic, settings, addLog, workspaceHistory, ragIndex]);

    const handleSynthesize = useCallback(async (
        trajectoryState: TrajectoryState | null,
        updateAscensionState: (action: 'UPDATE_LONGEVITY_SCORE', payload: any) => void
    ) => {
        const currentWorkspace = workspaceHistory[timeLapseIndex];
        if (!currentWorkspace || currentWorkspace.items.length === 0) return;
        
        setIsSynthesizing(true);
        setSynthesisError(null);
        addLog(`Synthesizing ${currentWorkspace.items.length} items...`);
        
        try {
            const synthesisText = await synthesizeFindings(currentWorkspace.topic, currentWorkspace.items, settings.model, settings.quantization, addLog, settings.apiKey, settings.device);
            addLog(`Synthesis successful. Length: ${synthesisText.length}`);
            
            setWorkspaceHistory(prev => {
                const newHistory = [...prev];
                newHistory[timeLapseIndex] = { ...newHistory[timeLapseIndex], synthesis: synthesisText, timestamp: Date.now() };
                return newHistory;
            });
            
            if (!trajectoryState) {
                const initialState = getInitialTrajectory();
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
    }, [workspaceHistory, timeLapseIndex, settings, addLog]);

    const handleForgeQuest = useCallback(async (
        item: WorkspaceItem,
        odysseyState: OdysseyState,
        setQuests: React.Dispatch<React.SetStateAction<Quest[]>>,
        setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>,
        setWorkspaceHistory: React.Dispatch<React.SetStateAction<WorkspaceState[]>>
    ) => {
        if (!item.trendData || item.questForged) return;

        addLog(`[QuestCrafter] Forging quest from trend: "${item.title}"`);
        setIsLoading(true);
        setError(null);
        setLoadingMessage(`Forging quest from trend...`);

        try {
            const ragContext = await queryRAGIndex(item.title, ragIndex, addLog);
            const response = await dispatchAgent(
                item.title, 'QuestCrafter' as any, settings.model, settings.quantization, addLog, settings.apiKey,
                settings.device, [], setLoadingMessage, item.trendData, ragContext ?? undefined
            );

            if (response.newQuest) {
                const createdQuest: Quest = {
                    ...response.newQuest,
                    id: `dynamic-${Date.now()}`,
                    status: 'available',
                    isDynamic: true,
                    sourceTrendId: item.id,
                    realmRequirement: odysseyState.realm as any,
                };
                setQuests(prev => [...prev, createdQuest]);
                setToasts(prev => [...prev, { id: Date.now(), title: 'New Quest Available!', message: `Forged from trend: ${item.title}`, icon: 'quest' }]);

                setWorkspaceHistory(prevHistory => {
                    const newHistory = JSON.parse(JSON.stringify(prevHistory));
                    const latestWorkspace = newHistory[newHistory.length - 1];
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
    }, [settings, addLog, ragIndex]);

    return {
        topic,
        setTopic,
        workspaceHistory,
        setWorkspaceHistory,
        timeLapseIndex,
        setTimeLapseIndex,
        isLoading,
        loadingMessage,
        error,
        hasSearched,
        setHasSearched,
        isSynthesizing,
        synthesisError,
        ragIndex,
        handleDispatchAgent,
        handleSynthesize,
        handleForgeQuest,
        handleTimeLapseChange,
        updateQuestProgress
    };
};