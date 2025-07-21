
import React, { useState, useMemo } from 'react';
import { WorkspaceState, WorkspaceItem } from '../types';
import { ArticleIcon, PatentIcon, GeneIcon, CompoundIcon, ProteinIcon, PathwayIcon, TrendingUpIcon } from './icons';

interface TemporalLobeViewProps {
    workspaceHistory: WorkspaceState[];
    currentTimeIndex: number;
    onTimeLapseChange: (index: number) => void;
}

const ItemIcon: React.FC<{ type: WorkspaceItem['type'], className?: string }> = ({ type, className = "h-5 w-5" }) => {
    switch (type) {
        case 'article': return <ArticleIcon />;
        case 'patent': return <PatentIcon />;
        case 'gene': return <GeneIcon className={className} />;
        case 'compound': return <CompoundIcon className={className} />;
        case 'protein': return <ProteinIcon className={className} />;
        case 'process': return <PathwayIcon className={className} />;
        case 'trend': return <TrendingUpIcon className={className} />;
        default: return <ArticleIcon />;
    }
};


const TemporalLobeView: React.FC<TemporalLobeViewProps> = ({ workspaceHistory, currentTimeIndex, onTimeLapseChange }) => {
    const [compareIndex, setCompareIndex] = useState<number | null>(currentTimeIndex > 0 ? currentTimeIndex - 1 : null);

    const { currentItems, newItems, oldItems } = useMemo(() => {
        const currentItems = workspaceHistory[currentTimeIndex]?.items || [];
        if (compareIndex === null) {
            return { currentItems, newItems: [], oldItems: [] };
        }
        const compareItems = workspaceHistory[compareIndex]?.items || [];
        const compareIds = new Set(compareItems.map(item => item.id));

        const newItems = currentItems.filter(item => !compareIds.has(item.id));
        const oldItems = currentItems.filter(item => compareIds.has(item.id));
        
        return { currentItems, newItems, oldItems };
    }, [workspaceHistory, currentTimeIndex, compareIndex]);

    const handleSelectCompare = (index: number) => {
        if (index === compareIndex) {
            setCompareIndex(null); // Toggle off
        } else {
            setCompareIndex(index);
        }
    }

    return (
        <div className="space-y-4">
            {/* Timeline Control */}
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="text-sm font-semibold text-slate-300 mb-2">Analysis Timeline</div>
                <div className="flex items-center gap-4">
                    <div className="flex-grow">
                         <div className="flex gap-1.5 overflow-x-auto pb-2">
                            {workspaceHistory.map((ws, index) => (
                                <div key={ws.timestamp} className="flex flex-col items-center flex-shrink-0">
                                    <button 
                                        onClick={() => onTimeLapseChange(index)}
                                        className={`w-4 h-4 rounded-full border-2 transition-colors ${currentTimeIndex === index ? 'bg-cyan-400 border-cyan-200' : 'bg-slate-600 border-slate-500 hover:border-cyan-400'}`}
                                        title={`Snapshot ${index + 1}: ${ws.topic}`}
                                    ></button>
                                     <div className="w-px h-2 bg-slate-600"></div>
                                     <button
                                         onClick={() => handleSelectCompare(index)}
                                         disabled={index === currentTimeIndex}
                                         className={`w-3 h-3 rounded-full border-2 transition-colors ${compareIndex === index ? 'bg-purple-400 border-purple-200' : 'bg-slate-700 border-slate-600 hover:border-purple-400 disabled:opacity-50'}`}
                                         title={`Compare with Snapshot ${index+1}`}
                                     ></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0 w-48 text-right">
                        <div><span className="font-bold text-cyan-300">Current:</span> Snapshot {currentTimeIndex + 1}</div>
                        <div><span className="font-bold text-purple-300">Compare:</span> {compareIndex !== null ? `Snapshot ${compareIndex + 1}`: 'None'}</div>
                    </div>
                </div>
            </div>

            {/* Visualisation */}
            <div className="bg-slate-800/40 rounded-lg border border-slate-700 p-4 min-h-[250px] flex items-center justify-center">
                 {currentItems.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                        {newItems.map(item => (
                             <div key={item.id} className="group relative flex flex-col items-center animate-fade-in" title={`New: ${item.title}`}>
                                 <div className="w-12 h-12 flex items-center justify-center bg-cyan-900/50 border-2 border-cyan-500 rounded-lg text-cyan-300">
                                    <ItemIcon type={item.type} className="h-6 w-6" />
                                 </div>
                                 <p className="text-xs text-center mt-1 truncate w-full text-cyan-200">{item.title}</p>
                             </div>
                        ))}
                        {oldItems.map(item => (
                             <div key={item.id} className="group relative flex flex-col items-center" title={item.title}>
                                 <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-400">
                                    <ItemIcon type={item.type} className="h-6 w-6" />
                                 </div>
                                 <p className="text-xs text-center mt-1 truncate w-full text-slate-500">{item.title}</p>
                             </div>
                        ))}
                    </div>
                 ) : (
                    <p className="text-slate-500">No items in this snapshot to display.</p>
                 )}
            </div>
             {compareIndex !== null && (
                <div className="text-center text-sm font-semibold">
                    Found <span className="text-cyan-300">{newItems.length}</span> new discoveries and <span className="text-slate-400">{oldItems.length}</span> existing items.
                </div>
             )}
        </div>
    );
};

export default TemporalLobeView;
