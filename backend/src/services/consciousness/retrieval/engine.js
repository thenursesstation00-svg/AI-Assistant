/**
 * Information Retrieval Cognitive Loop
 * Core component of AI Consciousness Evolution
 *
 * This module implements the continuous learning cycle that fetches,
 * processes, and integrates global knowledge in real-time.
 */

const axios = require('axios');
const crypto = require('crypto');

/**
 * Retrieval Engine - Multi-source knowledge acquisition
 * Fetches information from various internet sources
 */
class RetrievalEngine {
  constructor(config = {}) {
    this.config = {
      maxConcurrentRequests: config.maxConcurrentRequests || 5,
      timeout: config.timeout || 10000,
      userAgent: config.userAgent || 'AI-Assistant-Consciousness/1.0',
      ...config
    };

    this.sources = {
      search: [],
      scraping: [],
      apis: []
    };

    this.rateLimiters = new Map();
  }

  /**
   * Multi-source search across different providers
   */
  async multiSourceSearch(query, options = {}) {
    const {
      sources = ['serpapi', 'brave', 'bing'],
      maxResults = 10,
      includeImages = false,
      freshness = 'any'
    } = options;

    const searchPromises = sources.map(source =>
      this.searchSingleSource(source, query, { maxResults, includeImages, freshness })
        .catch(error => {
          console.warn(`Search failed for ${source}:`, error.message);
          return { source, results: [], error: error.message };
        })
    );

    const results = await Promise.allSettled(searchPromises);

    return this.aggregateSearchResults(
      results.map((result, index) => ({
        source: sources[index],
        ...result.value
      }))
    );
  }

  /**
   * Search a single source
   */
  async searchSingleSource(source, query, options) {
    await this.checkRateLimit(source);

    switch (source) {
      case 'serpapi':
        return await this.searchSerpAPI(query, options);
      case 'brave':
        return await this.searchBrave(query, options);
      case 'bing':
        return await this.searchBing(query, options);
      default:
        throw new Error(`Unsupported search source: ${source}`);
    }
  }

  /**
   * SerpAPI search implementation
   */
  async searchSerpAPI(query, options) {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    const params = {
      q: query,
      api_key: apiKey,
      num: options.maxResults || 10,
      ...this.getSourceSpecificParams('serpapi', options)
    };

    const response = await axios.get('https://serpapi.com/search', {
      params,
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent
      }
    });

    return {
      source: 'serpapi',
      results: this.parseSerpAPIResults(response.data),
      metadata: {
        totalResults: response.data.search_information?.total_results,
        timeTaken: response.data.search_information?.time_taken_displayed
      }
    };
  }

  /**
   * Brave Search API implementation
   */
  async searchBrave(query, options) {
    const apiKey = process.env.BRAVE_API_KEY;
    if (!apiKey) {
      throw new Error('BRAVE_API_KEY not configured');
    }

    const params = {
      q: query,
      count: options.maxResults || 10,
      ...this.getSourceSpecificParams('brave', options)
    };

    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      params,
      timeout: this.config.timeout,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
        'User-Agent': this.config.userAgent
      }
    });

    return {
      source: 'brave',
      results: this.parseBraveResults(response.data),
      metadata: {
        totalResults: response.data.web?.total || 0
      }
    };
  }

  /**
   * Bing Web Search API implementation
   */
  async searchBing(query, options) {
    const apiKey = process.env.BING_API_KEY;
    if (!apiKey) {
      throw new Error('BING_API_KEY not configured');
    }

    const params = {
      q: query,
      count: options.maxResults || 10,
      ...this.getSourceSpecificParams('bing', options)
    };

    const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
      params,
      timeout: this.config.timeout,
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'User-Agent': this.config.userAgent
      }
    });

    return {
      source: 'bing',
      results: this.parseBingResults(response.data),
      metadata: {
        totalResults: response.data.webPages?.totalEstimatedMatches || 0
      }
    };
  }

  /**
   * Web scraping for dynamic content
   */
  async scrapeUrl(url, options = {}) {
    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(this.config.userAgent);

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      });

      const content = await page.evaluate(() => {
        // Extract main content, remove scripts and styles
        const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
        return Array.from(elements)
          .map(el => el.textContent.trim())
          .filter(text => text.length > 20)
          .join('\n\n');
      });

      const title = await page.title();
      const metadata = await page.evaluate(() => {
        const metaDesc = document.querySelector('meta[name="description"]');
        const canonical = document.querySelector('link[rel="canonical"]');
        return {
          description: metaDesc?.content,
          canonical: canonical?.href
        };
      });

      return {
        url,
        title,
        content,
        metadata,
        scrapedAt: new Date().toISOString()
      };

    } finally {
      await browser.close();
    }
  }

  /**
   * Aggregate and deduplicate search results
   */
  aggregateSearchResults(results) {
    const allResults = [];
    const seenUrls = new Set();

    for (const result of results) {
      if (result.results) {
        for (const item of result.results) {
          if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            allResults.push({
              ...item,
              source: result.source,
              searchMetadata: result.metadata
            });
          }
        }
      }
    }

    // Sort by relevance score (if available) or recency
    return allResults.sort((a, b) => {
      if (a.relevanceScore && b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);
    });
  }

  /**
   * Rate limiting for API calls
   */
  async checkRateLimit(source) {
    const now = Date.now();
    const limiter = this.rateLimiters.get(source) || { requests: [], limit: 100, window: 60000 };

    // Clean old requests
    limiter.requests = limiter.requests.filter(time => now - time < limiter.window);

    if (limiter.requests.length >= limiter.limit) {
      const waitTime = limiter.window - (now - limiter.requests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkRateLimit(source); // Recheck after waiting
    }

    limiter.requests.push(now);
    this.rateLimiters.set(source, limiter);
  }

  /**
   * Get source-specific search parameters
   */
  getSourceSpecificParams(source, options) {
    const baseParams = {};

    switch (source) {
      case 'serpapi':
        return {
          ...baseParams,
          tbs: options.freshness === 'day' ? 'qdr:d' :
               options.freshness === 'week' ? 'qdr:w' :
               options.freshness === 'month' ? 'qdr:m' : undefined,
          safe: 'active'
        };

      case 'brave':
        return {
          ...baseParams,
          freshness: options.freshness,
          safesearch: 'strict'
        };

      case 'bing':
        return {
          ...baseParams,
          freshness: options.freshness,
          safeSearch: 'Strict'
        };

      default:
        return baseParams;
    }
  }

  /**
   * Parse SerpAPI results
   */
  parseSerpAPIResults(data) {
    const results = [];

    // Organic results
    if (data.organic_results) {
      results.push(...data.organic_results.map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        publishedDate: item.date,
        relevanceScore: item.position ? 1 / (item.position + 1) : 0.5
      })));
    }

    // Answer box
    if (data.answer_box) {
      results.unshift({
        title: 'Answer Box',
        url: data.answer_box.link || data.search_parameters.q,
        snippet: data.answer_box.answer || data.answer_box.snippet,
        type: 'answer_box',
        relevanceScore: 1.0
      });
    }

    return results;
  }

  /**
   * Parse Brave Search results
   */
  parseBraveResults(data) {
    const results = [];

    if (data.web?.results) {
      results.push(...data.web.results.map(item => ({
        title: item.title,
        url: item.url,
        snippet: item.description,
        publishedDate: item.page_age,
        relevanceScore: 0.8 // Brave doesn't provide explicit scores
      })));
    }

    return results;
  }

  /**
   * Parse Bing Search results
   */
  parseBingResults(data) {
    const results = [];

    if (data.webPages?.value) {
      results.push(...data.webPages.value.map(item => ({
        title: item.name,
        url: item.url,
        snippet: item.snippet,
        publishedDate: item.datePublished,
        relevanceScore: 0.7 // Bing doesn't provide explicit scores
      })));
    }

    return results;
  }

  /**
   * Health check for the retrieval engine
   */
  async healthCheck() {
    try {
      // Test a simple search
      const testResults = await this.multiSourceSearch('test query', {
        sources: ['serpapi'],
        maxResults: 1
      });

      return {
        status: 'healthy',
        sources: Object.keys(this.sources),
        lastTest: new Date().toISOString(),
        testResults: testResults.length
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastTest: new Date().toISOString()
      };
    }
  }
}

module.exports = RetrievalEngine;