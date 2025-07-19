import { useState, useCallback } from 'react';
import { getInitialTrajectory } from '../services/trajectoryService';
import { QUESTS, DEFAULT_AGENT_BUDGET } from '../constants';

export const useDebugLog = () => {
    const [logs, setLogs] = useState<string[]>([]);
    
    const addLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const finalMessage = `[${timestamp}] ${message}`;
        console.log(finalMessage);
        setLogs(prev => [finalMessage, ...prev].slice(0, 100));
    }, []);

    const handleResetProgress = (
        setTopic: (t: string) => void,
        setWorkspaceHistory: (wh: any) => void,
        setTimeLapseIndex: (i: number) => void,
        setHasSearched: (b: boolean) => void,
        setTrajectoryState: (ts: any) => void,
        setOdysseyState: (os: any) => void,
        setQuests: (q: any) => void,
        setIsAutonomousMode: (b: boolean) => void,
        setAgentBudget: (n: number) => void,
        setAgentCallsMade: (n: number) => void,
        setBudgetResetTimestamp: (n: number) => void
    ) => {
        if (window.confirm("Are you sure you want to reset all progress? This will clear your workspace, trajectory, and achievements.")) {
            localStorage.removeItem('agelessOdysseyState');
            setTopic('');
            setWorkspaceHistory([]);
            setTimeLapseIndex(0);
            setHasSearched(false);
            setTrajectoryState(getInitialTrajectory());
            // Need a way to get the initial odyssey state here. This is a dependency issue.
            // For now, we can't reset odyssey state from here without causing import cycles or prop drilling.
            // setOdysseyState(getInitialOdysseyState());
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
            // This also needs access to the state setters.
            // setAgentCallsMade(0);
            // setBudgetResetTimestamp(Date.now());
            addLog("Autonomous agent budget reset for the current cycle. (Note: Needs wiring to state setters)");
        }
    };

    return { logs, addLog, handleResetProgress, handleResetBudget };
};
