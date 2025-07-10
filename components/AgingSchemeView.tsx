import React from 'react';
import { type WorkspaceState } from '../types';
import { GeneIcon, ProteinIcon, CompoundIcon, PathwayIcon, DiseaseIcon } from './icons';

interface AgingSchemeViewProps {
    workspace: WorkspaceState | null;
    currentTopic: string;
    onSelectTopic: (topic: string) => void;
}

const hallmarks = [
    { name: "Genomic Instability", icon: <GeneIcon />, description: "DNA damage accumulation." },
    { name: "Telomere Attrition", icon: <PathwayIcon />, description: "Protective chromosome caps shorten." },
    { name: "Epigenetic Alterations", icon: <GeneIcon />, description: "Changes in gene expression patterns." },
    { name: "Loss of Proteostasis", icon: <ProteinIcon />, description: "Misfolded proteins accumulate." },
    { name: "Deregulated Nutrient-sensing", icon: <PathwayIcon />, description: "Metabolic pathways become dysregulated." },
    { name: "Mitochondrial Dysfunction", icon: <ProteinIcon />, description: "Cellular energy production fails." },
    { name: "Cellular Senescence", icon: <DiseaseIcon />, description: "Cells stop dividing and cause inflammation." },
    { name: "Stem Cell Exhaustion", icon: <GeneIcon />, description: "Tissues lose regenerative capacity." },
    { name: "Altered Intercellular Communication", icon: <PathwayIcon />, description: "Inflammatory signals increase." },
];


const HallmarkCard: React.FC<{
    hallmark: typeof hallmarks[0];
    workspace: WorkspaceState | null;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ hallmark, workspace, isSelected, onSelect }) => {

    const getItemsForHallmark = (hallmarkName: string) => {
        if (!workspace) return { genes: 0, compounds: 0 };
        const lowerCaseHallmark = hallmarkName.toLowerCase();
        const relatedItems = workspace.items.filter(item =>
            item.summary.toLowerCase().includes(lowerCaseHallmark) ||
            item.title.toLowerCase().includes(lowerCaseHallmark) ||
            (item.details && item.details.toLowerCase().includes(lowerCaseHallmark))
        );
        return {
            genes: relatedItems.filter(i => i.type === 'gene').length,
            compounds: relatedItems.filter(i => i.type === 'compound').length,
        };
    };

    const { genes, compounds } = getItemsForHallmark(hallmark.name);
    const hasData = genes > 0 || compounds > 0;

    const baseClasses = "relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group";
    const selectedClasses = isSelected ? "border-blue-500 bg-slate-700/50 shadow-blue-500/30 shadow-lg" : "border-slate-700 bg-slate-800/50 hover:border-blue-600 hover:bg-slate-700/30";

    return (
        <div onClick={onSelect} className={`${baseClasses} ${selectedClasses}`}>
            {hasData && <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-teal-400 animate-pulse"></div>}
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-600/30' : 'bg-slate-700/50'}`}>
                    {React.cloneElement(hallmark.icon, { className: "h-8 w-8 text-slate-300" })}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-100">{hallmark.name}</h3>
                    <p className="text-sm text-slate-400">{hallmark.description}</p>
                </div>
            </div>
            {(genes > 0 || compounds > 0) && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700">
                    {genes > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-800/50 text-green-300">
                            <GeneIcon className="h-3 w-3" /> {genes} Gene{genes > 1 ? 's' : ''}
                        </span>
                    )}
                    {compounds > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-800/50 text-yellow-300">
                            <CompoundIcon className="h-3 w-3" /> {compounds} Compound{compounds > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};


const AgingSchemeView: React.FC<AgingSchemeViewProps> = ({ workspace, currentTopic, onSelectTopic }) => {

    return (
        <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-yellow-400">
                The Hallmarks of Aging
            </h2>
            <p className="text-slate-400 text-center mb-6">Select a hallmark to analyze its components and potential interventions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hallmarks.map(h => (
                    <HallmarkCard
                        key={h.name}
                        hallmark={h}
                        workspace={workspace}
                        isSelected={currentTopic === h.name}
                        onSelect={() => onSelectTopic(h.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default AgingSchemeView;
