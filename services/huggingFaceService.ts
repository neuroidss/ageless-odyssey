
import { pipeline, type TextGenerationPipeline, type Chat } from '@huggingface/transformers';

/**
 * Manages the singleton instance of a Hugging Face text-generation pipeline.
 * This prevents re-downloading the model on every call.
 */
class HuggingFacePipelineManager {
    static task: 'text-generation' = 'text-generation';
    static modelId: string | null = null;
    static instance: TextGenerationPipeline | null = null;

    /**
     * Gets the singleton pipeline instance. If the model ID changes,
     * it disposes of the old pipeline and creates a new one.
     * @param modelId The Hugging Face model ID.
     * @param addLog A function to log progress.
     * @returns A promise that resolves to the text generation pipeline.
     */
    static async getInstance(modelId: string, addLog: (msg: string) => void): Promise<TextGenerationPipeline> {
        if (this.modelId !== modelId || this.instance === null) {
            if (this.instance) {
                addLog('[HuggingFace v3] Disposing old model pipeline...');
                await this.instance.dispose();
            }
            
            this.modelId = modelId;
            // Forcing WASM backend to prevent WebGPU crashes on certain browser/driver versions.
            // This ensures stability at the cost of some performance.
            addLog(`[HuggingFace v3] Loading model pipeline for '${modelId}' using WASM (CPU) backend for stability.`);
            
            // Explicitly type pipeline options to prevent TypeScript from generating a union type that is too complex.
            const pipelineOptions: {
                device: string;
                dtype: string;
                progress_callback: (progress: any) => void;
            } = {
                device: 'wasm',    // Force CPU execution via WebAssembly to prevent WebGPU errors.
                dtype: 'q4',       // Use a compatible quantization for CPU.
                progress_callback: (progress: any) => {
                    if (progress.status === 'progress') {
                        const percentage = (progress.progress).toFixed(2);
                        addLog(`[HuggingFace v3] Loading: ${progress.file} (${percentage}%)`);
                    } else if (progress.status === 'done') {
                        addLog(`[HuggingFace v3] Finished loading: ${progress.file}`);
                    } else if (progress.status === 'ready') {
                         addLog(`[HuggingFace v3] Model pipeline is ready.`);
                    }
                }
            };
            
            this.instance = await pipeline(this.task, this.modelId, pipelineOptions) as TextGenerationPipeline;
            addLog(`[HuggingFace v3] Model '${modelId}' is fully loaded and ready.`);
        }
        return this.instance;
    }
}


/**
 * Generates text using a specified Hugging Face model running in the browser.
 * @param modelId The ID of the model to use (e.g., 'onnx-community/gemma-3n-E2B-it-ONNX').
 * @param systemInstruction The system prompt for the model.
 * @param userPrompt The user's prompt.
 * @param addLog A function to log messages for debugging.
 * @returns A promise that resolves to the generated text.
 */
export const generateTextWithHuggingFace = async (
    modelId: string, 
    systemInstruction: string,
    userPrompt: string, 
    addLog: (msg: string) => void
): Promise<string> => {
    
    try {
        const generator = await HuggingFacePipelineManager.getInstance(modelId, addLog);
        addLog(`[HuggingFace v3] Applying chat template for '${modelId}'...`);

        const messages: Chat = [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
        ];

        // Manually apply the chat template to create a single prompt string.
        // This is more robust than passing the array of messages directly.
        const promptText = generator.tokenizer.apply_chat_template(messages, {
            tokenize: false,
            add_generation_prompt: true,
        }) as string;

        addLog(`[HuggingFace v3] Generating text with '${modelId}'...`);

        // Generate text from the formatted prompt string.
        const output = await generator(promptText, {
            max_new_tokens: 1024,
            temperature: 0.2, // Lower temperature for more deterministic JSON output
            top_k: 5,
            do_sample: true,
            // We want only the newly generated text, not the prompt.
            return_full_text: false, 
        }) as Array<{ generated_text: string }>;

        const finalText = output[0]?.generated_text?.trim() ?? '';

        if (!finalText) {
            addLog(`[HuggingFace v3] WARN: Model returned an empty or invalid response.`);
            console.warn('HuggingFace v3 unexpected output:', output);
            return '';
        }
        
        addLog(`[HuggingFace v3] Text generation successful. Raw length: ${finalText.length}`);
        return finalText;

    } catch (error) {
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        addLog(`[HuggingFace v3] FATAL ERROR: Failed to run model '${modelId}'. ${errorMessage}`);
        throw new Error(`Failed to generate text with Hugging Face model: ${errorMessage}`);
    }
};