
# The Ageless Odyssey: An AI-Powered Systems Engineering Simulator

**Live Demo:** [https://neuroidss.github.io/ageless-odyssey/](https://neuroidss.github.io/ageless-odyssey/)

> "The goal is not to reverse aging, but to correct flawed development through superior engineering. A complete understanding of any system is the true path to its mastery." - The Engineering Paradigm

This project is a simulator for this new paradigm: moving beyond "anti-aging" to focus on correcting flawed biological development through superior engineering. The core premise is that a complete understanding of any system is the true path to its mastery. This app frames that journey as a decision-support tool to answer a critical question: **"How would you strategically allocate resources to accelerate our engineering understanding of life itself?"**

It's a simulator where you don't just research aging; you guide an AI system to identify high-impact systems to upgrade and promising research avenues to invest in for the future. Your actions serve as a benchmark for a new form of human-AI co-evolution, with the ultimate goal of transcending biological limits through complete comprehension.

This README provides a technical breakdown for experts and collaborators, contextualizing the app's features within the framework of several proposed longevity hackathon tasks.

---

## Core Engine: The "Priority Engineering" System

The application is fundamentally a prototype for an agent-driven system to prioritize spending and investment in the science of systems engineering, as applied to biology and beyond. It directly addresses the challenge of making informed decisions in a vast, complex, and rapidly evolving field.

### What's Implemented

*   **Investment & Upgrade Portfolio:** The central feature is the **Engineering Portfolio**, a dashboard for allocating a symbolic $10M in capital. It's split into two parts:
    1.  **System Upgrades (The "Shopping Cart"):** For purchasing market-ready therapies and diagnostics (TRL 9) to improve the current biological system's performance.
    2.  **R&D Investment Portfolio:** For allocating capital towards promising, low-TRL research, simulating venture investment in future technologies and deeper understanding.

*   **AI-Powered Trend Analysis for Deal Flow:** The `TrendSpotter` agent acts as a scientific analyst, identifying emerging research trends and scoring them on **Novelty**, **Velocity**, and **Impact**. This provides a scientific-based rationale for making investment decisions in the R&D Portfolio.

*   **Federated Data Collection:** A multi-service parser (`searchService.ts`) gathers information in real-time from multiple sources, including **PubMed**, **bioRxiv**, **Google Patents**, and the **OpenGenes** database. This forms the evidence base for all agent analysis.

*   **Agent-Driven R&D Simulation:** The `InterventionMarketplace` simulates a Technology Readiness Level (TRL) pipeline. Users can still fund specific R&D stages using `Memic` (knowledge) points, representing direct research efforts that are parallel to financial investment. The `Strategist` agent can be dispatched to solve complex R&D challenges.

*   **Dynamic Knowledge Graph:** For each research query, the system generates a localized, on-the-fly knowledge graph. This graph visualizes the relationships between concepts (genes, compounds, processes) discovered by the agents, providing a semantic map to support decision-making.

### What's Conceptual or Not Yet Implemented

*   **Real Financial Integration:** The "investment" mechanic uses a symbolic `Capital` resource. The system is **not** connected to real-world financial data, venture capital models, or stock markets. This would be a significant future extension.

*   **Comprehensive Ontology:** The knowledge graph is dynamic and scoped to each query. It is **not** a persistent, global, curated ontology like the "Systemic Scheme of Human Aging" diagram. Building such a canonical, long-term knowledge base is a monumental task and represents a major next step.

*   **True AI Reasoning:** The system's intelligence is derived from expertly crafted prompts sent to powerful Large Language Models (LLMs). It executes tasks based on these prompts but does not yet "understand" or learn in a persistent, independent way.

---

## Relation to Other Hackathon Tasks

The app's architecture touches upon two other key longevity tasks.

### Task 1: Collecting Ligand-Protein Binding Data from Patents

*   **Status:** Partially Supported.
*   **Implementation:** The system includes a `CompoundAnalyst` agent and integrates **Google Patents** into its search federation. It *can* be prompted to extract compound names, targets, and binding affinities from patent text for ad-hoc analysis.
*   **Gap:** The current implementation is **not** a systematic pipeline for building a large dataset (e.g., 10k entries). It does not perform validation against a database like BindingDB, nor is it designed to output a structured CSV file. It uses patent search as one of many tools in its analytical arsenal.

### Task 3: Creating an LLM Benchmark with OpenGenes

*   **Status:** Partially Supported.
*   **Implementation:** The system directly integrates with the **OpenGenes API** as a primary data source for the `GeneAnalyst` agent. This means it can successfully perform the *data extraction* part of the task—finding genes and their associated properties from the database.
*   **Gap:** The app **uses** OpenGenes data but does not **evaluate** an LLM against it. The core benchmarking loop—generating questions, feeding them to an LLM, and programmatically comparing the LLM's answers to the ground-truth annotations to score its performance—is not implemented.

---

## Supporting Features

To make the complex process of investment exploration more engaging, a narrative and gamification layer is wrapped around the core engine.

*   **The Odyssey Framework:** The concept of progressing through `Realms` (from Mortal Shell to Stellar Metamorph) provides a long-term goal and sense of epic progression.
*   **Personal Trajectory Simulation:** The simulation of personal biomarkers is a feedback mechanism to make the "System Upgrades" choices feel more personal and impactful.
*   **Achievements & Quests:** These provide short-term goals and rewards, guiding the user through the app's capabilities.

---

## How to Run Locally

**Prerequisites:** [Node.js](https://nodejs.org/)

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up your environment (Optional, for Google AI Models):**
    If you wish to use Google AI's models, create a file named `.env.local` in the project's root directory. Inside this file, add your Gemini API key:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    For local models (Ollama, Hugging Face), this step is not required.

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
This will start the development server, and you can view the application in your browser at the local URL provided in your terminal (usually `http://localhost:5173` or similar).