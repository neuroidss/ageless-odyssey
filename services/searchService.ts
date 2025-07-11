
/**
 * @fileoverview Service for performing web searches.
 * 
 * NOTE: Direct client-side calls to search engine APIs are typically blocked by CORS policies.
 * To make web search for Ollama models functional, a simple proxy server is required.
 * This proxy will receive a request from this app and forward it to a search service,
 * then return the response. This bypasses the browser's CORS restrictions.
 * 
 * You can find many simple CORS proxy examples online for Node.js, Python, etc.
 * Once you have a proxy running, set its URL in the DUCKDUCKGO_PROXY_URL constant below.
 * The proxy should accept a query like `https://your-proxy.com/search?q=your_query`
 * and return a JSON array of SearchResult objects.
 */

// TODO: Replace with the URL of your own CORS proxy.
// Example: 'https://my-cors-proxy.glitch.me/search?q='
const DUCKDUCKGO_PROXY_URL = ''; 

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
}

/**
 * Performs a web search using a configured proxy for DuckDuckGo.
 * @param query The search query.
 * @param addLog A function to log messages for debugging.
 * @returns A promise that resolves to an array of search results.
 */
export const searchDuckDuckGo = async (query: string, addLog: (message: string) => void): Promise<SearchResult[]> => {
    if (!DUCKDUCKGO_PROXY_URL) {
        addLog('WARN: DuckDuckGo search proxy URL not configured in `services/searchService.ts`. Ollama models will operate without web access and may hallucinate sources.');
        return []; // Fail gracefully, allowing the app to work without search.
    }
    
    addLog(`[Search] Querying proxy for: "${query}"`);
    try {
        const response = await fetch(`${DUCKDUCKGO_PROXY_URL}${encodeURIComponent(query)}`);
        if (!response.ok) {
            const errorText = await response.text();
            addLog(`[Search] ERROR: Proxy request failed with status ${response.status}. Response: ${errorText}`);
            throw new Error(`Proxy request failed with status ${response.status}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
            const validResults = data.filter(r => r.title && r.link && r.snippet) as SearchResult[];
            addLog(`[Search] Success. Received ${data.length} results from proxy, ${validResults.length} are valid.`);
            return validResults;
        }
        
        addLog('[Search] ERROR: Proxy response is not a valid JSON array of search results.');
        console.error('Proxy response is not a valid JSON array of search results.', data);
        return [];

    } catch (error) {
        addLog(`[Search] FATAL ERROR: Could not fetch or parse search results via proxy: ${error}`);
        console.error('Error fetching search results via proxy:', error);
        // Return empty array to prevent crashing the agent.
        return [];
    }
};
