import React from 'react';
import { type WorkspaceState, type WorkspaceItem, KnowledgeGraphNode, TrajectoryState } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { LinkIcon, LightbulbIcon, GeneIcon, ProteinIcon, CompoundIcon, PathwayIcon, DiseaseIcon, ArticleIcon, PatentIcon } from './icons';
import AgingSchemeView from './AgingSchemeView';
import TrajectoryView from './TrajectoryView';

interface WorkspaceViewProps {
  workspace: WorkspaceState | null;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  isSynthesizing: boolean;
  synthesisError: string | null;
  onSynthesize: () => void;
  currentTopic: string;
  onSelectTopic: (topic: string) => void;
  trajectoryState: TrajectoryState | null;
  onApplyIntervention: (interventionId: string | null) => void;
}

const NodeChip: React.FC<{ node: KnowledgeGraphNode }> = ({ node }) => {
    const getIcon = () => {
        switch(node.type) {
            case 'Gene': return <GeneIcon />;
            case 'Protein': return <ProteinIcon />;
            case 'Compound': return <CompoundIcon />;
            case 'Pathway': return <PathwayIcon />;
            case 'Disease': return <DiseaseIcon />;
            default: return <div className="h-5 w-5" />;
        }
    };
    const colors = {
        Gene: 'bg-green-800/50 text-green-300 border-green-700',
        Protein: 'bg-blue-800/50 text-blue-300 border-blue-700',
        Compound: 'bg-yellow-800/50 text-yellow-300 border-yellow-700',
        Pathway: 'bg-purple-800/50 text-purple-300 border-purple-700',
        Disease: 'bg-red-800/50 text-red-300 border-red-700',
        Process: 'bg-slate-700/50 text-slate-300 border-slate-600',
    };
    
    const colorClass = colors[node.type] || colors['Process'];

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
            {getIcon()}
            {node.label}
        </span>
    );
};


const KnowledgeGraphDisplay: React.FC<{ graph: WorkspaceState['knowledgeGraph'] }> = ({ graph }) => {
    if (!graph || graph.nodes.length === 0) return null;
    
    const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));

    return (
        <div className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
            <h4 className="text-2xl font-bold text-slate-100 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-400">
                Knowledge Graph
            </h4>
            <div className="space-y-3">
                {graph.edges.map((edge, index) => {
                    const sourceNode = nodeMap.get(edge.source);
                    const targetNode = nodeMap.get(edge.target);
                    if (!sourceNode || !targetNode) return null;

                    return (
                        <div key={index} className="flex items-center justify-center flex-wrap gap-2 p-3 bg-slate-900/40 rounded-lg">
                            <NodeChip node={sourceNode} />
                            <div className="font-mono text-teal-400 text-sm px-2 py-1 border-2 border-dashed border-slate-600 rounded-md">
                                {edge.label}
                            </div>
                            <NodeChip node={targetNode} />
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const formatSynthesis = (text: string | null): string => {
    if (!text) return '';
    return text.split('\n').map(line => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (line.startsWith('* ')) {
            return `<li>${line.substring(2)}</li>`;
        }
        return line;
    }).join('').replace(/<li>/g, '<ul><li>').replace(/<\/li>(?!<li>)/g, '</li></ul>').replace(/<\/li><li>/g, '</li><li>');
};

const WorkspaceItemCard: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
    const iconMap = {
        article: <ArticleIcon />,
        patent: <PatentIcon />,
        gene: <GeneIcon className="h-6 w-6" />,
        compound: <CompoundIcon className="h-6 w-6" />,
        protein: <ProteinIcon className="h-6 w-6" />,
        process: <PathwayIcon className="h-6 w-6" />,
    };

    return (
         <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-5">
            <div className="flex items-start gap-4">
                <div className="text-blue-400 mt-1">{iconMap[item.type]}</div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-100 mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm capitalize mb-2">Type: {item.type}</p>
                    <p className="text-slate-300 leading-relaxed mb-3">{item.summary}</p>
                    <p className="text-xs text-slate-500 font-mono">{item.details}</p>
                </div>
            </div>
        </div>
    )
};

const WorkspaceView: React.FC<WorkspaceViewProps> = ({ workspace, isLoading, error, hasSearched, isSynthesizing, synthesisError, onSynthesize, currentTopic, onSelectTopic, trajectoryState, onApplyIntervention }) => {
  if (isLoading && !workspace) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-8">
      {isLoading && <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">Processing...</div>}

      <AgingSchemeView 
        workspace={workspace}
        currentTopic={currentTopic}
        onSelectTopic={onSelectTopic}
      />
      
      {error && (
        <div className="text-center py-12 text-red-400 bg-red-900/20 border border-red-500 rounded-lg max-w-3xl mx-auto">
          <h3 className="text-xl font-bold">An Error Occurred</h3>
          <p className="mt-2">{error}</p>
        </div>
      )}
      
      {!hasSearched && !isLoading && !error && (
        <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-slate-400">Your journey begins here.</h2>
            <p className="text-slate-500 mt-2">Select a process from the scheme above and dispatch an AI agent to start building your blueprint.</p>
        </div>
      )}
      
      {hasSearched && workspace && workspace.items.length === 0 && !isLoading && (
        <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-400">No Data Yet for "{workspace.topic}"</h2>
            <p className="text-slate-500 mt-2">Dispatch an agent using the panel above to populate your workspace.</p>
        </div>
      )}

      {hasSearched && workspace && workspace.items.length > 0 && (
        <>
          {/* Synthesis Section */}
          <div className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
              <button
                  onClick={onSynthesize}
                  disabled={isSynthesizing || workspace.items.length === 0}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <LightbulbIcon />
                  {isSynthesizing ? 'Generating Insights...' : 'Synthesize & Hypothesize'}
              </button>

              {isSynthesizing && <div className="pt-4"><LoadingSpinner /></div>}
              
              {synthesisError && (
                  <div className="mt-4 text-center py-4 text-red-400 bg-red-900/20 border border-red-500 rounded-lg">
                      <h3 className="text-lg font-bold">Synthesis Failed</h3>
                      <p className="mt-1 text-sm">{synthesisError}</p>
                  </div>
              )}

              {workspace.synthesis && (
                  <div className="mt-6 pt-6 border-t border-slate-600">
                      <div className="bg-slate-900/50 p-4 rounded-md">
                          <h4 className="text-xl font-bold text-slate-100 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">AI Synthesis & Hypothesis</h4>
                          <div className="text-slate-300 leading-relaxed font-sans" dangerouslySetInnerHTML={{ __html: formatSynthesis(workspace.synthesis) }} />
                      </div>
                  </div>
              )}
          </div>
          
          {workspace.synthesis && trajectoryState && (
             <TrajectoryView 
                trajectoryState={trajectoryState} 
                onApplyIntervention={onApplyIntervention}
              />
          )}
          
          <KnowledgeGraphDisplay graph={workspace.knowledgeGraph ?? null} />

          <div>
            <h4 className="text-2xl font-bold text-slate-100 mb-4">Collected Workspace Items ({workspace.items.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspace.items.map((item) => (
                  <WorkspaceItemCard key={item.id} item={item} />
                ))}
            </div>
          </div>
          
          {workspace.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h4 className="text-lg font-semibold text-slate-300 mb-3">Sources from Google Search</h4>
              <ul className="space-y-2">
                {workspace.sources.map((source, index) => (
                  <li key={`${source.uri}-${index}`} className="text-sm">
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                    >
                      <LinkIcon />
                      <span className="truncate">{source.title || source.uri}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkspaceView;