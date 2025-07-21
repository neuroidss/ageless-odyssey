import React, { useState, useRef } from 'react';
import { MarketplaceIntervention, RAndDStage, AgentType, OdysseyState, Evidence, HypeCyclePhase } from '../types';
import { MARKETPLACE_INTERVENTIONS } from '../constants';
import { 
    CartIcon, MemicIcon, PillIcon, TherapyIcon, PresentationChartLineIcon, 
    LinkIcon, BeakerIcon, UserGroupIcon, DocumentTextIcon, ChevronDownIcon,
    MicroscopeIcon, WrenchScrewdriverIcon, LightbulbIcon, ClipboardDocumentCheckIcon, AgentIcon,
    GeneAnalystIcon, CompoundAnalystIcon, SingularityIcon, GeneticIcon, SystemClarityIcon
} from './icons';

interface InterventionMarketplaceProps {
    odysseyState: OdysseyState;
    onDispatchAgent: (interventionId: string, stageId: string) => void;
    dispatchingStageId: string | null;
}

const InterventionTypeIcon: React.FC<{ type: MarketplaceIntervention['type'], className?: string }> = ({ type, className = "h-8 w-8" }) => {
    switch (type) {
        case 'supplement': return <PillIcon className={className} />;
        case 'therapy': return <TherapyIcon className={className} />;
        case 'diagnostic': return <PresentationChartLineIcon className={className} />;
        case 'consultation': return <LightbulbIcon className={className} />;
        case 'theoretical': return <BeakerIcon className={`${className} text-purple-400`} />;
        default: return <PillIcon className={className} />;
    }
};

const StageStatusIcon: React.FC<{ status: 'Completed' | 'Blocked' | 'In Progress', className?: string }> = ({ status, className = 'h-5 w-5'}) => {
    switch(status) {
        case 'Completed': return <ClipboardDocumentCheckIcon className={`${className} text-green-400`} />;
        case 'Blocked': return <div className="w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-500 mt-1"></div>;
        case 'In Progress': return <div className="w-4 h-4 rounded-full border-2 border-dashed border-blue-400 animate-spin mt-1"></div>;
        default: return null;
    }
};

const AgentTypeIcon: React.FC<{type: AgentType, className?: string}> = ({type, className = 'h-5 w-5'}) => {
    switch(type) {
        case AgentType.GeneAnalyst: return <GeneAnalystIcon className={className} />;
        case AgentType.CompoundAnalyst: return <CompoundAnalystIcon className={className} />;
        case AgentType.KnowledgeNavigator: return <AgentIcon className={className} />;
        case AgentType.TrendSpotter: return <SingularityIcon className={className} />;
        case AgentType.Strategist: return <LightbulbIcon className={className} />;
        default: return <AgentIcon className={className} />;
    }
}


const EvidenceIcon: React.FC<{type: Evidence['type']}> = ({type}) => {
    const iconMap = {
        'peer_reviewed_study': { icon: <BeakerIcon />, color: 'text-green-400' },
        'clinical_trial_result': { icon: <UserGroupIcon />, color: 'text-blue-400' },
        'review_article': { icon: <DocumentTextIcon />, color: 'text-indigo-400' },
        'patent_filing': { icon: <DocumentTextIcon />, color: 'text-gray-400' },
        'expert_projection': { icon: <LightbulbIcon className="h-4 w-4" />, color: 'text-yellow-400' },
    };
    const current = iconMap[type];
    return <div className={current.color}>{current.icon}</div>;
}

const phaseDescriptions: Record<HypeCyclePhase, string> = {
    [HypeCyclePhase.InnovationTrigger]: "A potential technology breakthrough kicks things off. Early proof-of-concept stories trigger significant publicity.",
    [HypeCyclePhase.PeakOfInflatedExpectations]: "Early publicity produces a number of success stories, often accompanied by many failures. Some companies take action; many do not.",
    [HypeCyclePhase.TroughOfDisillusionment]: "Interest wanes as experiments fail to deliver. Investments continue only if surviving providers improve their products for early adopters.",
    [HypeCyclePhase.SlopeOfEnlightenment]: "More instances of how the technology can benefit the enterprise start to crystallize. Second- and third-generation products appear.",
    [HypeCyclePhase.PlateauOfProductivity]: "Mainstream adoption starts to take off. The technology's broad market applicability and relevance are clearly paying off.",
};


const HypeCycleDisplay: React.FC<{ level: number }> = ({ level }) => {
    const getPhaseAndProgress = (trl: number): { phase: HypeCyclePhase, progress: number, color: string } => {
        if (trl <= 2) return { phase: HypeCyclePhase.InnovationTrigger, progress: (trl - 1) / 1 * 0.15, color: 'text-orange-400' };
        if (trl <= 4) return { phase: HypeCyclePhase.PeakOfInflatedExpectations, progress: 0.15 + ((trl - 2) / 2 * 0.20), color: 'text-red-400' };
        if (trl <= 6) return { phase: HypeCyclePhase.TroughOfDisillusionment, progress: 0.35 + ((trl - 4) / 2 * 0.25), color: 'text-blue-400' };
        if (trl <= 8) return { phase: HypeCyclePhase.SlopeOfEnlightenment, progress: 0.60 + ((trl - 6) / 2 * 0.25), color: 'text-teal-400' };
        return { phase: HypeCyclePhase.PlateauOfProductivity, progress: 0.85 + ((trl - 8) / 1 * 0.15), color: 'text-green-400' };
    };

    const { phase, progress, color } = getPhaseAndProgress(level);
    const path = "M 0 80 C 20 80, 25 20, 40 20 S 60 100, 75 70 S 95 60, 100 60";
    const pathRef = useRef<SVGPathElement>(null);
    const [point, setPoint] = useState({ x: 0, y: 80 });

    React.useEffect(() => {
        if (pathRef.current) {
            const pathLength = pathRef.current.getTotalLength();
            const newPoint = pathRef.current.getPointAtLength(progress * pathLength);
            setPoint({ x: newPoint.x, y: newPoint.y });
        }
    }, [progress]);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <p className="text-xs text-slate-400 font-semibold">Technology Lifecycle:</p>
                <p className={`text-sm font-bold ${color}`} title={phaseDescriptions[phase]}>{phase}</p>
            </div>
            <svg viewBox="0 0 100 110" className="w-full h-auto">
                <path ref={pathRef} d={path} stroke="#475569" strokeWidth="2" fill="none" />
                <circle cx={point.x} cy={point.y} r="3.5" fill="white" stroke={color.replace('text-','').replace('-400','')} strokeWidth="2" />
                <text x={point.x} y={point.y - 8} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">TRL {level}</text>
            </svg>
        </div>
    );
};

const RewardPill: React.FC<{ icon: React.ReactNode, value: number, colorClass: string }> = ({ icon, value, colorClass }) => (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${colorClass}`}>
      {icon}
      <span>{value.toLocaleString()}</span>
    </div>
);

const StagePill: React.FC<{
    stage: RAndDStage;
    status: 'Completed' | 'Blocked' | 'In Progress';
    onDispatch: () => void;
    canAfford: boolean;
    isLoading: boolean;
}> = ({ stage, status, onDispatch, canAfford, isLoading }) => {
    const isNext = status === 'In Progress';
    
    return (
        <div className={`p-3 rounded-md transition-all duration-300 ${isNext ? 'bg-blue-900/40 border border-blue-600' : 'bg-slate-800/50'}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{isLoading ? <div className="w-4 h-4 rounded-full border-2 border-dashed border-blue-400 animate-spin"></div> : <StageStatusIcon status={status} />}</div>
                <div className="flex-grow">
                    <p className={`font-semibold ${isNext ? 'text-blue-200' : 'text-slate-300'}`}>{stage.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
                    {isNext && (
                         <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3">
                            <div>
                                <p className="text-xs text-slate-400 mb-1.5">Projected Return:</p>
                                <div className="flex flex-wrap gap-2">
                                    {(stage.reward?.memic || 0) > 0 && <RewardPill icon={<MemicIcon className="h-4 w-4"/>} value={stage.reward!.memic!} colorClass="bg-blue-900/50 text-blue-300" />}
                                    {(stage.reward?.genetic || 0) > 0 && <RewardPill icon={<GeneticIcon className="h-4 w-4"/>} value={stage.reward!.genetic!} colorClass="bg-teal-900/50 text-teal-300" />}
                                    {(stage.reward?.benchmark || 0) > 0 && <RewardPill icon={<SystemClarityIcon className="h-4 w-4"/>} value={stage.reward!.benchmark!} colorClass="bg-pink-900/50 text-pink-300" />}
                                </div>
                            </div>
                             <button
                                onClick={onDispatch}
                                disabled={!canAfford || isLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700 text-slate-200 border border-slate-600 enabled:hover:bg-blue-600 enabled:hover:text-white enabled:hover:border-blue-500"
                            >
                                {isLoading ? (
                                    <span>Agent Working...</span>
                                ) : (
                                    <>
                                        <AgentTypeIcon type={stage.agent} />
                                        <span>Fund Stage</span>
                                        <div className="flex items-center gap-1 ml-auto text-blue-300">
                                            <MemicIcon className="h-4 w-4" />
                                            <span>{stage.complexity.toLocaleString()}</span>
                                        </div>
                                    </>
                                )}
                            </button>
                            {!canAfford && !isLoading && <p className="text-xs text-red-400 text-center mt-1">Insufficient Memic</p>}
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InterventionCard: React.FC<{ 
    item: MarketplaceIntervention;
    odysseyState: OdysseyState;
    onDispatchAgent: (interventionId: string, stageId: string) => void;
    dispatchingStageId: string | null;
}> = ({ item, odysseyState, onDispatchAgent, dispatchingStageId }) => {
    const [evidenceVisible, setEvidenceVisible] = useState(false);
    
    const completedStageIds = new Set(odysseyState.completedStages[item.id] || []);
    const allStages = [...item.researchStages, ...item.engineeringStages];
    const totalStages = allStages.length;
    
    // Linearly map completed stages (0 to totalStages) to TRL (1 to 9)
    const technologyReadinessLevel = totalStages > 0 
        ? Math.round(1 + (completedStageIds.size * 8) / totalStages)
        : 9;
        
    const isProjectComplete = completedStageIds.size === totalStages;
    
    let firstBlockedStage: RAndDStage | null = null;
    for (const stage of allStages) {
        if (!completedStageIds.has(stage.id)) {
            firstBlockedStage = stage;
            break;
        }
    }
    
    return (
        <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col justify-between transition-all hover:shadow-2xl ${isProjectComplete ? 'hover:border-teal-500/50 hover:shadow-teal-900/20' : 'hover:border-blue-500/50 hover:shadow-blue-900/20'}`}>
            <div>
                <div className="flex items-start gap-4 mb-3">
                    <div className={`${isProjectComplete ? 'text-teal-300' : 'text-blue-300'} flex-shrink-0 mt-1`}><InterventionTypeIcon type={item.type} className="h-7 w-7"/></div>
                    <h4 className="font-bold text-slate-100 text-lg flex-grow">{item.name}</h4>
                </div>
                
                <p className="text-sm text-slate-300 mb-4">{item.description}</p>
                
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 mb-4 space-y-3">
                    <HypeCycleDisplay level={technologyReadinessLevel} />
                </div>
                
                {/* R&D Pipeline */}
                <div className="space-y-3 mb-4">
                    {item.researchStages.length > 0 && <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-300"><MicroscopeIcon/> Research Stages</h5>}
                    {item.researchStages.map(stage => {
                        const status = completedStageIds.has(stage.id) ? 'Completed' : (firstBlockedStage?.id === stage.id ? 'In Progress' : 'Blocked');
                        return <StagePill 
                                    key={stage.id} 
                                    stage={stage} 
                                    status={status}
                                    canAfford={odysseyState.vectors.memic >= stage.complexity}
                                    onDispatch={() => onDispatchAgent(item.id, stage.id)}
                                    isLoading={dispatchingStageId === stage.id}
                                />;
                    })}
                    
                    {item.engineeringStages.length > 0 && <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-300 mt-4"><WrenchScrewdriverIcon/> Engineering Stages</h5>}
                    {item.engineeringStages.map(stage => {
                        const status = completedStageIds.has(stage.id) ? 'Completed' : (firstBlockedStage?.id === stage.id ? 'In Progress' : 'Blocked');
                        return <StagePill 
                                    key={stage.id} 
                                    stage={stage} 
                                    status={status}
                                    canAfford={odysseyState.vectors.memic >= stage.complexity}
                                    onDispatch={() => onDispatchAgent(item.id, stage.id)}
                                    isLoading={dispatchingStageId === stage.id}
                                />;
                    })}
                </div>

                {/* Evidence Section */}
                <div className="bg-slate-900/40 rounded-lg border border-slate-700/50 mb-4">
                    <button onClick={() => setEvidenceVisible(!evidenceVisible)} className="w-full flex justify-between items-center p-3">
                        <h5 className="text-sm font-semibold text-slate-300">Scientific Evidence ({item.evidence.length})</h5>
                        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${evidenceVisible ? 'rotate-180' : ''}`} />
                    </button>
                    {evidenceVisible && (
                        <div className="p-3 border-t border-slate-700 space-y-3">
                            {item.evidence.map((ev, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1"><EvidenceIcon type={ev.type} /></div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-200">{ev.title} <span className="text-xs font-normal text-slate-500">({ev.source})</span></p>
                                        <p className="text-xs text-slate-400 mt-1">{ev.summary}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                            {ev.metrics?.effectSize && <span className="text-slate-400">Effect: <span className="font-semibold text-slate-300">{ev.metrics.effectSize}</span></span>}
                                            {ev.metrics?.sampleSize && <span className="text-slate-400">Sample: <span className="font-semibold text-slate-300">{ev.metrics.sampleSize}</span></span>}
                                            {ev.url && <a href={ev.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-400 hover:underline"><LinkIcon className="h-3 w-3 mr-1"/>Link</a>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

             {isProjectComplete && item.finalProduct && (
                <div className="mt-auto pt-4 border-t border-slate-700/50">
                    <p className="text-center text-green-300 font-semibold mb-2">Technology Ready!</p>
                    <a
                        href={item.finalProduct.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center block px-4 py-2 text-sm font-semibold rounded-lg transition-colors border bg-teal-600 text-white border-teal-500 hover:bg-teal-500"
                    >
                        Purchase from {item.finalProduct.provider} for ${item.finalProduct.priceUSD.toLocaleString()}
                    </a>
                </div>
            )}
        </div>
    );
};


const InterventionMarketplace: React.FC<InterventionMarketplaceProps> = ({ odysseyState, onDispatchAgent, dispatchingStageId }) => {
    return (
        <div className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700">
             <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4">
                <CartIcon className="h-8 w-8 text-teal-300" />
                <h2 className="text-2xl font-bold text-slate-100 text-center sm:text-left">
                    R&D Dashboard
                </h2>
            </div>
            <p className="text-slate-400 text-center sm:text-left mb-6">
                Advance the frontiers of science. Invest Memic points to fund R&D stages, increasing the Technology Readiness Level (TRL) of groundbreaking interventions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {MARKETPLACE_INTERVENTIONS.map(item => (
                    <InterventionCard 
                        key={item.id} 
                        item={item} 
                        odysseyState={odysseyState}
                        onDispatchAgent={onDispatchAgent}
                        dispatchingStageId={dispatchingStageId}
                    />
                ))}
            </div>
        </div>
    )
};

export default InterventionMarketplace;
