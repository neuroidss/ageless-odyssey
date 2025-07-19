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

## How to Run Locally

This project is a static web application and does not require a Node.js environment or `npm` commands.

**Prerequisites:**
*   A modern web browser (like Chrome, Firefox, or Edge).
*   (Recommended) A local web server to avoid browser security restrictions (CORS).

**Instructions:**
1.  Download or clone the project files to your local machine.
2.  For full functionality with local models, ensure you have [Ollama](https://ollama.com/) installed and running.
3.  To avoid potential browser security restrictions when loading models, it's best to serve the files using a simple local web server.
    *   If you use **Visual Studio Code**, you can install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension. Right-click on `index.html` and choose "Open with Live Server".
    *   Alternatively, you can use Python's built-in server by running `python -m http.server` in the project's root directory.
4.  Once the server is running, open the provided local URL in your browser (e.g., `http://127.0.0.1:5500/` or `http://localhost:8000`).

### Using AI Models

*   **Local Models (Ollama / Hugging Face):** Select them from the "Advanced Settings" panel within the app. No API key is needed.
*   **Google AI (Gemini):** To use the Google AI models, you must provide your API key.
    1.  Click on the "Advanced Settings" button in the app.
    2.  Select a Google AI model from the dropdown.
    3.  An input field will appear. Paste your Google AI API Key here.
    
    *Your key is stored temporarily in your browser's session storage and is only used to communicate with the Google AI API. It is not saved to any files.*
