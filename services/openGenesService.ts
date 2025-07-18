
export interface OpenGeneAPIResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OpenGeneRecord[];
}

export interface OpenGeneRecord {
    id: number;
    gene_symbol: string;
    gene_name: string;
    organism: { name: string; };
    lifespan_effect: 'pro-longevity' | 'anti-longevity' | 'unclear';
    lifespan_change_max_percent: number;
    lifespan_change_min_percent: number;
    hallmarks_of_aging: { name: string; }[];
    interventions: { intervention_type: { name: string; } }[];
    primary_citation_pubmed_id: string;
    summary_of_the_finding: string;
}


/**
 * Performs a search over the live OpenGenes API.
 * @param query The search term.
 * @param addLog A function for logging debug messages.
 * @returns An array of matching gene records from the API.
 */
export const searchOpenGenesAPI = async (query: string, addLog: (message: string) => void): Promise<OpenGeneRecord[]> => {
    const searchUrl = `https://open-genes.com/api/v1/genes/?search=${encodeURIComponent(query)}&page_size=10`;
    addLog(`[Search.OpenGenes] Querying live API at: ${searchUrl}`);

    if (!query) {
        addLog(`[Search.OpenGenes] Empty query, returning empty results from API search.`);
        return [];
    }

    try {
        const response = await fetch(searchUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data: OpenGeneAPIResponse = await response.json();
        addLog(`[Search.OpenGenes] Found ${data.results.length} matches from API.`);
        return data.results;

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        addLog(`[Search.OpenGenes] ERROR querying OpenGenes API: ${message}`);
        // Return empty on error to avoid breaking the federated search
        return [];
    }
};
