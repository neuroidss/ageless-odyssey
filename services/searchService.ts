

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
}

/**
 * Performs a web search by parsing the HTML from DuckDuckGo's non-JS site.
 * This is more reliable for client-side applications than their JSON API.
 * @param query The search query.
 * @param addLog A function to log messages for debugging.
 * @returns A promise that resolves to an array of search results.
 */
export const searchDuckDuckGo = async (query: string, addLog: (message: string) => void): Promise<SearchResult[]> => {
    // The HTML endpoint is more reliable for scraping than the JSON API.
    const ddgHtmlUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    // Using a CORS proxy to allow the request from the browser.
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(ddgHtmlUrl)}`;
    
    addLog(`[Search] Querying DDG HTML via CORS proxy for: "${query}"`);

    try {
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) {
            const errorText = await proxyResponse.text();
            addLog(`[Search] ERROR: CORS proxy request failed with status ${proxyResponse.status}. Response: ${errorText}`);
            throw new Error(`CORS proxy request failed with status ${proxyResponse.status}`);
        }

        const proxyData = await proxyResponse.json();
        const htmlContent = proxyData.contents;

        if (!htmlContent) {
            addLog(`[Search] ERROR: CORS proxy response did not contain 'contents'. Raw proxy response: ${JSON.stringify(proxyData).substring(0, 500)}`);
            throw new Error("Invalid response structure from CORS proxy.");
        }
        
        addLog(`[Search] Received HTML content from proxy. Length: ${htmlContent.length}. Parsing results...`);

        const results: SearchResult[] = [];
        
        // This regex is designed to be robust. It finds a div that CONTAINS the 'web-result' class.
        const resultBlockRegex = /<div\s+class="[^"]*?\bweb-result\b[^"]*?">([\s\S]*?)<div class="clear"><\/div>/gs;

        // Regex to extract data from within a block.
        const linkTitleRegex = /<a rel="nofollow" class="result__a" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/;
        const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/;
        
        const stripTags = (html: string) => html.replace(/<[^>]*>?/gm, '').trim();

        let match;
        while ((match = resultBlockRegex.exec(htmlContent)) !== null) {
            const block = match[1];
            
            const linkTitleMatch = block.match(linkTitleRegex);
            const snippetMatch = block.match(snippetRegex);

            if (linkTitleMatch && snippetMatch) {
                const redirectUrl = linkTitleMatch[1];
                // The href can be inconsistent, so we safely create URLSearchParams
                const queryString = redirectUrl.includes('?') ? redirectUrl.split('?')[1] : '';
                const urlParams = new URLSearchParams(queryString);
                const actualLink = urlParams.get('uddg');

                if(actualLink) {
                    results.push({
                        link: decodeURIComponent(actualLink),
                        title: stripTags(linkTitleMatch[2]),
                        snippet: stripTags(snippetMatch[1])
                    });
                }
            }
        }
        
        addLog(`[Search] Success. Parsed ${results.length} results from HTML.`);
        
        const uniqueResults = Array.from(new Map(results.map(item => [item.link, item])).values());

        if (uniqueResults.length === 0) {
            addLog(`[Search] WARN: Parsing returned 0 results. The model may receive no context. Review raw HTML in console if needed.`);
            console.log("[Search] Raw HTML content received from proxy:", htmlContent);
        } else {
             addLog(`[Search] Found ${uniqueResults.length} unique results.`);
        }

        return uniqueResults.slice(0, 10);

    } catch (error) {
        let errorMessage = "Unknown error";
        if (error instanceof Error) errorMessage = error.message;
        addLog(`[Search] FATAL ERROR: Could not fetch or parse search results. ${errorMessage}`);
        console.error('Error fetching/parsing search results:', error);
        return [];
    }
};