import { SearchDataSource } from '../types';
import { generateEmbeddings } from './huggingFaceService';
import { searchOpenGenesAPI, type GeneSearchedRecord } from './openGenesService';

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    source: SearchDataSource;
}

// An array of functions, each responsible for building a complete URL for a specific CORS proxy.
// This handles the different URL structures required by each proxy service.
type ProxyUrlBuilder = (url: string) => string;

const PROXY_BUILDERS: ProxyUrlBuilder[] = [
    // corsproxy.io expects the target URL as a query parameter.
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // allorigins.win expects the target URL in a 'url' query parameter.
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    // thingproxy expects the target URL as part of the path, not as a query parameter.
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
];


const fetchWithProxy = async (url: string, addLog: (message: string) => void): Promise<Response> => {
    // Shuffle the builders to distribute load and avoid relying on a single proxy.
    const shuffledBuilders = [...PROXY_BUILDERS].sort(() => Math.random() - 0.5);

    for (const buildProxyUrl of shuffledBuilders) {
        const proxyUrl = buildProxyUrl(url);
        // Extract a readable name for logging purposes.
        const proxyName = proxyUrl.match(/https:\/\/([^/]+)/)?.[1] || 'unknown';
        try {
            addLog(`[Fetch] Attempting to fetch ${url} via proxy: ${proxyName}`);
            // Use 'cors' mode and a common 'X-Requested-With' header.
            const response = await fetch(proxyUrl, { mode: 'cors', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!response.ok) {
                const errorText = await response.text();
                addLog(`[Fetch] WARN: Proxy ${proxyName} failed with status ${response.status}. Trying next. Error: ${errorText.substring(0, 150)}`);
                continue; // Try the next proxy in the list.
            }
            addLog(`[Fetch] Success with proxy: ${proxyName}`);
            return response;
        } catch (error) {
            let errorMessage = "Unknown error";
            if (error instanceof Error) errorMessage = error.message;
            addLog(`[Fetch] WARN: Proxy ${proxyName} threw an error: ${errorMessage}. Trying next proxy.`);
        }
    }
    // If all proxies fail, throw an error.
    throw new Error(`All CORS proxies failed for URL: ${url}`);
};

const stripTags = (html: string) => html.replace(/<[^>]*>?/gm, '').trim();

/**
 * Performs a web search using DuckDuckGo's non-JS site.
 */
const searchWeb = async (query: string, addLog: (message: string) => void): Promise<SearchResult[]> => {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const results: SearchResult[] = [];
    try {
        const response = await fetchWithProxy(url, addLog);
        const htmlContent = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const resultElements = doc.querySelectorAll('.web-result');
        
        resultElements.forEach(el => {
            const titleLink = el.querySelector<HTMLAnchorElement>('a.result__a');
            const snippetEl = el.querySelector('.result__snippet');

            if (titleLink && snippetEl) {
                const hrefAttr = titleLink.getAttribute('href');
                if (hrefAttr) {
                    // Provide a base URL to handle protocol-relative URLs robustly.
                    const redirectUrl = new URL(hrefAttr, 'https://duckduckgo.com');
                    const actualLink = redirectUrl.searchParams.get('uddg');

                    if (actualLink) {
                        results.push({
                            link: actualLink,
                            title: (titleLink.textContent || '').trim(),
                            snippet: (snippetEl.textContent || '').trim(),
                            source: SearchDataSource.WebSearch
                        });
                    }
                }
            }
        });

    } catch (error) {
        addLog(`[Search.Web] Error searching DuckDuckGo: ${error}`);
    }
    return results.slice(0, 5); // Limit to top 5
};

/**
 * Searches PubMed for scientific articles. This API is CORS-enabled and does not require a proxy.
 */
const searchPubMed = async (query: string, addLog: (message: string) => void): Promise<SearchResult[]> => {
    const results: SearchResult[] = [];
    try {
        addLog(`[Fetch] Attempting to fetch PubMed directly (no proxy).`);
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&sort=relevance&retmax=5`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error(`PubMed search failed with status ${searchResponse.status}`);
        const searchData = await searchResponse.json();
        const ids: string[] = searchData.esearchresult.idlist;

        if (ids && ids.length > 0) {
            const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
            const summaryResponse = await fetch(summaryUrl);
             if (!summaryResponse.ok) throw new Error(`PubMed summary failed with status ${summaryResponse.status}`);
            const summaryData = await summaryResponse.json();
            
            ids.forEach(id => {
                const article = summaryData.result[id];
                if (article) {
                    results.push({
                        link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
                        title: article.title,
                        snippet: `Authors: ${article.authors.map((a: {name: string}) => a.name).join(', ')}. Journal: ${article.source}. PubDate: ${article.pubdate}`,
                        source: SearchDataSource.PubMed
                    });
                }
            });
             addLog(`[Fetch] Success with PubMed API.`);
        }
    } catch (error) {
        addLog(`[Search.PubMed] Error searching PubMed: ${error}`);
    }
    return results;
};

const searchBioRxivArchive = async (query: string, addLog: (message: string) => void): Promise<SearchResult[]> => {
    addLog(`[Search.BioRxivArchive] Starting search via PubMed Central API...`);
    const results: SearchResult[] = [];
    try {
        // Process the query to be more flexible for PubMed's search engine.
        // Replace spaces with OR and remove common stop words to broaden the search.
        const stopWords = new Set(['and', 'for', 'in', 'of', 'the', 'a', 'an']);
        const processedQuery = query
            .split(/\s+/)
            .filter(term => !stopWords.has(term.toLowerCase()))
            .join(' OR ');

        const enhancedQuery = `(${processedQuery}) AND biorxiv[journal]`;
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${encodeURIComponent(enhancedQuery)}&retmode=json&sort=relevance&retmax=5`;
        
        addLog(`[Fetch] Querying PMC for bioRxiv preprints with processed query: ${enhancedQuery}`);
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error(`PMC search for bioRxiv failed with status ${searchResponse.status}`);
        
        const searchData = await searchResponse.json();
        const ids: string[] = searchData.esearchresult.idlist;

        if (ids && ids.length > 0) {
            const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&id=${ids.join(',')}&retmode=json`;
            const summaryResponse = await fetch(summaryUrl);
            if (!summaryResponse.ok) throw new Error(`PMC summary failed with status ${summaryResponse.status}`);
            
            const summaryData = await summaryResponse.json();
            
            ids.forEach(id => {
                const article = summaryData.result[id];
                if (article) {
                    const pmcId = article.articleids.find((aid: { idtype: string, value: string }) => aid.idtype === 'pmc')?.value;
                    const link = pmcId 
                        ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/`
                        : `https://pubmed.ncbi.nlm.nih.gov/${id}/`; // Fallback to PubMed link for uniqueness

                    results.push({
                        link: link,
                        title: article.title,
                        snippet: `Authors: ${article.authors.map((a: {name: string}) => a.name).join(', ')}. PubDate: ${article.pubdate}.`,
                        source: SearchDataSource.BioRxivSearch
                    });
                }
            });
            addLog(`[Fetch] Success with PMC API for bioRxiv search. Found ${results.length} results.`);
        } else {
            addLog(`[Fetch] No bioRxiv preprints found in PMC for the query.`);
        }
    } catch (error) {
        addLog(`[Search.BioRxivArchive] Error searching via PMC: ${error}`);
    }
    return results;
};

const monitorBioRxivFeed = async (query: string, addLog: (message: string) => void): Promise<SearchResult[]> => {
    const feedUrl = 'https://connect.biorxiv.org/biorxiv_xml.php?subject=all';
    addLog(`[Search.BioRxivFeed] Monitoring live feed from ${feedUrl}`);
    const results: SearchResult[] = [];
    try {
        // BioRxiv RSS feed is CORS-enabled, no proxy needed.
        const response = await fetch(feedUrl);
        if (!response.ok) throw new Error(`bioRxiv RSS feed failed with status ${response.status}`);
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, "application/xml");
        const items = doc.querySelectorAll("item");

        const queryKeywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2); // Simple keyword extraction

        items.forEach(item => {
            const title = item.querySelector("title")?.textContent ?? '';
            const link = item.querySelector("link")?.textContent ?? '';
            const description = item.querySelector("description")?.textContent ?? '';
            
            const contentToCheck = `${title.toLowerCase()} ${description.toLowerCase()}`;
            
            // Check if the content is relevant to the query
            const isRelevant = queryKeywords.some(keyword => contentToCheck.includes(keyword));

            if (isRelevant && link) {
                results.push({
                    title: stripTags(title),
                    link: stripTags(link),
                    snippet: stripTags(description).substring(0, 300) + '...',
                    source: SearchDataSource.BioRxivFeed,
                });
            }
        });
        addLog(`[Search.BioRxivFeed] Found ${results.length} relevant preprints in the live feed.`);
        return results.slice(0, 5); // Return top 5 relevant matches from the feed
    } catch (error) {
        addLog(`[Search.BioRxivFeed] Error monitoring live feed: ${error}`);
        return [];
    }
};


/**
 * Searches Google Patents. Requires CORS proxy.
 */
const searchGooglePatents = async (query: string, addLog: (message: string) => void): Promise<SearchResult[]> => {
    const url = `https://patents.google.com/xhr/query?url=q%3D${encodeURIComponent(query)}`;
    const results: SearchResult[] = [];
    try {
        const response = await fetchWithProxy(url, addLog);
        const rawText = await response.text();
        
        // Response is JSONP-like, starts with ')]}' or similar. Find the first '{'.
        const firstBraceIndex = rawText.indexOf('{');
        if (firstBraceIndex === -1) {
            throw new Error(`No JSON object found in response. Body starts with: ${rawText.substring(0, 150)}`);
        }
        const jsonText = rawText.substring(firstBraceIndex);
        const data = JSON.parse(jsonText);
        
        const patents = data.results?.cluster?.[0]?.result || [];
        patents.slice(0, 5).forEach((item: any) => {
            if (item && item.patent) {
                const patent = item.patent;
                // Robustly handle inventor and assignee names, which can be arrays or strings.
                const inventors = (patent.inventor_normalized && Array.isArray(patent.inventor_normalized)) 
                    ? stripTags(patent.inventor_normalized.join(', ')) 
                    : (patent.inventor ? stripTags(patent.inventor) : 'N/A');

                const assignees = (patent.assignee_normalized && Array.isArray(patent.assignee_normalized))
                    ? stripTags(patent.assignee_normalized.join(', '))
                    : (patent.assignee ? stripTags(patent.assignee) : 'N/A');

                results.push({
                    link: `https://patents.google.com/patent/${patent.publication_number}/en`,
                    title: stripTags(patent.title || 'No Title'),
                    snippet: `Inventor: ${inventors}. Assignee: ${assignees}. Publication Date: ${patent.publication_date || 'N/A'}`,
                    source: SearchDataSource.GooglePatents
                });
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addLog(`[Search.Patents] Error searching Google Patents: ${message}`);
    }
    return results;
};


const mapGeneSearchedToSearchResult = (record: GeneSearchedRecord): SearchResult => {
    const firstLifespanResearch = record.researches?.increaseLifespan?.[0];
    let lifespanChange = 'N/A';
    let lifespanEffect = 'unclear';

    if (firstLifespanResearch) {
        lifespanEffect = firstLifespanResearch.interventionResultForLifespan || 'unclear';
        const min = firstLifespanResearch.lifespanMinChangePercent;
        const max = firstLifespanResearch.lifespanMaxChangePercent;
        const mean = firstLifespanResearch.lifespanMeanChangePercent;
        
        if (min !== undefined && max !== undefined) {
             lifespanChange = (min === max) ? `${max}%` : `${min}% to ${max}%`;
        } else if (max !== undefined) {
            lifespanChange = `${max}%`;
        } else if (mean !== undefined) {
            lifespanChange = `~${mean}%`;
        }
    }
    
    const hallmark = record.agingMechanisms?.[0]?.name || 'N/A';
    const intervention = firstLifespanResearch?.interventions?.experiment?.[0]?.interventionMethod || 'N/A';
    const organism = firstLifespanResearch?.modelOrganism || 'N/A';

    // Construct a meaningful snippet from available data
    const snippet = `Organism: ${organism}. Effect: ${lifespanEffect} (${lifespanChange}). Hallmark: ${hallmark}. Intervention: ${intervention}.`;

    return {
        title: `${record.symbol} (${record.name})`,
        link: `https://open-genes.com/api/gene/${record.symbol}`,
        snippet: snippet,
        source: SearchDataSource.OpenGenes,
    };
};


/**
 * Performs a federated search across multiple scientific and web sources.
 * @param query The search query.
 * @param sources An array of `SearchDataSource` enums specifying which sources to query.
 * @param addLog A function to log messages for debugging.
 * @returns A promise that resolves to an aggregated and de-duplicated array of search results.
 */
export const performFederatedSearch = async (
    query: string,
    sources: SearchDataSource[],
    addLog: (message: string) => void
): Promise<SearchResult[]> => {
    let allResults: SearchResult[] = [];
    
    addLog(`[Search] Starting federated search for "${query}" across sources: ${sources.join(', ')}`);

    const searchPromises = sources.map(source => {
        switch(source) {
            case SearchDataSource.PubMed: return searchPubMed(query, addLog);
            case SearchDataSource.BioRxivSearch: return searchBioRxivArchive(query, addLog);
            case SearchDataSource.BioRxivFeed: return monitorBioRxivFeed(query, addLog);
            case SearchDataSource.GooglePatents: return searchGooglePatents(query, addLog);
            case SearchDataSource.WebSearch: return searchWeb(query, addLog);
            case SearchDataSource.OpenGenes:
                return (async () => {
                    const openGenesResults = await searchOpenGenesAPI(query, addLog);
                    return openGenesResults.map(mapGeneSearchedToSearchResult);
                })();
            default: return Promise.resolve([]);
        }
    });

    const resultsBySource = await Promise.allSettled(searchPromises);

    resultsBySource.forEach((result, index) => {
        const sourceName = sources[index];
        if (result.status === 'fulfilled' && result.value) {
            addLog(`[Search] ${sourceName} returned ${result.value.length} results.`);
            allResults.push(...result.value);
        } else {
            addLog(`[Search] WARN: ${sourceName} search failed: ${result.status === 'rejected' ? result.reason : 'No value returned'}`);
        }
    });

    // De-duplicate results based on the link
    const uniqueResults = Array.from(new Map(allResults.map(item => [item.link, item])).values());
    addLog(`[Search] Federated search complete. Total unique results: ${uniqueResults.length}`);
    return uniqueResults;
};