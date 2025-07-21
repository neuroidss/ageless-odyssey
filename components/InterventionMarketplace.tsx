import React, { useState, useRef } from 'react';
import { MarketplaceIntervention, RAndDStage, AgentType, OdysseyState, Evidence, HypeCyclePhase, CartItem, InvestmentItem } from '../types';
import { MARKETPLACE_INTERVENTIONS } from '../constants';
import { 
    CartIcon, MemicIcon, PillIcon, TherapyIcon, PresentationChartLineIcon, 
    LinkIcon, BeakerIcon, UserGroupIcon, DocumentTextIcon, ChevronDownIcon,
    MicroscopeIcon, WrenchScrewdriverIcon, LightbulbIcon, ClipboardDocumentCheckIcon, AgentIcon,
    GeneAnalystIcon, CompoundAnalystIcon, SingularityIcon, GeneticIcon, SystemClarityIcon, BanknotesIcon, CheckCircleIcon
} from './icons';

interface InterventionMarketplaceProps {
    odysseyState: OdysseyState;
    onDispatchAgent: (interventionId: string, stageId: string) => void;
    dispatchingStageId: string | null;
    onAddToCart: (intervention: MarketplaceIntervention) => void;
    onAddToPortfolio: (intervention: MarketplaceIntervention, stage: RAndDStage, amount: number) => void;
}

const InterventionTypeIcon: React.FC<{ type: MarketplaceIntervention['type'], className?: string }> = ({ type, className = "h-8 w-8" }) => {
    switch (type) {
        case 'supplement': return <PillIcon className={className} />;
        case 'therapy': return <TherapyIcon className={className} />;
        case 'diagnostic': return <PresentationChartLineIcon className={className} />;
        case 'theoretical': return <LightbulbIcon className={`${className} text-purple-400`} />;
        default: return <PillIcon className={className} />;
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


const StagePill: React.FC<{
    stage: RAndDStage;
    onFund: () => void;
    onInvest: (amount: number) => void;
    isCompleted: boolean;
    isNextUp: boolean;
    dispatchingStageId: string | null;
    odysseyState: OdysseyState;
}> = ({ stage, onFund, onInvest, isCompleted, isNextUp, dispatchingStageId, odysseyState }) => {
    const [investmentAmount, setInvestmentAmount] = useState(100000);
    const isLoading = dispatchingStageId === stage.id;
    const canAffordMemic = odysseyState.vectors.memic >= stage.complexity;
    const canAffordCapital = odysseyState.vectors.capital >= investmentAmount;

    return (
        <div className={`p-3 rounded-md transition-all duration-300 ${isNextUp ? 'bg-blue-900/40 border border-blue-600' : isCompleted ? 'bg-slate-800/50 opacity-70' : 'bg-slate-800/50'}`}>
             <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                    {isCompleted ? <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-400" /> : <div className={`w-3 h-3 mt-1 rounded-full ${isNextUp ? 'bg-blue-400' : 'bg-slate-600 border-2 border-slate-500'}`}></div>}
                </div>
                <div className="flex-grow">
                    <p className={`font-semibold ${isNextUp ? 'text-blue-200' : 'text-slate-300'}`}>{stage.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
                    {isNextUp && (
                         <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3">
                            <h5 className="text-xs text-slate-300 font-semibold">Fund or Invest in this Stage:</h5>
                            {/* Path 1: Fund with Memic */}
                            <button
                                onClick={onFund}
                                disabled={!canAffordMemic || isLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700 text-slate-200 border border-slate-600 enabled:hover:bg-blue-600 enabled:hover:text-white enabled:hover:border-blue-500"
                            >
                                {isLoading ? (<span>Agent Working...</span>) : (<>
                                <AgentTypeIcon type={stage.agent} />
                                <span>Fund R&D with Memic</span>
                                <div className="flex items-center gap-1 ml-auto text-blue-300"><MemicIcon className="h-4 w-4" /><span>{stage.complexity.toLocaleString()}</span></div>
                                </>)}
                            </button>
                            {!canAffordMemic && !isLoading && <p className="text-xs text-red-400 text-center mt-1">Insufficient Memic Points</p>}
                           
                           {/* Path 2: Invest with Capital */}
                           <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="50000"
                                    value={investmentAmount}
                                    onChange={e => setInvestmentAmount(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-sm text-right"
                                />
                                <button
                                    onClick={() => onInvest(investmentAmount)}
                                    disabled={!canAffordCapital || isLoading || investmentAmount <= 0}
                                    className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-green-800/50 text-green-300 border border-green-700 enabled:hover:bg-green-700 enabled:hover:text-white"
                                >
                                    <BanknotesIcon className="h-4 w-4" />
                                    <span>Invest</span>
                                </button>
                           </div>
                             {!canAffordCapital && !isLoading && <p className="text-xs text-red-400 text-center mt-1">Insufficient Capital</p>}
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
    onAddToCart: (intervention: MarketplaceIntervention) => void;
    onAddToPortfolio: (intervention: MarketplaceIntervention, stage: RAndDStage, amount: number) => void;
}> = ({ item, odysseyState, onDispatchAgent, dispatchingStageId, onAddToCart, onAddToPortfolio }) => {
    const [evidenceVisible, setEvidenceVisible] = useState(false);
    
    const completedStageIds = new Set(odysseyState.completedStages[item.id] || []);
    const allStages = [...item.researchStages, ...item.engineeringStages];
    const totalStages = allStages.length;
    
    const technologyReadinessLevel = totalStages > 0 
        ? Math.round(1 + (completedStageIds.size * 8) / totalStages)
        : 9;
        
    const isProjectComplete = completedStageIds.size === totalStages;
    const isInCart = odysseyState.rejuvenationCart.some(cartItem => cartItem.interventionId === item.id);
    
    let firstBlockedStage: RAndDStage | null = null;
    for (const stage of allStages) {
        if (!completedStageIds.has(stage.id)) {
            firstBlockedStage = stage;
            break;
        }
    }
    
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="text-blue-400 mt-1 flex-shrink-0">
                        <InterventionTypeIcon type={item.type} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-100">{item.name}</h3>
                        <p className="text-sm text-slate-400 capitalize">{item.type}</p>
                    </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{item.description}</p>
                
                {/* TRL & Hype Cycle */}
                <HypeCycleDisplay level={technologyReadinessLevel} />

                {/* Evidence Dropdown */}
                <div className="mt-4">
                    <button onClick={() => setEvidenceVisible(!evidenceVisible)} className="flex justify-between items-center w-full text-sm font-semibold text-slate-300 hover:text-white">
                        <span>Supporting Evidence ({item.evidence.length})</span>
                        <ChevronDownIcon className={`transition-transform duration-200 ${evidenceVisible ? 'rotate-180' : ''}`} />
                    </button>
                    {evidenceVisible && (
                        <div className="mt-2 space-y-2 border-l-2 border-slate-700 pl-3">
                            {item.evidence.map((e, i) => (
                                <div key={i} className="text-xs">
                                    <div className="flex items-center gap-2 font-bold text-slate-300">
                                        <EvidenceIcon type={e.type} />
                                        <span>{e.title}</span>
                                    </div>
                                    <p className="text-slate-400 italic my-1">"{e.summary}"</p>
                                    {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline"><LinkIcon className="h-3 w-3" />Source</a>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* R&D Stages */}
                {!isProjectComplete && totalStages > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-600">
                         <h4 className="font-semibold text-slate-200 mb-2">R&D Pipeline</h4>
                         <div className="space-y-2">
                            {item.researchStages.map(stage => (
                                <StagePill 
                                    key={stage.id} 
                                    stage={stage} 
                                    onFund={() => onDispatchAgent(item.id, stage.id)}
                                    onInvest={(amount) => onAddToPortfolio(item, stage, amount)}
                                    isCompleted={completedStageIds.has(stage.id)}
                                    isNextUp={stage.id === firstBlockedStage?.id}
                                    dispatchingStageId={dispatchingStageId}
                                    odysseyState={odysseyState}
                                />
                            ))}
                            {item.engineeringStages.map(stage => (
                                <StagePill 
                                    key={stage.id} 
                                    stage={stage} 
                                    onFund={() => onDispatchAgent(item.id, stage.id)}
                                    onInvest={(amount) => onAddToPortfolio(item, stage, amount)}
                                    isCompleted={completedStageIds.has(stage.id)}
                                    isNextUp={stage.id === firstBlockedStage?.id}
                                    dispatchingStageId={dispatchingStageId}
                                    odysseyState={odysseyState}
                                />
                            ))}
                         </div>
                     </div>
                )}
            </div>
            
            {/* Action Area */}
            {isProjectComplete && item.finalProduct && (
                <div className="mt-4 pt-4 border-t border-green-500/30">
                     <p className="text-center text-sm font-semibold text-green-300 mb-2">Project Complete & Product Available!</p>
                     <button 
                         onClick={() => onAddToCart(item)}
                         disabled={isInCart}
                         className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 text-base disabled:opacity-50 disabled:cursor-not-allowed bg-teal-600 text-white border border-teal-500 enabled:hover:bg-teal-500"
                     >
                         <CartIcon className="h-5 w-5" />
                         {isInCart ? 'Added to Plan' : `Add to Rejuvenation Plan ($${item.finalProduct.priceUSD.toLocaleString()})`}
                     </button>
                </div>
            )}
        </div>
    );
};

export const InterventionMarketplace: React.FC<InterventionMarketplaceProps> = ({ odysseyState, onDispatchAgent, dispatchingStageId, onAddToCart, onAddToPortfolio }) => {
    return (
        <div className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700">
             <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4">
                <CartIcon className="h-8 w-8 text-blue-300" />
                <h2 className="text-2xl font-bold text-slate-100 text-center sm:text-left">
                    Intervention Marketplace
                </h2>
            </div>
            <p className="text-slate-400 text-center sm:text-left mb-6">
                Explore available diagnostics and therapies. Fund cutting-edge research to bring theoretical interventions to reality and add them to your arsenal.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {MARKETPLACE_INTERVENTIONS.map(item => (
                    <InterventionCard 
                        key={item.id} 
                        item={item} 
                        odysseyState={odysseyState} 
                        onDispatchAgent={onDispatchAgent}
                        dispatchingStageId={dispatchingStageId}
                        onAddToCart={onAddToCart}
                        onAddToPortfolio={onAddToPortfolio}
                    />
                ))}
            </div>
        </div>
    );
};
