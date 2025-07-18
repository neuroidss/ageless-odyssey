import { pipeline, env, Tensor, type TextGenerationPipeline, type FeatureExtractionPipeline, type Chat } from '@huggingface/transformers';
import type { HuggingFaceDevice } from '../types';

// Prevent transformers.js from trying to access local files, which is not allowed in a web-worker context
// and can throw errors. This is a safety measure for web-based environments.
env.allowLocalModels = false;

/**
 * Manages the singleton instance of a Hugging Face text-generation pipeline.
 * This prevents re-downloading the model on every call.
 */
class HuggingFacePipelineManager {
    static task: 'text-generation' = 'text-generation';
    static modelId: string | null = null;
    static quantization: string | null = null;
    static device: HuggingFaceDevice | null = null;
    static instance: TextGenerationPipeline | null = null;

    static async getInstance(modelId: string, quantization: string, device: HuggingFaceDevice, addLog: (msg: string) => void, setProgress?: (msg: string) => void): Promise<TextGenerationPipeline> {
        if (this.modelId !== modelId || this.quantization !== quantization || this.device !== device || !this.instance) {
            if (this.instance) {
                addLog(`[HuggingFace] Disposing old model pipeline...`);
                await this.instance.dispose();
                this.instance = null;
            }
            
            this.modelId = modelId;
            this.quantization = quantization;
            this.device = device;
            
            addLog(`[HuggingFace] Loading model pipeline for '${modelId}' using ${device.toUpperCase()} backend with quantization '${quantization}'.`);
            
            const pipelineOptions: {
                device: HuggingFaceDevice;
                dtype: string;
                progress_callback?: (progress: any) => void;
            } = {
                device: device,
                dtype: quantization,
            };

            if (setProgress) {
                pipelineOptions.progress_callback = (progress: any) => {
                    let logMsg = '';
                    let progressMsg = '';
                    if (progress.status === 'progress') {
                        const percentage = (progress.progress).toFixed(1);
                        logMsg = `[HuggingFace] Loading: ${progress.file} (${percentage}%)`;
                        progressMsg = `Loading model: ${progress.file} (${percentage}%)`;
                    } else if (progress.status === 'done') {
                        logMsg = `[HuggingFace] Finished loading: ${progress.file}`;
                        progressMsg = 'Finalizing model...';
                    } else if (progress.status === 'ready') {
                         logMsg = `[HuggingFace] Model pipeline is ready.`;
                         progressMsg = 'Model ready, generating response...';
                    }
                    if (logMsg) addLog(logMsg);
                    if (progressMsg && setProgress) setProgress(progressMsg);
                };
            }
            
            const createTextGenerationPipeline = pipeline as (
                task: 'text-generation',
                model: string,
                options: any,
            ) => Promise<TextGenerationPipeline>;
            
            try {
                this.instance = await createTextGenerationPipeline(this.task, modelId, pipelineOptions);
            } catch (e) {
                 if (e instanceof Error && (e.message.includes('VK_ERROR_OUT_OF_DEVICE_MEMORY') || e.message.toLowerCase().includes('out of memory'))) {
                     const enhancedMessage = "WebGPU ran out of memory while loading the model. Your device may not have enough VRAM. Please try switching the 'Execution Device' to 'wasm' in the Advanced Settings.";
                     addLog(`[HuggingFace] OOM ERROR: ${enhancedMessage}`);
                     throw new Error(enhancedMessage);
                }
                throw e; // rethrow other errors
            }
            
            addLog(`[HuggingFace] Model '${modelId}' is fully loaded and ready.`);
        }
        return this.instance!;
    }
}

/**
 * Manages the singleton instance of a Hugging Face feature-extraction (embedding) pipeline.
 */
class HuggingFaceEmbeddingManager {
    static task: 'feature-extraction' = 'feature-extraction';
    static modelId: string | null = null;
    static instance: FeatureExtractionPipeline | null = null;

    static async getInstance(modelId: string, addLog: (msg: string) => void): Promise<FeatureExtractionPipeline> {
        if (this.modelId !== modelId || !this.instance) {
            if (this.instance) {
                addLog(`[HuggingFace Embeddings] Disposing old embedding pipeline...`);
                await this.instance.dispose();
            }
            this.modelId = modelId;
            addLog(`[HuggingFace Embeddings] Loading embedding model '${modelId}'...`);
            
            const createFeatureExtractionPipeline = pipeline as (
                task: 'feature-extraction',
                model: string,
                options: any,
            ) => Promise<FeatureExtractionPipeline>;

            this.instance = await createFeatureExtractionPipeline(this.task, modelId, {
                // Embeddings run efficiently on WASM/CPU
            });
            addLog(`[HuggingFace Embeddings] Embedding model '${modelId}' is loaded.`);
        }
        return this.instance;
    }
}


export const generateEmbeddings = async (
    modelId: string,
    texts: string[],
    addLog: (msg: string) => void,
): Promise<number[][]> => {
    try {
        const extractor = await HuggingFaceEmbeddingManager.getInstance(modelId, addLog);
        const output: Tensor = await extractor(texts, { pooling: 'mean', normalize: true });
        
        const batchSize = output.dims[0];
        const embeddingDim = output.dims[1];
        const flatData = Array.from(output.data as Float32Array);
        
        const embeddings: number[][] = [];
        for (let i = 0; i < batchSize; ++i) {
            embeddings.push(flatData.slice(i * embeddingDim, (i + 1) * embeddingDim));
        }
        
        return embeddings;
    } catch (error) {
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) errorMessage = error.message;
        addLog(`[HuggingFace Embeddings] FATAL ERROR: Failed to generate embeddings. ${errorMessage}`);
        throw new Error(`Failed to generate embeddings with Hugging Face model: ${errorMessage}`);
    }
};

/**
 * Generates text using a specified Hugging Face model running in the browser.
 */
export const generateTextWithHuggingFace = async (
    modelId: string, 
    systemInstruction: string,
    userPrompt: string, 
    quantization: string,
    device: HuggingFaceDevice,
    addLog: (msg: string) => void,
    setProgress?: (msg: string) => void,
): Promise<string> => {
    
    try {
        const generator = await HuggingFacePipelineManager.getInstance(modelId, quantization, device, addLog, setProgress);
        addLog(`[HuggingFace] Applying chat template for '${modelId}'...`);
        if (setProgress) setProgress('Formatting prompt...');

        const messages: Chat = [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
        ];

        const promptText = generator.tokenizer.apply_chat_template(messages, {
            tokenize: false,
            add_generation_prompt: true,
        }) as string;

        addLog(`[HuggingFace] Generating text with '${modelId}'...`);
        if (setProgress) setProgress('Generating text with in-browser model...');

        const output = await generator(promptText, {
            max_new_tokens: 1024,
            temperature: 0.2,
            top_k: 5,
            do_sample: true,
            return_full_text: false, 
        }) as Array<{ generated_text: string }>;

        let finalText = output[0]?.generated_text?.trim() ?? '';

        if (!finalText) {
            addLog(`[HuggingFace] WARN: Model returned an empty or invalid response.`);
            console.warn('HuggingFace unexpected output:', output);
            return '';
        }
        
        addLog(`[HuggingFace] Text generation successful. Raw length: ${finalText.length}`);
        
        const thinkTagRegex = /<think>[\s\S]*?<\/think>/gi;
        if (thinkTagRegex.test(finalText)) {
            const originalLength = finalText.length;
            finalText = finalText.replace(thinkTagRegex, '').trim();
            addLog(`[HuggingFace] Removed <think> tags from the response. New length: ${finalText.length} (was ${originalLength})`);
        }
        
        return finalText;

    } catch (error) {
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
            if (errorMessage.includes('VK_ERROR_OUT_OF_DEVICE_MEMORY') || errorMessage.toLowerCase().includes('out of memory')) {
                const enhancedMessage = "WebGPU ran out of memory during text generation. The model and prompt may be too large for your device's VRAM. Please try switching the 'Execution Device' to 'wasm' in the Advanced Settings.";
                addLog(`[HuggingFace] OOM ERROR: ${enhancedMessage}`);
                throw new Error(enhancedMessage);
            }
        }
        addLog(`[HuggingFace] FATAL ERROR: Failed to run model '${modelId}'. ${errorMessage}`);
        throw new Error(`Failed to generate text with Hugging Face model: ${errorMessage}`);
    }
};