import React, { useState } from 'react';
import { GamificationState } from '../types';
import { TrophyIcon } from './icons';

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


const GamificationDashboard: React.FC<{ gamification: GamificationState }> = ({ gamification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const xpPercentage = gamification.xpToNextLevel > 0 ? (gamification.xp / gamification.xpToNextLevel) * 100 : 0;

    return (
        <>
            <div className="w-full max-w-sm p-3 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-lg text-slate-200">Level {gamification.level}</span>
                        <span className="text-xs text-slate-400">{gamification.xp} / {gamification.xpToNextLevel} XP</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                    </div>
                </div>
                <div className="text-center px-4 border-l border-r border-slate-600">
                    <div className="text-xs text-slate-400">Score</div>
                    <div className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{Math.round(gamification.longevityScore)}</div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition"
                    aria-label="View Achievements"
                >
                    <TrophyIcon className="h-6 w-6 text-yellow-400" />
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
