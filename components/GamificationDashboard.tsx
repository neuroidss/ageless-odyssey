import React, { useState } from 'react';
import { GamificationState, Realm } from '../types';
import { TrophyIcon, DnaIcon, MemicIcon, CognitiveIcon } from './icons';
import { REALM_DEFINITIONS } from '../constants';

const AchievementCard: React.FC<{ achievement: GamificationState['achievements'][string] }> = ({ achievement }) => {
    return (
        <div className={`p-4 border rounded-lg flex items-center gap-4 transition-opacity ${achievement.unlocked ? 'border-yellow-500/50 bg-yellow-900/20' : 'border-slate-700 bg-slate-800/50 opacity-60'}`}>
            <TrophyIcon className={`h-8 w-8 flex-shrink-0 ${achievement.unlocked ? 'text-yellow-400' : 'text-slate-500'}`} />
            <div>
                <h4 className={`font-bold ${achievement.unlocked ? 'text-slate-100' : 'text-slate-400'}`}>{achievement.name}</h4>
                <p className="text-sm text-slate-400">{achievement.description}</p>
            </div>
        </div>
    );
};

const VectorDisplay: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
    <div className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-900/50">
        <div className={`h-8 w-8 ${color}`}>{icon}</div>
        <div className="text-sm font-semibold text-slate-300">{label}</div>
        <div className={`text-xl font-bold ${color}`}>{Math.round(value)}</div>
    </div>
);


const GamificationDashboard: React.FC<{ gamification: GamificationState }> = ({ gamification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const realmInfo = REALM_DEFINITIONS.find(r => r.realm === gamification.realm)!;

    return (
        <>
            <div className="w-full max-w-2xl p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col gap-4 shadow-lg">
                <div className="text-center">
                    <div className="text-sm text-purple-300 font-semibold tracking-wider">CURRENT REALM</div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">{realmInfo.realm}</h2>
                    <p className="text-xs text-slate-400 mt-1">{realmInfo.description}</p>
                </div>
                
                <div className="flex items-stretch justify-center gap-3 pt-3 border-t border-slate-700">
                    <VectorDisplay icon={<DnaIcon />} label="Genetic Legacy" value={gamification.vectors.genetic} color="text-teal-400" />
                    <VectorDisplay icon={<MemicIcon />} label="Memic Influence" value={gamification.vectors.memic} color="text-blue-400" />
                    <VectorDisplay icon={<CognitiveIcon />} label="Cognitive Integrity" value={gamification.vectors.cognitive} color="text-yellow-400" />
                </div>

                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 w-full py-2 bg-slate-700/70 hover:bg-slate-700 rounded-lg font-semibold text-sm text-slate-300 flex items-center justify-center gap-2"
                    aria-label="View Achievements"
                >
                    <TrophyIcon className="h-4 w-4 text-yellow-400" />
                    View Achievements
                </button>
            </div>

            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-2xl bg-slate-800 border border-slate-600 rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-3xl font-bold text-slate-100 mb-6 text-center">Your Achievements</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {Object.values(gamification.achievements).sort((a,b) => (a.unlocked === b.unlocked) ? 0 : a.unlocked ? -1 : 1).map(ach => (
                                <AchievementCard key={ach.id} achievement={ach} />
                            ))}
                        </div>
                         <button 
                            onClick={() => setIsModalOpen(false)}
                            className="mt-6 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default GamificationDashboard;