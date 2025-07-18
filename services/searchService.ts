import { SearchDataSource } from '../types';
import { generateEmbeddings } from './huggingFaceService';
import { searchOpenGenesAPI, type OpenGeneRecord } from './openGenesService';

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

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    if (vecA.length !== vecB.length || vecA.length === 0) {
        return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) {
        return 0;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const searchBioRxivRAG = async (query: string, addLog: (message: string) => void): Promise<SearchResult[]> => {
    addLog('[Search.BioRxivRAG] Starting RAG-based search over latest preprints...');
    // This feed provides the latest articles across all subjects, not a direct search.
    // The RAG approach will rank these articles for relevance against the query.
    const url = 'https://connect.biorxiv.org/biorxiv_xml.php?subject=all';
    const articles: { title: string, link: string, abstract: string, authors: string }[] = [];
    try {
        addLog(`[Search.BioRxivRAG] Fetching feed from ${url}`);
        const response = await fetchWithProxy(url, addLog);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'application/xml');
        const items = doc.querySelectorAll('item');
        
        items.forEach(item => {
            const titleEl = item.querySelector('title');
            const linkEl = item.querySelector('link');
            const descriptionEl = item.querySelector('description');
            const creatorEls = item.querySelectorAll('dc\\:creator');
            if (titleEl && linkEl) {
                articles.push({
                    title: titleEl.textContent || '',
                    link: linkEl.textContent || '',
                    abstract: descriptionEl ? stripTags(descriptionEl.textContent || '') : '',
                    authors: Array.from(creatorEls).map(el => el.textContent).join(', '),
                });
            }
        });
        addLog(`[Search.BioRxivRAG] Fetched and parsed ${articles.length} articles from feed.`);

        if (articles.length === 0) return [];
        
        addLog(`[Search.BioRxivRAG] Generating embeddings for query and ${articles.length} articles...`);
        const textsToEmbed = [
            query, 
            ...articles.map(a => `Title: ${a.title}\nAbstract: ${a.abstract}`)
        ];
        
        const embeddings = await generateEmbeddings('Xenova/all-MiniLM-L6-v2', textsToEmbed, addLog);
        const queryEmbedding = embeddings[0];
        const articleEmbeddings = embeddings.slice(1);
        addLog(`[Search.BioRxivRAG] Embeddings generated successfully.`);
        
        const articlesWithSimilarity = articles.map((article, index) => ({
            ...article,
            similarity: cosineSimilarity(queryEmbedding, articleEmbeddings[index])
        }));
        
        articlesWithSimilarity.sort((a, b) => b.similarity - a.similarity);
        
        addLog(`[Search.BioRxivRAG] Top 5 results by similarity: ${articlesWithSimilarity.slice(0, 5).map(a => `${a.title.slice(0,30)}... (${a.similarity.toFixed(3)})`).join(', ')}`);
        
        return articlesWithSimilarity.slice(0, 5).map(a => ({
            link: a.link,
            title: a.title,
            snippet: `Authors: ${a.authors}. Abstract: ${a.abstract.substring(0, 250)}... [Similarity: ${a.similarity.toFixed(3)}]`,
            source: SearchDataSource.BioRxivRAG
        }));

    } catch (error) {
        addLog(`[Search.BioRxivRAG] Error during RAG search: ${error}`);
        return [];
    }
};

/**
 * Searches bioRxiv via its full-text search interface.
 */
const searchBioRxivText = async (query: string, addLog: (message: string) => void): Promise<SearchResult[]> => {
    const url = `https://www.biorxiv.org/search/${encodeURIComponent(query)}`;
    const results: SearchResult[] = [];
    try {
        const response = await fetchWithProxy(url, addLog);
        const htmlContent = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const resultElements = doc.querySelectorAll('ul.highwire-search-results-list > li.search-result');

        resultElements.forEach(el => {
            const titleLink = el.querySelector<HTMLAnchorElement>('a.highwire-cite-linked-title');
            const authorsEl = el.querySelector('.highwire-cite-authors');
            const metadataEl = el.querySelector('.highwire-cite-metadata');

            if (titleLink) {
                const href = titleLink.getAttribute('href');
                if (href) {
                    const link = new URL(href, 'https://www.biorxiv.org').toString();
                    const title = titleLink.textContent?.trim() ?? 'No title';
                    const authors = authorsEl?.textContent?.trim().replace(/\s+/g, ' ') ?? '';
                    const metadata = metadataEl?.textContent?.trim().replace(/\s+/g, ' ') ?? '';
                    
                    results.push({
                        link,
                        title,
                        snippet: `Authors: ${authors}. ${metadata}`,
                        source: SearchDataSource.BioRxivText
                    });
                }
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addLog(`[Search.BioRxivText] Error searching bioRxiv: ${message}`);
    }
    return results.slice(0, 5); // Limit to top 5
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


const mapOpenGeneRecordToSearchResult = (record: OpenGeneRecord): SearchResult => {
    const lifespanChange = (record.lifespan_change_min_percent === record.lifespan_change_max_percent)
        ? `${record.lifespan_change_max_percent}%`
        : `${record.lifespan_change_min_percent}% to ${record.lifespan_change_max_percent}%`;
    
    // Safely access nested properties from the API response
    const hallmark = record.hallmarks_of_aging?.[0]?.name || 'N/A';
    const intervention = record.interventions?.[0]?.intervention_type?.name || 'N/A';
    const organism = record.organism?.name || 'N/A';

    return {
        title: `${record.gene_symbol} (${record.gene_name})`,
        link: `https://open-genes.com/gene/${record.gene_symbol}`,
        snippet: `Organism: ${organism}. Effect: ${record.lifespan_effect} (${lifespanChange}). Hallmark: ${hallmark}. Intervention: ${intervention}. Summary: ${record.summary_of_the_finding}`,
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
            case SearchDataSource.BioRxivRAG: return searchBioRxivRAG(query, addLog);
            case SearchDataSource.BioRxivText: return searchBioRxivText(query, addLog);
            case SearchDataSource.GooglePatents: return searchGooglePatents(query, addLog);
            case SearchDataSource.WebSearch: return searchWeb(query, addLog);
            case SearchDataSource.OpenGenes:
                return (async () => {
                    const openGenesResults = await searchOpenGenesAPI(query, addLog);
                    return openGenesResults.map(mapOpenGeneRecordToSearchResult);
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