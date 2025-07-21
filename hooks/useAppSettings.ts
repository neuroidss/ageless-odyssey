import { useState, useEffect, useCallback } from 'react';
import { type ModelDefinition, type HuggingFaceDevice, type GPUSupportedFeatures, SearchDataSource } from '../types';
import { SUPPORTED_MODELS, DEFAULT_HUGGING_FACE_DEVICE, DEFAULT_HUGGING_FACE_QUANTIZATION, DEFAULT_AGENT_BUDGET } from '../constants';

export const useAppSettings = (addLog: (msg: string) => void, storageKey: string) => {
  const [model, setModel] = useState<ModelDefinition>(SUPPORTED_MODELS.find(m => m.id === 'gemini-2.5-flash') || SUPPORTED_MODELS[0]);
  const [quantization, setQuantization] = useState<string>(DEFAULT_HUGGING_FACE_QUANTIZATION);
  const [device, setDevice] = useState<HuggingFaceDevice>(DEFAULT_HUGGING_FACE_DEVICE);
  const [apiKey, setApiKey] = useState<string>('');
  const [gpuFeatures, setGpuFeatures] = useState<GPUSupportedFeatures | null>(null);
  const [searchSources, setSearchSources] = useState<SearchDataSource[]>([SearchDataSource.PubMed, SearchDataSource.BioRxivSearch, SearchDataSource.GooglePatents, SearchDataSource.OpenGenes]);
  
  // Autonomous Mode State
  const [isAutonomousMode, setIsAutonomousMode] = useState<boolean>(false);
  const [isAutonomousLoading, setIsAutonomousLoading] = useState<boolean>(false);
  const [agentBudget, setAgentBudget] = useState<number>(DEFAULT_AGENT_BUDGET);
  const [agentCallsMade, setAgentCallsMade] = useState<number>(0);
  const [budgetResetTimestamp, setBudgetResetTimestamp] = useState<number>(0);

  // Load settings from storage on mount
  useEffect(() => {
    // Load API Key from session storage
    const savedKey = sessionStorage.getItem('google-api-key');
    if (savedKey) {
        setApiKey(savedKey);
        addLog("Loaded Google AI API Key from session storage.");
    }
    
    // Load main application state from local storage
    try {
        const savedStateJSON = localStorage.getItem(storageKey);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);

            const savedModel = SUPPORTED_MODELS.find(m => m.id === savedState.model?.id) || SUPPORTED_MODELS[0];
            setModel(savedModel);
            if (savedState.quantization) setQuantization(savedState.quantization);
            if (savedState.device) setDevice(savedState.device);
            if (savedState.searchSources) setSearchSources(savedState.searchSources);
            
            // Load autonomous mode state
            if (savedState.isAutonomousMode) setIsAutonomousMode(savedState.isAutonomousMode);
            if (savedState.agentBudget) setAgentBudget(savedState.agentBudget);
            if (savedState.agentCallsMade) setAgentCallsMade(savedState.agentCallsMade);
            const savedTimestamp = savedState.budgetResetTimestamp || 0;
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if(now - savedTimestamp > oneDay) {
                addLog("Daily budget cycle expired. Resetting calls for new cycle.");
                setAgentCallsMade(0);
                setBudgetResetTimestamp(now);
            } else {
                setBudgetResetTimestamp(savedTimestamp);
            }
        } else {
            setBudgetResetTimestamp(Date.now());
        }
    } catch (error) {
        addLog(`Failed to load settings from localStorage: ${error}. Using defaults.`);
    }
  }, [addLog, storageKey]);


  // GPU Feature Detection
  useEffect(() => {
    async function checkGpuFeatures() {
        if (navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    setGpuFeatures(adapter.features);
                    addLog(`[GPU Check] WebGPU adapter found. Supported features: ${Array.from(adapter.features).join(', ')}`);
                    if (!adapter.features.has('shader-f16')) {
                         addLog(`[GPU Check] WARN: This device/browser does not support 'shader-f16'. Quantizations using f16 (fp16, q4f16) will be disabled for WebGPU.`);
                    }
                } else {
                    addLog('[GPU Check] WebGPU supported, but no adapter found. Falling back to WASM.');
                    setDevice('wasm');
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                addLog(`[GPU Check] Error requesting WebGPU adapter: ${message}. Falling back to WASM.`);
                setDevice('wasm');
            }
        } else {
            addLog('[GPU Check] WebGPU API not found. Falling back to WASM.');
            setDevice('wasm');
        }
    }
    checkGpuFeatures();
  }, [addLog]);
  
  const handleApiKeyChange = (key: string) => {
      setApiKey(key);
      sessionStorage.setItem('google-api-key', key);
      addLog("Google AI API Key has been updated for this session.");
  };

  const handleModelChange = (newModel: ModelDefinition) => {
    setModel(newModel);
    if (newModel.provider === 'Hugging Face') {
        setQuantization(DEFAULT_HUGGING_FACE_QUANTIZATION);
        addLog(`Switched to Hugging Face model. Default quantization set to '${DEFAULT_HUGGING_FACE_QUANTIZATION}'.`);
    }
  };
  
  const handleToggleSearchSource = (source: SearchDataSource) => {
    setSearchSources(prev => 
        prev.includes(source) 
            ? prev.filter(s => s !== source) 
            : [...prev, source]
    );
    addLog(`Toggled search source: ${source}`);
  };

  return {
    model,
    setModel,
    handleModelChange,
    quantization,
    setQuantization,
    device,
    setDevice,
    apiKey,
    setApiKey,
    handleApiKeyChange,
    gpuFeatures,
    searchSources,
    setSearchSources,
    handleToggleSearchSource,
    isAutonomousMode,
    setIsAutonomousMode,
    isAutonomousLoading,
    setIsAutonomousLoading,
    agentBudget,
    setAgentBudget,
    agentCallsMade,
    setAgentCallsMade,
    budgetResetTimestamp,
    setBudgetResetTimestamp
  };
};