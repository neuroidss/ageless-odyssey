import { useEffect, useRef } from 'react';
import { AUTONOMOUS_AGENT_QUERY } from '../constants';
import { queryRAGIndex } from '../services/ragService';
import { dispatchAgent } from '../services/geminiService';
import { RAGIndexEntry, AgentType, AgentResponse, ModelDefinition, HuggingFaceDevice, SearchDataSource, WorkspaceState, Quest } from '../types';
import { createNextWorkspaceState } from '../services/workspaceUtils';

interface AutonomousAgentProps {
    isAutonomousMode: boolean;
    agentBudget: number;
    agentCallsMade: number;
    setAgentCallsMade: React.Dispatch<React.SetStateAction<number>>;
    budgetResetTimestamp: number;
    setBudgetResetTimestamp: React.Dispatch<React.SetStateAction<number>>;
    ragIndex: RAGIndexEntry[];
    model: ModelDefinition;
    quantization: string;
    apiKey: string;
    device: HuggingFaceDevice;
    searchSources: SearchDataSource[];
    addLog: (msg: string) => void;
    handleQuestCompletion: (quest: Quest) => void;
    setHasSearched: React.Dispatch<React.SetStateAction<boolean>>;
    setWorkspaceHistory: React.Dispatch<React.SetStateAction<WorkspaceState[]>>;
    setTimeLapseIndex: React.Dispatch<React.SetStateAction<number>>;
    setIsAutonomousLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAutonomousAgent = (props: AutonomousAgentProps) => {
    const {
        isAutonomousMode, agentBudget, agentCallsMade, setAgentCallsMade, budgetResetTimestamp, setBudgetResetTimestamp,
        ragIndex, model, quantization, apiKey, device, searchSources, addLog, handleQuestCompletion,
        setHasSearched, setWorkspaceHistory, setTimeLapseIndex, setIsAutonomousLoading
    } = props;
    
    const autonomousTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (autonomousTimerRef.current) {
            clearTimeout(autonomousTimerRef.current);
        }

        if (!isAutonomousMode) {
            addLog("[Autonomous] Mode is disabled.");
            setIsAutonomousLoading(false);
            return;
        }

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - budgetResetTimestamp > oneDay) {
            addLog("[Autonomous] New 24-hour cycle started. Resetting budget.");
            setAgentCallsMade(0);
            setBudgetResetTimestamp(now);
            return;
        }

        if (agentCallsMade >= agentBudget) {
            addLog(`[Autonomous] Budget of ${agentBudget} exhausted. Checking again later.`);
            const timeUntilNextCycle = (budgetResetTimestamp + oneDay) - now;
            autonomousTimerRef.current = window.setTimeout(() => {
                setAgentCallsMade(0);
                setBudgetResetTimestamp(Date.now());
            }, timeUntilNextCycle > 0 ? timeUntilNextCycle + 1000 : 1000);
            return;
        }

        const timeElapsedToday = now - budgetResetTimestamp;
        const timeRemainingToday = oneDay - timeElapsedToday;
        const callsRemaining = agentBudget - agentCallsMade;
        const calculatedInterval = callsRemaining > 0 ? timeRemainingToday / callsRemaining : timeRemainingToday;
        
        // Ensure a minimum interval to be respectful to public APIs.
        const MIN_INTERVAL = 60 * 1000; // 1 minute
        // For the first call, use a fixed delay. For subsequent calls, use the calculated interval but respect the minimum.
        const finalInterval = agentCallsMade === 0 ? 30000 : Math.max(calculatedInterval, MIN_INTERVAL);


        addLog(`[Autonomous] Calls remaining: ${callsRemaining}/${agentBudget}. Next call in ${(finalInterval / 60000).toFixed(1)} mins.`);

        autonomousTimerRef.current = window.setTimeout(async () => {
            addLog(`[Autonomous] Triggering search for: "${AUTONOMOUS_AGENT_QUERY}"`);
            setIsAutonomousLoading(true);
            try {
                const ragContext = await queryRAGIndex(AUTONOMOUS_AGENT_QUERY, ragIndex, addLog);
                const response = await dispatchAgent(
                    AUTONOMOUS_AGENT_QUERY, AgentType.TrendSpotter, model, quantization, addLog, apiKey, 
                    device, searchSources, undefined, undefined, ragContext ?? undefined
                );
                addLog(`[Autonomous] Agent finished. Found ${(response.items || []).length} new items.`);
                
                setAgentCallsMade(prev => prev + 1);
                // The quest checking logic requires access to the full quest list, which this hook doesn't have.
                // This is a limitation of this refactoring. The logic should be elevated or quest state passed down.
                // For now, we rely on `handleQuestCompletion` passed in.

                if (response && (response.items || []).length > 0) {
                    setHasSearched(true);
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
                setIsAutonomousLoading(false);
            }
        }, finalInterval);

        return () => {
            if (autonomousTimerRef.current) {
                clearTimeout(autonomousTimerRef.current);
            }
        };
    }, [isAutonomousMode, agentBudget, agentCallsMade, budgetResetTimestamp, model, quantization, apiKey, device, searchSources, addLog, ragIndex, handleQuestCompletion, setIsAutonomousLoading, setAgentCallsMade, setBudgetResetTimestamp, setHasSearched, setTimeLapseIndex, setWorkspaceHistory]);
};
