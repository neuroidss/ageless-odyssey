# The Ageless Odyssey: A Longevity R&D Decision Engine

**Live Demo:** [https://neuroidss.github.io/ageless-odyssey/](https://neuroidss.github.io/ageless-odyssey/)

> "The goal is not to reverse aging, but to correct flawed development through superior engineering. A complete understanding of any system is the true path to its mastery." - The Engineering Paradigm

This project is a simulator for a new paradigm in longevity research. It shifts the focus from "anti-aging" to a more rigorous, systems-engineering approach. As highlighted by experts, longevity research faces a core **"chicken-and-egg" problem**: we need sensitive biomarkers to validate new interventions, but we need effective interventions to discover which biomarkers are truly meaningful. This is compounded by a **low signal-to-noise ratio**, making it difficult to distinguish real progress from statistical noise.

This application is an AI-powered decision engine designed to tackle this challenge. It frames the journey as a strategic allocation of resources to answer a critical question: **"How do you most effectively invest in our engineering understanding of life itself to escape the current research plateau?"**

You don't just research aging; you guide a team of AI agents to identify high-impact research trends, simulate funding R&D pipelines, and upgrade your own biological substrate. Your actions serve as a benchmark for a new form of human-AI co-evolution, with the ultimate goal of transcending biological limits through complete comprehension.

---

## Core Engine: The Longevity R&D Decision Engine

The application is fundamentally a prototype for an agent-driven system to prioritize spending and investment in the science of systems engineering, as applied to biology and beyond.

### What's Implemented

*   **Temporal Analysis Lobe:** A direct implementation of the core research methodology. This view allows comparing two "snapshots" of the research space (e.g., at time `t1` and `t2`) to visually identify new information clusters, providing a clear way to see how a field is evolving.

*   **Investment & Upgrade Portfolio:** The central feature is the **Engineering Portfolio**, a dashboard for allocating symbolic capital. It's split to directly address the "chicken-and-egg" problem:
    1.  **System Upgrades (The "Shopping Cart"):** For purchasing market-ready therapies (TRL 9) to improve the current biological system's performance and provide a stable baseline.
    2.  **R&D Investment Portfolio:** For allocating capital towards promising, low-TRL research to discover the next generation of interventions and the biomarkers needed to measure them.

*   **AI-Powered Trend Analysis for Deal Flow:** The `TrendSpotter` agent acts as a scientific analyst, identifying emerging research trends and scoring them on **Novelty**, **Velocity**, and **Impact**. This provides a scientific rationale for making investment decisions in the R&D Portfolio.

*   **Federated Data Collection:** A multi-service parser (`searchService.ts`) gathers information in real-time from **PubMed**, **bioRxiv**, **Google Patents**, and the **OpenGenes** database. This forms the evidence base for all agent analysis.

*   **Agent-Driven R&D Simulation:** The `InterventionMarketplace` simulates a Technology Readiness Level (TRL) pipeline. R&D stages are framed around core longevity challenges, such as "Biomarker Discovery" and "Preclinical Validation," directly reflecting the concepts from the hackathon lectures.

*   **Dynamic Knowledge Graph:** For each research query, the system generates a localized knowledge graph, visualizing the relationships between concepts (genes, compounds, processes). The "Temporal Snapshot" feature allows viewing the evolution of this graph over time.

### What's Conceptual or Not Yet Implemented

*   **Real Financial Integration:** The "investment" mechanic uses a symbolic `Capital` resource. The system is **not** connected to real-world financial data or venture capital models.

*   **Global, Persistent Ontology:** The app's knowledge graph is dynamic and query-scoped. It does **not** yet build towards a single, persistent, and curated global ontology.

*   **True Embedding & Clustering:** The "Temporal Analysis Lobe" visually *represents* the concept of comparing information clusters over time. It does not yet perform true vector embedding and t-SNE/UMAP clustering on the backend.

---

## Relation to Hackathon Tasks

The app's architecture directly engages with the hackathon's core challenges.

### Task: Longevity Knowledge Graph

*   **Status:** Strongly Supported.
*   **Implementation:** The app's `KnowledgeNavigator` agent builds a dynamic, interactive graph for every query. The "Temporal Snapshot" control allows users to see how this graph evolves with each new piece of information, turning it into a living map.

### Task: AI Agents for Extracting Bioactivity from Patents

*   **Status:** Partially Supported.
*   **Implementation:** The system includes a `CompoundAnalyst` agent and integrates **Google Patents** search. The R&D pipeline in the marketplace includes a "High-Throughput Screening" stage that uses this agent, directly connecting the task to the app's core mechanics.
*   **Gap:** The implementation is for ad-hoc analysis to advance a research goal, not a systematic pipeline for building a large, standalone dataset.

### Task: OpenGenes AI Benchmark

*   **Status:** Partially Supported.
*   **Implementation:** The `GeneAnalyst` agent uses the **OpenGenes API** and is prompted to extract structured data (organism, lifespan effect, intervention) directly inspired by the benchmark's requirements for high-quality, nuanced data.
*   **Gap:** The app **uses** the data in a manner consistent with the benchmark's goals but does not **evaluate** an LLM's performance against the OpenGenes ground truth.

---

## Supporting Features

*   **The Odyssey Framework:** Progressing through `Realms` (from Mortal Shell to Stellar Metamorph) provides a long-term goal and narrative structure.
*   **Personal Trajectory Simulation:** The biomarker simulation provides a feedback mechanism to make "System Upgrade" choices feel more personal.
*   **Achievements & Quests:** These provide short-term goals that guide the user through the app's capabilities.

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
