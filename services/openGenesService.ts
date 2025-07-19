
export interface GeneSearchedRecord {
    id: number;
    symbol: string;
    name: string;
    researches?: {
        increaseLifespan?: {
            modelOrganism: string;
            interventionResultForLifespan: string;
            lifespanMeanChangePercent?: number;
            lifespanMinChangePercent?: number;
            lifespanMaxChangePercent?: number;
            interventions?: {
                controlAndExperiment: any[],
                experiment: {
                    interventionMethod: string;
                }[]
            };
        }[];
    };
    agingMechanisms?: { name: string; }[];
}

export interface OpenGeneSearchResponse {
    options: any;
    items: GeneSearchedRecord[];
}


/**
 * Performs a search over the live OpenGenes API.
 * @param query The search term.
 * @param addLog A function for logging debug messages.
 * @returns An array of matching gene records from the API.
 */
export const searchOpenGenesAPI = async (query: string, addLog: (message: string) => void): Promise<GeneSearchedRecord[]> => {
    const searchUrl = `https://open-genes.com/api/gene/search?bySuggestions=${encodeURIComponent(query)}&pageSize=10`;
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

        const data: OpenGeneSearchResponse = await response.json();
        addLog(`[Search.OpenGenes] Found ${data.items.length} matches from API.`);
        return data.items;

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        addLog(`[Search.OpenGenes] ERROR querying OpenGenes API: ${message}`);
        // Return empty on error to avoid breaking the federated search
        return [];
    }
};