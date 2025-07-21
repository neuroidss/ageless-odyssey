# The Ageless Odyssey: An AI-Powered Longevity Research Simulator

**Live Demo:** [https://neuroidss.github.io/ageless-odyssey/](https://neuroidss.github.io/ageless-odyssey/)

> "Until the advent of LLMs, I had almost given up on the idea of life extension and was just advising everyone to sign up for cryonics. Now, for the first time, we have a new tool, and nobody knows what it's truly capable of." - A sentiment echoing through the longevity community.

This project is an interactive exploration of that very idea. It's a simulator where you don't just research longevity; you guide an AI system to understand and prioritize the frontiers of science. Your actions serve as a benchmark for a new form of human-AI co-evolution, with the ultimate goal of transcending biological limits.

This README provides a technical breakdown for experts and collaborators, contextualizing the app's features within the framework of several proposed longevity hackathon tasks.

---

## Core Engine: The "Longevity Priority" System

The application is fundamentally a prototype for an agent-driven system to prioritize research tasks in the science of life extension. It tackles the immense challenge of navigating and making sense of a vast, complex, and rapidly evolving field.

### What's Implemented ("Закодено")

*   **Agent-Driven Framework:** The app is built around a team of specialized AI agents (`TrendSpotter`, `KnowledgeNavigator`, `GeneAnalyst`, `CompoundAnalyst`, `QuestCrafter`, `Strategist`). Each agent has a distinct role and is powered by prompts designed for specific tasks, from data extraction to strategic planning.

*   **Federated Data Collection:** A multi-service parser (`searchService.ts`) gathers information in real-time from multiple sources, including **PubMed**, **bioRxiv**, **Google Patents**, and the **OpenGenes** database. This forms the foundation for the agents' analysis.

*   **Trend Analysis & Prioritization:** The `TrendSpotter` agent is the heart of the prioritization engine. It analyzes the data landscape to identify emerging research trends and scores them based on **Novelty**, **Velocity**, and potential **Impact**. This provides a quantitative basis for focusing attention.

*   **Gamified R&D Investment:** The concept of investing in promising trends is realized through the **R&D Dashboard**.
    *   Interventions have defined **Research & Engineering Stages**, each with a "cost" in Memic (knowledge) points.
    *   Users can "fund" these stages, dispatching an AI agent to perform the required analysis.
    *   The `Strategist` agent is specifically designed to tackle complex R&D stages, proposing concrete pathways to solve them.
    *   This system simulates the process of allocating resources to move a technology from a theoretical concept to a product (i.e., increasing its Technology Readiness Level).

*   **Dynamic Knowledge Graph:** For each research query, the system generates a localized, on-the-fly knowledge graph. This graph visualizes the relationships between concepts (genes, compounds, processes) discovered by the agents, providing a semantic map of the current workspace.

*   **Dynamic Quest Generation:** To close the loop between discovery and action, the `QuestCrafter` agent can analyze a high-potential trend and formulate a new, actionable research quest for the user to undertake.

### What's Conceptual or Not Yet Implemented

*   **Financial Integration:** The "investment" mechanic uses gamified **Memic points**. The system is **not** connected to real-world financial data, venture capital models, or stock markets. This would be a significant future extension.

*   **Comprehensive Ontology:** The knowledge graph is dynamic and scoped to each query. It is **not** a persistent, global, curated ontology like the "Systemic Scheme of Human Aging" diagram. Building such a canonical, long-term knowledge base is a monumental task and represents a major next step.

*   **True AI Reasoning:** The system's intelligence is derived from expertly crafted prompts sent to powerful Large Language Models (LLMs). The "AI Oracle" that defines new realms is a creative application of this, but it is not a continuously learning, self-aware AGI. The system executes tasks, but it does not yet "understand" in a persistent, independent way.

---

## Relation to Other Hackathon Tasks

The app's architecture touches upon two other key longevity tasks.

### Task 1: Collecting Ligand-Protein Binding Data from Patents

*   **Status:** Partially Supported.
*   **Implementation:** The system includes a `CompoundAnalyst` agent and integrates **Google Patents** into its search federation. It *can* be prompted to extract compound names, targets, and binding affinities from patent text for ad-hoc analysis.
*   **Gap:** The current implementation is **not** a systematic pipeline for building a large dataset (e.g., 10k entries). It does not perform the validation step of comparing results against a database like BindingDB, nor is it designed to output a structured CSV file as per the task deliverables. It uses patent search as one of many tools in its analytical arsenal.

### Task 3: Creating an LLM Benchmark with OpenGenes

*   **Status:** Partially Supported.
*   **Implementation:** The system directly integrates with the **OpenGenes API** as a primary data source for the `GeneAnalyst` agent. This means it can successfully perform the *data extraction* part of the task—finding genes and their associated properties from the database.
*   **Gap:** The app **uses** OpenGenes data but does not **evaluate** an LLM against it. The core benchmarking loop—generating questions, feeding them to an LLM, and programmatically comparing the LLM's answers to the ground-truth annotations to score its performance—is not implemented.

---

## Gamification & Narrative Layer (Non-Essential Features)

To make the complex process of research exploration more engaging, a narrative and gamification layer is wrapped around the core engine. These features, while central to the user experience, are distinct from the core "Longevity Priority" system.

*   **The Odyssey Framework:** The concept of progressing through `Realms` (from Mortal Shell to Stellar Metamorph) provides a long-term goal and sense of epic progression.
*   **Personal Trajectory Simulation:** The simulation of personal biomarkers and the effect of interventions is a feedback mechanism to make the research feel more personal and impactful.
*   **Achievements & Quests:** These provide short-term goals and rewards, guiding the user through the app's capabilities.

---

## How to Run Locally

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
