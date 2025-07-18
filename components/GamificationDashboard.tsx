import React, { useState } from 'react';
import { OdysseyState, Realm, RealmDefinition } from '../types';
import { TrophyIcon, GeneticIcon, MemicIcon, CognitiveBandwidthIcon, ShellIcon, BiologicalOptimizerIcon, SubstrateEnhancedIcon, ExocortexIntegratorIcon, DigitalAscendantIcon, DistributedEntityIcon, StellarMetamorphIcon, AscensionIcon, OracleIcon } from './icons';

const AchievementCard: React.FC<{ achievement: OdysseyState['achievements'][string] }> = ({ achievement }) => {
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

const VectorDisplay: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string; progress?: number; required?: number; }> = ({ icon, label, value, color, progress, required }) => (
    <div className="flex flex-col items-center text-center">
        <div className={`h-7 w-7 mb-1 ${color}`}>{icon}</div>
        <div className="text-xs font-semibold text-slate-300">{label}</div>
        <div className={`text-lg font-bold ${color}`}>{Math.round(value)}{required ? ` / ${required}`: ''}</div>
        {progress !== undefined && (
            <div className="w-16 h-1.5 bg-slate-700 rounded-full mt-1">
                <div className={`h-full rounded-full ${color.replace('text','bg')}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
        )}
    </div>
);

const realmIcons: Record<string, React.FC<{className?: string}>> = {
    [Realm.MortalShell]: ShellIcon,
    [Realm.BiologicalOptimizer]: BiologicalOptimizerIcon,
    [Realm.SubstrateEnhanced]: SubstrateEnhancedIcon,
    [Realm.ExocortexIntegrator]: ExocortexIntegratorIcon,
    [Realm.DigitalAscendant]: DigitalAscendantIcon,
    [Realm.DistributedEntity]: DistributedEntityIcon,
    [Realm.StellarMetamorph]: StellarMetamorphIcon,
};

const OdysseyMap: React.FC<{ odysseyState: OdysseyState, dynamicRealmDefinitions: RealmDefinition[], isOracleLoading: boolean }> = ({ odysseyState, dynamicRealmDefinitions, isOracleLoading }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Find index based on the dynamic list
    const currentRealmIndex = dynamicRealmDefinitions.findIndex(r => r.realm === odysseyState.realm);
    const currentRealmDef = dynamicRealmDefinitions[currentRealmIndex];
    const nextRealmDef = dynamicRealmDefinitions[currentRealmIndex + 1];

    // Fallback icon for dynamically generated realms
    const getRealmIcon = (realmName: string) => {
        return realmIcons[realmName] || AscensionIcon;
    };

    return (
        <>
            <div className="w-full max-w-4xl p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col gap-4 shadow-lg">
                <h2 className="text-center text-2xl font-bold text-slate-200">The Odyssey Map</h2>
                
                {/* Realm Progression Map */}
                <div className="relative flex items-center justify-between w-full px-4 sm:px-8 py-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -translate-y-1/2"></div>
                    {dynamicRealmDefinitions.map((def, index) => {
                        const isCurrent = index === currentRealmIndex;
                        const isUnlocked = index <= currentRealmIndex;
                        const RealmIcon = getRealmIcon(def.realm);
                        return (
                             <div key={def.realm} className="relative z-10 flex flex-col items-center group">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isCurrent ? 'bg-purple-500 border-purple-300 scale-110' : isUnlocked ? 'bg-slate-600 border-slate-500' : 'bg-slate-800 border-slate-700'}`}>
                                    <RealmIcon className={`h-6 w-6 ${isUnlocked ? 'text-slate-100' : 'text-slate-500'}`} />
                                </div>
                                <div className="absolute bottom-full mb-2 w-64 p-3 text-left bg-slate-900 border border-slate-600 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                                    <h4 className="font-bold text-slate-100 text-center">{def.realm}</h4>
                                    <p className="text-xs text-slate-400 mt-1 mb-2 text-center">{def.description}</p>
                                    <div className="mt-2 pt-2 border-t border-slate-700">
                                        <h5 className="text-xs font-semibold text-slate-300 mb-1">Ascension Criteria:</h5>
                                        <ul className="list-disc list-inside space-y-1">
                                            {def.criteria.map(criterion => (
                                                <li key={criterion} className="text-xs text-slate-400">
                                                    {criterion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                             </div>
                        );
                    })}
                </div>

                {/* Current Realm & Next Goal */}
                <div className="pt-4 mt-2 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="text-center md:text-left">
                        <div className="text-sm text-purple-300 font-semibold tracking-wider">CURRENT REALM</div>
                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">{odysseyState.realm}</h3>
                        <p className="text-xs text-slate-400 mt-1">{currentRealmDef?.description || 'A new state of being...'}</p>
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                        {nextRealmDef ? (
                            <>
                                <h4 className="text-center font-semibold text-slate-300 mb-3">Progress to: <span className="text-purple-300">{nextRealmDef.realm}</span></h4>
                                <div className="flex items-start justify-around gap-3">
                                    <VectorDisplay icon={<GeneticIcon />} label="Bio Control" value={odysseyState.vectors.genetic} required={nextRealmDef.thresholds.genetic} color="text-teal-400" progress={(odysseyState.vectors.genetic / nextRealmDef.thresholds.genetic) * 100} />
                                    <VectorDisplay icon={<MemicIcon />} label="Knowledge" value={odysseyState.vectors.memic} required={nextRealmDef.thresholds.memic} color="text-blue-400" progress={(odysseyState.vectors.memic / nextRealmDef.thresholds.memic) * 100}/>
                                    <VectorDisplay icon={<CognitiveBandwidthIcon />} label="Cognition" value={odysseyState.vectors.cognitive} required={nextRealmDef.thresholds.cognitive} color="text-yellow-400" progress={(odysseyState.vectors.cognitive / nextRealmDef.thresholds.cognitive) * 100}/>
                                </div>
                            </>
                        ) : isOracleLoading ? (
                             <div className="text-center flex flex-col items-center gap-2 animate-pulse">
                                <OracleIcon className="h-10 w-10 text-cyan-300" />
                                <h4 className="font-bold text-xl text-slate-200">The Oracle is contemplating...</h4>
                                <p className="text-sm text-slate-400">A new path is being revealed.</p>
                             </div>
                        ) : (
                             <div className="text-center flex flex-col items-center gap-2">
                                <AscensionIcon className="h-10 w-10 text-yellow-300" />
                                <h4 className="font-bold text-xl text-slate-200">You have reached the final frontier.</h4>
                                <p className="text-sm text-slate-400">The journey continues beyond the known.</p>
                             </div>
                        )}
                    </div>
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
                            {Object.values(odysseyState.achievements).sort((a,b) => (a.unlocked === b.unlocked) ? 0 : a.unlocked ? -1 : 1).map(ach => (
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

export default OdysseyMap;