import React, { useState } from 'react';
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
import { InterventionMarketplace } from './components/InterventionMarketplace';
import { AgentType, MarketplaceIntervention, RAndDStage } from './types';
import { MARKETPLACE_INTERVENTIONS } from './constants';
import PortfolioView from './components/PortfolioView';

const APP_STATE_STORAGE_KEY = 'agelessOdysseyState';

const App: React.FC = () => {
    const { logs, addLog, handleResetProgress, handleResetBudget } = useDebugLog();
    
    const settings = useAppSettings(addLog, APP_STATE_STORAGE_KEY);
    
    const [dispatchingStageId, setDispatchingStageId] = useState<string | null>(null);
    
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
        handleStageCompletion,
        handleAddToCart,
        handleAddToPortfolio,
        handleExecutePlan,
        handleFinalizeInvestments,
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
        updateQuestProgress,
    } = useWorkspaceManager(settings, addLog, APP_STATE_STORAGE_KEY);
    
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
    
    const handleGeneralDispatch = async (agentType: AgentType) => {
        const response = await handleDispatchAgent({ agentType });
        if(response) {
            updateQuestProgress(topic, agentType, response, quests, handleQuestCompletion);
        }
    };

    const handleFundAndDispatchStage = async (interventionId: string, stageId: string) => {
        const intervention = MARKETPLACE_INTERVENTIONS.find(i => i.id === interventionId);
        if (!intervention) return;
        
        const stage = [...intervention.researchStages, ...intervention.engineeringStages].find(s => s.id === stageId);
        if (!stage) return;

        if (odysseyState.vectors.memic < stage.complexity) {
            setToasts(t => [...t, { id: Date.now(), title: 'Funding Failed', message: 'Insufficient Memic points to complete this R&D stage.', icon: 'error' }]);
            return;
        }
        
        setDispatchingStageId(stageId);
        const query = stage.strategistPrompt || stage.description;
        const response = await handleDispatchAgent({ agentType: stage.agent, query: query });

        if (response) {
            setToasts(prev => [...prev, { id: Date.now(), title: 'R&D Complete!', message: `Agent ${stage.agent} succeeded.`, icon: 'success' }]);
            handleStageCompletion(interventionId, stage);
        }
        // If response is null, the error is already set by useWorkspaceManager
        setDispatchingStageId(null);
    }


    const currentWorkspace = workspaceHistory[timeLapseIndex];
  
    const Dashboard = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start">
            <div className="lg:col-span-1 flex flex-col gap-8 lg:sticky lg:top-8">
                <PortfolioView 
                    odysseyState={odysseyState} 
                    onExecutePlan={handleExecutePlan} 
                    onFinalizeInvestments={handleFinalizeInvestments}
                />
                <QuestLog quests={quests} />
                <InterventionMarketplace
                    odysseyState={odysseyState}
                    onDispatchAgent={handleFundAndDispatchStage}
                    dispatchingStageId={dispatchingStageId}
                    onAddToCart={handleAddToCart}
                    onAddToPortfolio={handleAddToPortfolio}
                />
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
                    onDispatchAgent={(agentType) => handleGeneralDispatch(agentType)}
                    isLoading={isLoading || isSynthesizing || isOracleLoading || settings.isAutonomousLoading || !!dispatchingStageId}
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