import React, { useState } from 'react';
import { Quest } from '../types';
import { QuestIcon, TrophyIcon, LinkIcon } from './icons';

const QuestCard: React.FC<{ quest: Quest }> = ({ quest }) => {
    const isCompleted = quest.status === 'completed';
    const isLocked = quest.status === 'locked';

    const baseClasses = 'border rounded-lg p-4 transition-all duration-300';
    const stateClasses = isCompleted 
        ? 'bg-green-900/20 border-green-500/30' 
        : isLocked
        ? 'bg-slate-800/50 border-slate-700/50 opacity-60'
        : 'bg-slate-700/50 border-slate-600 hover:border-purple-500/50';

    return (
        <div className={`${baseClasses} ${stateClasses}`}>
            <div className="flex justify-between items-start gap-3">
                <div className="flex-grow">
                    <h4 className={`font-bold ${isLocked ? 'text-slate-400' : 'text-slate-100'}`}>{quest.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                </div>
                <div className="flex-shrink-0">
                    {isCompleted ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-900/50 px-2 py-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Completed
                        </span>
                    ) : isLocked ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-900/50 px-2 py-1 rounded-full">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            Locked
                        </span>
                    ) : (
                         <span className="flex items-center gap-1 text-xs font-bold text-purple-400 bg-purple-900/50 px-2 py-1 rounded-full">
                            Available
                        </span>
                    )}
                </div>
            </div>
            
            {!isLocked && (
                 <div className="mt-4 pt-3 border-t border-slate-700/80">
                    <div>
                        <h5 className="text-xs font-semibold text-slate-300 mb-1">Objective:</h5>
                        <p className="text-sm text-slate-300 bg-slate-800/60 p-2 rounded-md">
                            Use the <span className="font-bold text-blue-300">{quest.objective.agent}</span> to research topics related to <span className="font-bold text-purple-300">"{quest.objective.topicKeywords.join(', ')}"</span>.
                        </p>
                    </div>

                    {quest.citations.length > 0 && (
                        <div className="mt-3">
                            <h5 className="text-xs font-semibold text-slate-300 mb-1">Scientific Basis:</h5>
                            <div className="space-y-1">
                                {quest.citations.map(citation => (
                                    <a 
                                        key={citation.url} 
                                        href={citation.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-start gap-2 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                                    >
                                        <LinkIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span className="truncate" title={citation.title}>{citation.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-3 flex items-center justify-end gap-4 text-xs">
                        <span className="text-slate-400">Reward:</span>
                        <div className="flex items-center gap-1 font-semibold text-yellow-400">
                             <TrophyIcon className="h-4 w-4" />
                            {quest.reward.xp} XP
                        </div>
                         {quest.unlocksIntervention && (
                            <div className="flex items-center gap-1 font-semibold text-green-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                                Unlocks Intervention
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface QuestLogProps {
    quests: Quest[];
}

const QuestLog: React.FC<QuestLogProps> = ({ quests }) => {
    const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');

    const availableQuests = quests.filter(q => q.status === 'available' || q.status === 'locked');
    const completedQuests = quests.filter(q => q.status === 'completed');

    const sortedAvailable = [...availableQuests].sort((a,b) => (a.status === b.status) ? 0 : a.status === 'available' ? -1 : 1);

    const TabButton: React.FC<{ tabName: 'available' | 'completed', count: number, children: React.ReactNode }> = ({ tabName, count, children }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tabName ? 'text-purple-300 border-purple-400' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
        >
            {children} <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${activeTab === tabName ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-600/50 text-slate-300'}`}>{count}</span>
        </button>
    );

    return (
        <div className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4">
                <QuestIcon className="h-8 w-8 text-green-300" />
                <h2 className="text-2xl font-bold text-slate-100 text-center sm:text-left">
                    Research Quests
                </h2>
            </div>
            <p className="text-slate-400 text-center sm:text-left mb-4">
                Complete quests to gather data, prove hypotheses, and unlock new capabilities on your journey.
            </p>

            <div className="border-b border-slate-700">
                 <TabButton tabName="available" count={availableQuests.length}>Available</TabButton>
                 <TabButton tabName="completed" count={completedQuests.length}>Completed</TabButton>
            </div>
            
            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {activeTab === 'available' && (
                    sortedAvailable.length > 0
                        ? sortedAvailable.map(quest => <QuestCard key={quest.id} quest={quest} />)
                        : <p className="text-center text-slate-500 py-4">No new quests available. Progress to the next Realm to unlock more.</p>
                )}
                {activeTab === 'completed' && (
                    completedQuests.length > 0
                        ? completedQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
                        : <p className="text-center text-slate-500 py-4">No quests completed yet.</p>
                )}
            </div>
        </div>
    );
};

export default QuestLog;