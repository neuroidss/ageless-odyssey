

import React, { useState, useMemo, useEffect } from 'react';
import { AgentType, ModelProvider, type ModelDefinition, HuggingFaceDevice, type GPUSupportedFeatures } from '../types';
import { EXAMPLE_TOPICS, SUPPORTED_MODELS, HUGGING_FACE_DEVICES, HUGGING_FACE_QUANTIZATIONS, DEFAULT_HUGGING_FACE_QUANTIZATION } from '../constants';
import { AgentIcon, GeneAnalystIcon, CompoundAnalystIcon, GearIcon, ChevronDownIcon, SingularityIcon } from './icons';

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
  isAutonomousMode: boolean;
  setIsAutonomousMode: (enabled: boolean) => void;
  agentBudget: number;
  setAgentBudget: (budget: number) => void;
  agentCallsMade: number;
  gpuFeatures: GPUSupportedFeatures | null;
}

const AgentControlPanel: React.FC<AgentControlPanelProps> = ({ 
  topic, setTopic, onDispatchAgent, isLoading, model, setModel, 
  apiKey, onApiKeyChange, quantization, setQuantization, device, setDevice,
  isAutonomousMode, setIsAutonomousMode, agentBudget, setAgentBudget, agentCallsMade,
  gpuFeatures
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const primaryAgent = { id: AgentType.TrendSpotter, label: 'Detect Trends', icon: <SingularityIcon />, description: 'Find exponential trends in longevity research' };

  const secondaryAgents = [
    { id: AgentType.KnowledgeNavigator, label: 'Navigate', icon: <AgentIcon />, description: 'Get articles & build graph' },
    { id: AgentType.GeneAnalyst, label: 'Genes', icon: <GeneAnalystIcon />, description: 'Extract relevant genes' },
    { id: AgentType.CompoundAnalyst, label: 'Compounds', icon: <CompoundAnalystIcon />, description: 'Find potential interventions' },
  ];

  const isGoogleModel = model.provider === ModelProvider.GoogleAI;
  const isHuggingFaceModel = model.provider === ModelProvider.HuggingFace;
  const needsApiKey = isGoogleModel && !process.env.API_KEY;

  const availableQuantizations = useMemo(() => {
    // Only filter for HF models on WebGPU
    if (model.provider !== ModelProvider.HuggingFace || device !== 'webgpu') {
      return HUGGING_FACE_QUANTIZATIONS;
    }
    
    // Conservatively disable f16 if features are unknown or unsupported.
    const hasF16Support = gpuFeatures?.has('shader-f16') ?? false;
    
    return HUGGING_FACE_QUANTIZATIONS.filter(q => {
      const needsF16 = q.value === 'fp16' || q.value === 'q4f16';
      return !needsF16 || hasF16Support;
    });
  }, [model.provider, device, gpuFeatures]);

  useEffect(() => {
    // If the current quantization is no longer in the available list, reset it.
    // This handles switching to webgpu on a device without f16 support.
    if (!availableQuantizations.some(q => q.value === quantization)) {
      setQuantization(DEFAULT_HUGGING_FACE_QUANTIZATION);
    }
  }, [availableQuantizations, quantization, setQuantization]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && topic && !(needsApiKey && !apiKey)) {
        onDispatchAgent(primaryAgent.id);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Main Search Input */}
      <div className="flex w-full items-center">
        <div className="flex-grow bg-slate-800 border-2 border-slate-600 rounded-full focus-within:ring-4 focus-within:ring-purple-500/50 focus-within:border-purple-500 transition-all duration-300">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a research area to spot trends (e.g., 'longevity')..."
            className="w-full pl-5 pr-4 py-4 text-lg bg-transparent focus:outline-none text-white placeholder-slate-400"
            disabled={isLoading}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* Example Topics */}
      <div className="flex justify-center flex-wrap gap-2">
        <span className="text-slate-400 self-center mr-2 text-sm">Or try:</span>
        {EXAMPLE_TOPICS.slice(0, 3).map(example => (
          <button key={example} onClick={() => setTopic(example)} className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full hover:bg-slate-600 transition-colors">
            {example}
          </button>
        ))}
      </div>
      
      {/* Agent Action Buttons */}
      <div className="space-y-4 pt-4 border-t border-slate-700/50">
          {/* Primary Agent Button */}
          <button
            onClick={() => onDispatchAgent(primaryAgent.id)}
            disabled={isLoading || !topic || (needsApiKey && !apiKey)}
            className="w-full flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl font-bold transition-all duration-300 bg-purple-600 text-white text-xl hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-purple-500 shadow-lg shadow-purple-500/20"
            aria-label={primaryAgent.description}
          >
            <div className="flex items-center gap-3">
              {primaryAgent.icon}
              <span>{primaryAgent.label}</span>
            </div>
            <span className="text-sm font-normal text-purple-200">{primaryAgent.description}</span>
          </button>

          {/* Specialized Agent Buttons */}
          <div className="flex justify-center items-stretch flex-wrap gap-4">
            {secondaryAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => onDispatchAgent(agent.id)}
                disabled={isLoading || !topic || (needsApiKey && !apiKey)}
                className="flex-1 min-w-[160px] flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 bg-slate-700 text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 border border-slate-600 hover:border-blue-500"
              >
                <div className="flex items-center gap-3">
                  {agent.icon}
                  <span className="text-lg">{agent.label}</span>
                </div>
                <span className="text-xs font-normal text-slate-400">{agent.description}</span>
              </button>
            ))}
          </div>
      </div>


      {/* Settings Toggle */}
      <div className="text-center pt-2">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/50 transition-colors"
          aria-expanded={settingsOpen}
        >
          <GearIcon />
          <span>Advanced Settings & Autonomous Mode</span>
          <ChevronDownIcon className={`transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Collapsible Settings Panel */}
      {settingsOpen && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-6">
          
          {/* Autonomous Agent Settings */}
          <div className="p-4 border border-purple-700/50 rounded-lg bg-purple-900/10">
            <h3 className="text-lg font-bold text-purple-300 mb-3">Autonomous Trend Spotting</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-grow">
                <label htmlFor="autonomous-toggle" className="font-semibold text-slate-200">Enable Autonomous Mode</label>
                <p className="text-xs text-slate-400">Agent will automatically search for radical life extension trends in the background.</p>
              </div>
              <button
                  onClick={() => setIsAutonomousMode(!isAutonomousMode)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isAutonomousMode ? 'bg-purple-600' : 'bg-slate-600'}`}
                  aria-pressed={isAutonomousMode}
              >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isAutonomousMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="agent-budget" className="block text-sm font-medium text-slate-300 mb-1">Daily Agent Budget (calls)</label>
                  <input
                    id="agent-budget"
                    type="number"
                    value={agentBudget}
                    onChange={(e) => setAgentBudget(Math.max(0, parseInt(e.target.value, 10)))}
                    disabled={isLoading}
                    className="w-full bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                  />
               </div>
               <div className="flex items-end pb-2">
                  <p className="text-sm text-slate-300 w-full text-center sm:text-left">
                    Usage: <span className="font-bold text-white">{agentCallsMade} / {agentBudget}</span> calls
                  </p>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-1">AI Model</label>
              <div className="relative">
                <select
                  id="model-select"
                  value={model.id}
                  onChange={(e) => {
                    const selectedModel = SUPPORTED_MODELS.find(m => m.id === e.target.value);
                    if (selectedModel) setModel(selectedModel);
                  }}
                  disabled={isLoading}
                  aria-label="Select AI Model"
                  className="appearance-none w-full bg-slate-700 text-slate-200 font-semibold pl-3 pr-8 py-2 rounded-lg hover:bg-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300"
                >
                  {SUPPORTED_MODELS.map(m => (
                    <option key={m.id} value={m.id} className="font-sans">{m.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            {isHuggingFaceModel && (
              <>
                <div>
                  <label htmlFor="device-select" className="block text-sm font-medium text-slate-300 mb-1">Execution Device</label>
                  <div className="relative">
                    <select
                      id="device-select"
                      value={device}
                      onChange={(e) => setDevice(e.target.value as HuggingFaceDevice)}
                      disabled={isLoading}
                      aria-label="Select Execution Device"
                      className="appearance-none w-full bg-slate-700 text-slate-200 font-semibold pl-3 pr-8 py-2 rounded-lg hover:bg-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300"
                    >
                      {HUGGING_FACE_DEVICES.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="quantization-select" className="block text-sm font-medium text-slate-300 mb-1">Quantization</label>
                  <div className="relative">
                    <select
                      id="quantization-select"
                      value={quantization}
                      onChange={(e) => setQuantization(e.target.value)}
                      disabled={isLoading}
                      aria-label="Select Model Quantization"
                      className="appearance-none w-full bg-slate-700 text-slate-200 font-semibold pl-3 pr-8 py-2 rounded-lg hover:bg-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300"
                    >
                      {availableQuantizations.map(q => (
                        <option key={q.value} value={q.value} className="font-sans">{q.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {needsApiKey && (
            <div>
              <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-300 mb-1">Google AI API Key</label>
              <input
                id="api-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Enter your Google AI API Key to use this model"
                className="w-full text-center px-4 py-2 text-sm bg-slate-800 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-white placeholder-slate-400"
              />
              <p className="text-xs text-slate-500 mt-1">Your key is stored in session storage and is only used to communicate with the Google AI API.</p>
            </div>
          )}

          {isHuggingFaceModel && (
            <div className="text-center px-4 py-2 text-sm text-yellow-300 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
              <p><span className="font-bold">Note:</span> In-browser models run on your device. Performance can be slow, especially on the first run (model download). Results may be less accurate than cloud models.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentControlPanel;