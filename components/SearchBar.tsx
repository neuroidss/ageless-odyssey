

import React from 'react';
import { AgentType, ModelProvider, type ModelDefinition, HuggingFaceDevice } from '../types';
import { EXAMPLE_TOPICS, SUPPORTED_MODELS, HUGGING_FACE_DEVICES, HUGGING_FACE_QUANTIZATIONS } from '../constants';
import { AgentIcon, GeneAnalystIcon, CompoundAnalystIcon } from './icons';

interface AgentControlPanelProps {
  topic: string;
  setTopic: (topic: string) => void;
  onDispatchAgent: (agentType: AgentType) => void;
  isLoading: boolean;
  model: ModelDefinition;
  setModel: (model: ModelDefinition) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  quantization: string;
  setQuantization: (quantization: string) => void;
  device: HuggingFaceDevice;
  setDevice: (device: HuggingFaceDevice) => void;
}

const AgentControlPanel: React.FC<AgentControlPanelProps> = ({ topic, setTopic, onDispatchAgent, isLoading, model, setModel, apiKey, onApiKeyChange, quantization, setQuantization, device, setDevice }) => {
  
  const agentOptions = [
    { id: AgentType.KnowledgeNavigator, label: 'Navigate', icon: <AgentIcon />, description: 'Get articles & build graph' },
    { id: AgentType.GeneAnalyst, label: 'Genes', icon: <GeneAnalystIcon />, description: 'Extract relevant genes' },
    { id: AgentType.CompoundAnalyst, label: 'Compounds', icon: <CompoundAnalystIcon />, description: 'Find potential interventions' },
  ];

  const isGoogleModel = model.provider === ModelProvider.GoogleAI;
  const isHuggingFaceModel = model.provider === ModelProvider.HuggingFace;
  const needsApiKey = isGoogleModel && !process.env.API_KEY;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center w-full bg-slate-800 border-2 border-slate-600 rounded-full focus-within:ring-4 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all duration-300">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Or search for a specific process, gene, or compound..."
          className="w-full flex-grow pl-5 pr-4 py-4 text-lg bg-transparent focus:outline-none text-white placeholder-slate-400"
          disabled={isLoading}
          onKeyDown={(e) => e.key === 'Enter' && onDispatchAgent(AgentType.KnowledgeNavigator)}
        />
         <div className="flex items-center gap-2 pr-3 flex-shrink-0">
            {isHuggingFaceModel && (
              <>
                <div className="relative">
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value as HuggingFaceDevice)}
                    disabled={isLoading}
                    aria-label="Select Execution Device"
                    className="appearance-none bg-slate-700 text-slate-200 font-semibold pl-3 pr-8 py-2 rounded-full hover:bg-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 text-sm"
                  >
                    {HUGGING_FACE_DEVICES.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={quantization}
                    onChange={(e) => setQuantization(e.target.value)}
                    disabled={isLoading}
                    aria-label="Select Model Quantization"
                    className="appearance-none bg-slate-700 text-slate-200 font-semibold pl-3 pr-8 py-2 rounded-full hover:bg-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 text-sm"
                  >
                    {HUGGING_FACE_QUANTIZATIONS.map(q => (
                        <option key={q.value} value={q.value} className="font-sans">{q.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </>
            )}
             <div className="relative">
                 <select
                    value={model.id}
                    onChange={(e) => {
                        const selectedModel = SUPPORTED_MODELS.find(m => m.id === e.target.value);
                        if (selectedModel) setModel(selectedModel);
                    }}
                    disabled={isLoading}
                    aria-label="Select AI Model"
                    className="appearance-none bg-slate-700 text-slate-200 font-semibold pl-3 pr-8 py-2 rounded-full hover:bg-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 text-sm"
                >
                    {SUPPORTED_MODELS.map(m => (
                        <option key={m.id} value={m.id} className="font-sans">{m.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>
      </div>
      
      {isHuggingFaceModel && (
        <div className="text-center px-4 py-2 text-sm text-yellow-300 bg-yellow-900/30 border border-yellow-700/50 rounded-lg max-w-3xl mx-auto">
          <p><span className="font-bold">Note:</span> In-browser models run on your device. Performance can be slow, especially on the first run (model download). Results may be less accurate than cloud models.</p>
        </div>
      )}

      {needsApiKey && (
        <div className="text-center px-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter your Google AI API Key to use this model"
            className="w-full max-w-lg mx-auto text-center px-4 py-2 text-sm bg-slate-800 border-2 border-slate-600 rounded-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-white placeholder-slate-400"
          />
          <p className="text-xs text-slate-500 mt-1">Your key is stored in session storage and is only used to communicate with the Google AI API.</p>
        </div>
      )}

      <div className="text-center">
        <span className="text-slate-400 text-lg font-semibold">Dispatch an AI Agent:</span>
        <div className="flex justify-center items-stretch flex-wrap gap-4 mt-3">
          {agentOptions.map(agent => (
            <button
              key={agent.id}
              onClick={() => onDispatchAgent(agent.id)}
              disabled={isLoading || !topic || (needsApiKey && !apiKey)}
              className="flex-1 min-w-[160px] flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 bg-slate-700 text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 border border-slate-600 hover:border-blue-500"
            >
              <div className="flex items-center gap-3">
                {agent.icon}
                <span className="text-xl">{agent.label}</span>
              </div>
              <span className="text-xs font-normal text-slate-400">{agent.description}</span>
            </button>
          ))}
        </div>
      </div>


      <div className="flex justify-center flex-wrap gap-2 pt-2">
        <span className="text-slate-400 self-center mr-2">Example Topics:</span>
        {EXAMPLE_TOPICS.slice(0, 3).map(example => (
            <button key={example} onClick={() => setTopic(example)} className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full hover:bg-slate-600 transition-colors">
                {example}
            </button>
        ))}
      </div>
    </div>
  );
};

export default AgentControlPanel;