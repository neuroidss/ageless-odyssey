import { useState, useEffect, useCallback } from 'react';
import { 
    type OdysseyState, type Quest, type TrajectoryState, type ToastMessage, type RealmDefinition, 
    type ModelDefinition, Realm, WorkspaceState 
} from '../types';
import { getInitialTrajectory, applyIntervention } from '../services/trajectoryService';
import { callAscensionOracle } from '../services/geminiService';
import { ACHIEVEMENTS, QUESTS, REALM_DEFINITIONS, SUPPORTED_MODELS } from '../constants';

const getInitialOdysseyState = (): OdysseyState => {
  const achievements = Object.entries(ACHIEVEMENTS).reduce((acc, [key, value]) => {
    acc[key] = { ...value, unlocked: false };
    return acc;
  }, {} as OdysseyState['achievements']);
  
  return {
    realm: Realm.MortalShell,
    vectors: { genetic: 0, memic: 0, cognitive: 0 },
    benchmarkScore: 0,
    longevityScore: 0,
    achievements,
  };
};

export const useOdysseyLogic = (model: ModelDefinition, apiKey: string, addLog: (msg: string) => void, storageKey: string) => {
    const [odysseyState, setOdysseyState] = useState<OdysseyState>(getInitialOdysseyState());
    const [quests, setQuests] = useState<Quest[]>(QUESTS);
    const [trajectoryState, setTrajectoryState] = useState<TrajectoryState | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [dynamicRealmDefinitions, setDynamicRealmDefinitions] = useState<RealmDefinition[]>([...REALM_DEFINITIONS].reverse());
    const [isOracleLoading, setIsOracleLoading] = useState<boolean>(false);

    // Load state from storage on mount
    useEffect(() => {
        try {
            const savedStateJSON = localStorage.getItem(storageKey);
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                if (savedState.trajectoryState) setTrajectoryState(savedState.trajectoryState);
                if (savedState.odysseyState) setOdysseyState(savedState.odysseyState);
                if (savedState.quests) setQuests(savedState.quests);
                if (savedState.dynamicRealmDefinitions) setDynamicRealmDefinitions(savedState.dynamicRealmDefinitions);
            } else {
                const initialState = getInitialTrajectory();
                setTrajectoryState(initialState);
                const biologicalAge = initialState.overallScore.projection[0].value;
                const longevityScore = Math.max(0, (100 - biologicalAge) * 10);
                setOdysseyState(prev => ({...prev, longevityScore, vectors: {...prev.vectors, cognitive: longevityScore}}));
            }
        } catch (error) {
            addLog(`Failed to load odyssey state from localStorage: ${error}. Starting fresh.`);
            localStorage.removeItem(storageKey);
            setTrajectoryState(getInitialTrajectory());
        }
    }, [addLog, storageKey]);

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
                        if (quest.reward.benchmark) newBenchmarkScore += quest.reward.benchmark;
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

            if (nextRealmDef && 
                updatedOdysseyState.vectors.cognitive >= nextRealmDef.thresholds.cognitive && 
                updatedOdysseyState.vectors.genetic >= nextRealmDef.thresholds.genetic && 
                updatedOdysseyState.vectors.memic >= nextRealmDef.thresholds.memic) {
                
                updatedOdysseyState.realm = nextRealmDef.realm;
                newToasts.push({ id: Date.now(), title: 'Realm Ascension!', message: `You have ascended to the Realm of the ${nextRealmDef.realm}.`, icon: 'ascension' });
                
                if (!newAchievements.REALM_ASCENSION.unlocked && nextRealmDef.realm === Realm.BiologicalOptimizer) {
                    newAchievements.REALM_ASCENSION.unlocked = true;
                }
            } else if (!nextRealmDef && !isOracleLoading) { // At the final frontier, call the oracle
                setIsOracleLoading(true);
                addLog("Reached final frontier. Calling Ascension Oracle...");
                const googleAIModel = model.provider === 'Google AI' ? model : SUPPORTED_MODELS.find(m => m.provider === 'Google AI')!;

                callAscensionOracle(updatedOdysseyState, (payload?.workspace as WorkspaceState), trajectoryState, googleAIModel, apiKey, addLog)
                    .then(newRealm => {
                        setDynamicRealmDefinitions(prev => [...prev, newRealm]);
                        // Ascend immediately
                        setOdysseyState(prev => ({...prev, realm: newRealm.realm}));
                        setToasts(t => [...t, { id: Date.now(), title: 'The Oracle Has Spoken!', message: `A new path is revealed: The Realm of ${newRealm.realm}.`, icon: 'oracle' }]);
                    })
                    .catch(err => {
                        // Can't call setError from here, so just log it. The UI can show a toast.
                        addLog(`ORACLE ERROR: ${err.message}`);
                        setToasts(t => [...t, { id: Date.now(), title: 'Oracle Error', message: `The Oracle failed: ${err.message}` }]);
                    })
                    .finally(() => setIsOracleLoading(false));
            }

            if (newToasts.length > 0) setToasts(prevToasts => [...prevToasts, ...newToasts.filter(t => t.id > (prevToasts[prevToasts.length - 1]?.id || 0))]);
            
            return updatedOdysseyState;
        });
    }, [dynamicRealmDefinitions, isOracleLoading, apiKey, model, addLog, trajectoryState]);

    const handleApplyIntervention = (interventionId: string | null) => {
        if (!trajectoryState) return;
        const newState = applyIntervention(trajectoryState, interventionId);
        setTrajectoryState(newState);
        
        const newBioAge = newState.overallScore.interventionProjection?.[0].value ?? newState.overallScore.projection[0].value;
        updateAscensionState('UPDATE_LONGEVITY_SCORE', { biologicalAge: newBioAge });
        
        addLog(`Applied intervention: ${interventionId || 'None'}`);
    };
    
    const handleQuestCompletion = useCallback((quest: Quest) => {
        addLog(`Quest Completed: ${quest.title}`);
        setToasts(prev => [...prev, { id: Date.now(), title: "Quest Complete!", message: quest.title, icon: 'quest' }]);
        updateAscensionState('QUEST_COMPLETED', { quest });

        if (quest.unlocksAchievement) {
            updateAscensionState('UNLOCK_ACHIEVEMENT', { achievementId: quest.unlocksAchievement });
        }

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

    return {
        odysseyState,
        quests,
        trajectoryState,
        toasts,
        isOracleLoading,
        dynamicRealmDefinitions,
        setOdysseyState,
        setQuests,
        setTrajectoryState,
        setToasts,
        setDynamicRealmDefinitions,
        handleApplyIntervention,
        handleQuestCompletion,
        updateAscensionState,
    };
};