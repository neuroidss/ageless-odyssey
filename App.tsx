import React, { useState, useCallback, useEffect } from 'react';
import { type ModelDefinition, type WorkspaceState, AgentType, TrajectoryState, GamificationState, ToastMessage } from './types';
import { dispatchAgent, synthesizeFindings } from './services/geminiService';
import { getInitialTrajectory, applyIntervention } from './services/trajectoryService';
import { SUPPORTED_MODELS, ACHIEVEMENTS, XP_FOR_LEVEL, XP_VALUES } from './constants';
import Header from './components/Header';
import AgentControlPanel from './components/SearchBar';
import WorkspaceView from './components/ResultsDisplay';
import { ToastContainer } from './components/Toast';

const getInitialGamificationState = (): GamificationState => {
  const achievements = Object.entries(ACHIEVEMENTS).reduce((acc, [key, value]) => {
    acc[key] = { ...value, unlocked: false };
    return acc;
  }, {} as GamificationState['achievements']);
  
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: XP_FOR_LEVEL(1),
    longevityScore: 0,
    achievements,
  };
};

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [model, setModel] = useState<ModelDefinition>(SUPPORTED_MODELS[0]);
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);

  const [trajectoryState, setTrajectoryState] = useState<TrajectoryState | null>(null);

  // Gamification states
  const [gamification, setGamification] = useState<GamificationState>(getInitialGamificationState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [exploredTopics, setExploredTopics] = useState<Set<string>>(new Set());

  // Game Event Handler
  const handleGameEvent = useCallback((action: keyof typeof XP_VALUES | 'ACHIEVEMENT_CHECK', payload?: any) => {
    setGamification(prev => {
        let xpGained = 0;
        const newToasts: ToastMessage[] = [];
        let updatedState = JSON.parse(JSON.stringify(prev)); // Deep copy for mutation

        if(action !== 'ACHIEVEMENT_CHECK') {
            xpGained = XP_VALUES[action] || 0;
        }

        // --- Achievement Checks ---
        if (action === 'DISPATCH_AGENT' && !updatedState.achievements.FIRST_RESEARCH.unlocked) {
            updatedState.achievements.FIRST_RESEARCH.unlocked = true;
            const ach = updatedState.achievements.FIRST_RESEARCH;
            xpGained += ach.xp;
            newToasts.push({ id: Date.now(), title: 'Achievement Unlocked!', message: ach.name, icon: 'achievement' });
        }
        if (action === 'SYNTHESIZE' && !updatedState.achievements.SYNTHESIZER.unlocked) {
            updatedState.achievements.SYNTHESIZER.unlocked = true;
            const ach = updatedState.achievements.SYNTHESIZER;
            xpGained += ach.xp;
            newToasts.push({ id: Date.now(), title: 'Achievement Unlocked!', message: ach.name, icon: 'achievement' });
        }
        if (action === 'APPLY_INTERVENTION' && !updatedState.achievements.BIO_STRATEGIST.unlocked) {
            updatedState.achievements.BIO_STRATEGIST.unlocked = true;
            const ach = updatedState.achievements.BIO_STRATEGIST;
            xpGained += ach.xp;
            newToasts.push({ id: Date.now(), title: 'Achievement Unlocked!', message: ach.name, icon: 'achievement' });
        }
        if (payload?.knowledgeGraph?.nodes?.length >= 5 && !updatedState.achievements.KNOWLEDGE_ARCHITECT.unlocked) {
            updatedState.achievements.KNOWLEDGE_ARCHITECT.unlocked = true;
            const ach = updatedState.achievements.KNOWLEDGE_ARCHITECT;
            xpGained += ach.xp;
            newToasts.push({ id: Date.now(), title: 'Achievement Unlocked!', message: ach.name, icon: 'achievement' });
        }
        if (payload?.exploredTopicsCount >= 3 && !updatedState.achievements.HALLMARK_EXPLORER.unlocked) {
             updatedState.achievements.HALLMARK_EXPLORER.unlocked = true;
            const ach = updatedState.achievements.HALLMARK_EXPLORER;
            xpGained += ach.xp;
            newToasts.push({ id: Date.now(), title: 'Achievement Unlocked!', message: ach.name, icon: 'achievement' });
        }
        if (updatedState.longevityScore >= 550 && !updatedState.achievements.SCORE_MILESTONE_1.unlocked) {
             updatedState.achievements.SCORE_MILESTONE_1.unlocked = true;
            const ach = updatedState.achievements.SCORE_MILESTONE_1;
            xpGained += ach.xp;
            newToasts.push({ id: Date.now(), title: 'Achievement Unlocked!', message: ach.name, icon: 'achievement' });
        }
        
        // --- XP & Level Up ---
        if (xpGained > 0) {
            updatedState.xp += xpGained;
            while (updatedState.xp >= updatedState.xpToNextLevel) {
                updatedState.level += 1;
                updatedState.xp -= updatedState.xpToNextLevel;
                updatedState.xpToNextLevel = XP_FOR_LEVEL(updatedState.level);
                newToasts.push({ id: Date.now() + 1, title: 'Level Up!', message: `You've reached Level ${updatedState.level}!`, icon: 'levelup' });
            }
        }
        
        if (newToasts.length > 0) {
            setToasts(prevToasts => [...prevToasts, ...newToasts]);
        }
        
        return updatedState;
    });
  }, []);

  useEffect(() => {
    setTrajectoryState(getInitialTrajectory());
  }, []);

  // Effect to update score and check achievements when trajectory changes
  useEffect(() => {
    if (trajectoryState) {
        const biologicalAge = trajectoryState.overallScore.projection[0].value;
        const longevityScore = Math.max(0, (100 - biologicalAge) * 10);
        setGamification(prev => ({...prev, longevityScore}));
        handleGameEvent('ACHIEVEMENT_CHECK');
    }
  }, [trajectoryState, handleGameEvent]);

  // Effect to check graph-based achievements when workspace updates
  useEffect(() => {
    if (workspace) {
        handleGameEvent('ACHIEVEMENT_CHECK', { knowledgeGraph: workspace.knowledgeGraph });
    }
  }, [workspace, handleGameEvent]);

  const handleDispatchAgent = useCallback(async (agentType: AgentType) => {
    if (!topic.trim()) return;

    handleGameEvent('DISPATCH_AGENT');
    setIsLoading(true);
    setError(null);
    if (!hasSearched) setHasSearched(true);
    
    const currentWorkspace = workspace || {
        topic: topic,
        items: [],
        sources: [],
        knowledgeGraph: { nodes: [], edges: [] },
        synthesis: null,
    };

    try {
      const response = await dispatchAgent(topic, agentType, model);
      
      setWorkspace(prev => {
        const baseWorkspace = prev || currentWorkspace;
        const newItems = response.items.filter(newItem => !baseWorkspace.items.some(existing => existing.id === newItem.id));
        const newSources = response.sources?.filter(newSrc => !baseWorkspace.sources.some(existing => existing.uri === newSrc.uri)) ?? [];
        
        const newGraph = response.knowledgeGraph || baseWorkspace.knowledgeGraph;

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
        setError(e.message);
      } else {
        setError('An unknown agent error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [topic, model, hasSearched, workspace, handleGameEvent]);

  const handleSynthesize = useCallback(async () => {
    if (!workspace?.items || workspace.items.length === 0) return;

    handleGameEvent('SYNTHESIZE');
    setIsSynthesizing(true);
    setSynthesisError(null);
    setWorkspace(prev => prev ? {...prev, synthesis: null} : null);

    try {
      const response = await synthesizeFindings(workspace.topic, workspace.items, model);
      setWorkspace(prev => prev ? {...prev, synthesis: response} : null);
    } catch (e) {
      if (e instanceof Error) {
        setSynthesisError(e.message);
      } else {
        setSynthesisError('An unknown error occurred during synthesis.');
      }
    } finally {
      setIsSynthesizing(false);
    }
  }, [workspace, model, handleGameEvent]);
  
    const handleTopicChange = (newTopic: string) => {
        setTopic(newTopic);
        if (!exploredTopics.has(newTopic)) {
            const newExplored = new Set(exploredTopics).add(newTopic);
            setExploredTopics(newExplored);
            handleGameEvent('NEW_TOPIC');
            handleGameEvent('ACHIEVEMENT_CHECK', { exploredTopicsCount: newExplored.size });
        }
    }

  const handleApplyIntervention = useCallback((interventionId: string | null) => {
      if (!trajectoryState) return;
      const updatedState = applyIntervention(interventionId);
      setTrajectoryState(updatedState);
      if (interventionId) {
          handleGameEvent('APPLY_INTERVENTION');
      }
  }, [trajectoryState, handleGameEvent]);

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
          setModel={setModel}
        />
        <div className="mt-4">
          <WorkspaceView
            workspace={workspace}
            isLoading={isLoading && !workspace}
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
    </div>
  );
};

export default App;
