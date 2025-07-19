import React from 'react';
import { useAppSettings } from './hooks/useAppSettings';
import { useOdysseyLogic } from './hooks/useOdysseyLogic';
import { useWorkspaceManager } from './hooks/useWorkspaceManager';
import { useAutonomousAgent } from './hooks/useAutonomousAgent';
import { useDebugLog } from './hooks/useDebugLog';

import Header from './components/Header';
import AgentControlPanel from './components/SearchBar';
import WorkspaceView from './components/ResultsDisplay';
import { ToastContainer } from './components/Toast';
import DebugLogView from './components/DebugLogView';
import QuestLog from './components/QuestLog';

const APP_STATE_STORAGE_KEY = 'agelessOdysseyState';

const App: React.FC = () => {
    const { logs, addLog, handleResetProgress, handleResetBudget } = useDebugLog();
    
    const settings = useAppSettings(addLog, APP_STATE_STORAGE_KEY);
    
    const { 
        odysseyState, 
        quests, 
        trajectoryState, 
        toasts,
        setToasts,
        isOracleLoading, 
        dynamicRealmDefinitions,
        handleApplyIntervention, 
        handleQuestCompletion,
        updateAscensionState,
        setQuests,
        setTrajectoryState,
        setOdysseyState,
        setDynamicRealmDefinitions,
    } = useOdysseyLogic(settings.model, settings.apiKey, addLog, APP_STATE_STORAGE_KEY);

    const {
        topic,
        setTopic,
        workspaceHistory,
        timeLapseIndex,
        isLoading,
        loadingMessage,
        error,
        hasSearched,
        isSynthesizing,
        synthesisError,
        ragIndex,
        handleDispatchAgent,
        handleSynthesize,
        handleForgeQuest,
        handleTimeLapseChange,
        setWorkspaceHistory,
        setTimeLapseIndex,
        setHasSearched,
    } = useWorkspaceManager(settings, addLog, handleQuestCompletion, APP_STATE_STORAGE_KEY);
    
    useAutonomousAgent({
        isAutonomousMode: settings.isAutonomousMode,
        agentBudget: settings.agentBudget,
        agentCallsMade: settings.agentCallsMade,
        budgetResetTimestamp: settings.budgetResetTimestamp,
        setAgentCallsMade: settings.setAgentCallsMade,
        setBudgetResetTimestamp: settings.setBudgetResetTimestamp,
        ragIndex,
        model: settings.model,
        quantization: settings.quantization,
        apiKey: settings.apiKey,
        device: settings.device,
        searchSources: settings.searchSources,
        addLog,
        handleQuestCompletion,
        setHasSearched,
        setWorkspaceHistory,
        setTimeLapseIndex,
        setIsAutonomousLoading: settings.setIsAutonomousLoading,
    });

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
                    onSynthesize={() => handleSynthesize(trajectoryState, updateAscensionState)}
                    onForgeQuest={(item) => handleForgeQuest(item, odysseyState, setQuests, setToasts, setWorkspaceHistory)}
                    trajectoryState={trajectoryState}
                    onApplyIntervention={handleApplyIntervention}
                    loadingMessage={loadingMessage}
                    isAutonomousMode={settings.isAutonomousMode}
                    isAutonomousLoading={settings.isAutonomousLoading}
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
                    isLoading={isLoading || isSynthesizing || isOracleLoading || settings.isAutonomousLoading}
                    model={settings.model}
                    setModel={settings.handleModelChange}
                    apiKey={settings.apiKey}
                    onApiKeyChange={settings.handleApiKeyChange}
                    quantization={settings.quantization}
                    setQuantization={settings.setQuantization}
                    device={settings.device}
                    setDevice={settings.setDevice}
                    isAutonomousMode={settings.isAutonomousMode}
                    setIsAutonomousMode={settings.setIsAutonomousMode}
                    agentBudget={settings.agentBudget}
                    setAgentBudget={settings.setAgentBudget}
                    agentCallsMade={settings.agentCallsMade}
                    gpuFeatures={settings.gpuFeatures}
                    searchSources={settings.searchSources}
                    onToggleSearchSource={settings.handleToggleSearchSource}
                />
                <Dashboard />
            </div>
            <ToastContainer 
                toasts={toasts}
                onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
            />
            <DebugLogView 
                logs={logs} 
                onReset={() => handleResetProgress(
                    setTopic, setWorkspaceHistory, setTimeLapseIndex, setHasSearched, 
                    setTrajectoryState, setOdysseyState, setQuests, settings.setIsAutonomousMode, 
                    settings.setAgentBudget, settings.setAgentCallsMade, settings.setBudgetResetTimestamp
                )} 
                onResetBudget={handleResetBudget} 
            />
        </main>
    );
};

export default App;
