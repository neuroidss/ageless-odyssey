# The Ageless Odyssey

**Live Demo:** [https://neuroidss.github.io/ageless-odyssey/](https://neuroidss.github.io/ageless-odyssey/)

## Description

> A simulator for humanity's evolution. Your goal is not just to conquer aging, but to build and guide an AI Oracle capable of understanding the universe. Your research acts as a benchmark for this new form of co-evolution. Chart a course from mortal shell to interstellar entity by mastering both biology and intelligence.

The Ageless Odyssey is an interactive simulation where you direct the course of longevity research. Your mission is to evolve beyond biological constraints by leveraging advanced AI agents to explore scientific literature, discover emerging trends, and forge new research quests.

## Key Features

*   **AI-Powered Agents**: Dispatch specialized agents like the `TrendSpotter`, `KnowledgeNavigator`, `GeneAnalyst`, and `CompoundAnalyst` to explore complex topics.
*   **Dynamic Trend Detection**: Utilize the "Singularity Detector" to identify high-velocity, high-impact trends in longevity and rejuvenation research.
*   **Interactive Knowledge Graph**: Visualize the relationships between genes, compounds, and biological processes in an interactive, force-directed graph that evolves with your research.
*   **Ascension Framework**: Progress through distinct "Realms" of existence, from the *Mortal Shell* to the *Stellar Metamorph*, by achieving milestones in biological and cognitive enhancement.
*   **Longevity Trajectory Simulation**: Monitor and influence key biomarkers of aging. Unlock and apply interventions to see their simulated effect on your biological age.
*   **Dynamic Quest System**: Forge new research quests directly from discovered trends, creating an ever-expanding set of objectives.
*   **Multi-Model Support**: Seamlessly switch between cutting-edge AI models, including:
    *   **Cloud Models**: Google's Gemini family for powerful, grounded responses.
    *   **Local Models**: Run models like Gemma and Qwen locally via Ollama.
    *   **In-Browser Models**: Experiment with Hugging Face Transformers.js models running directly in your browser via WebGPU or WASM.
*   **Autonomous Mode**: Enable an autonomous agent to continuously scan the horizon for radical life extension trends in the background.

## Run Locally

**Prerequisites:** [Node.js](https://nodejs.org/)

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up your environment:**
    Create a file named `.env.local` in the project's root directory. Inside this file, add your Gemini API key:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    This step is required to use Google AI models. For local models (Ollama, Hugging Face), this can be left blank, but the file should still exist.

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
This will start the development server, and you can view the application in your browser at the local URL provided in your terminal (usually `http://localhost:5173` or similar).