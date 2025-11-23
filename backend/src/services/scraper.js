// backend/src/services/scraper.js
// Web scraping service using Puppeteer/Playwright

let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.warn('Puppeteer not available. Install with: npm install puppeteer');
}

const SCRAPER_TIMEOUT = parseInt(process.env.SCRAPER_TIMEOUT_MS || '30000', 10);
const SCRAPER_HEADLESS = process.env.SCRAPER_HEADLESS !== 'false';
const USER_AGENT = process.env.SCRAPER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

/**
 * Scrape a webpage and extract content
 * @param {string} url - URL to scrape
 * @param {object} options - Scraping options
 * @returns {Promise<object>} Scraped data
 */
async function scrapeUrl(url, options = {}) {
  if (!puppeteer) {
    throw new Error('Puppeteer is not installed. Install with: npm install puppeteer');
  }

  const {
    waitForSelector = null,
    timeout = SCRAPER_TIMEOUT,
    screenshot = false,
    extractSelectors = {},
    javascript = true
  } = options;

  let browser;
  let page;

  try {
    browser = await puppeteer.launch({
      headless: SCRAPER_HEADLESS ? 'new' : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent(USER_AGENT);
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Disable JavaScript if requested
    if (!javascript) {
      await page.setJavaScriptEnabled(false);
    }

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout
    });

    // Wait for specific selector if provided
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout });
    }

    // Extract content
    const data = await page.evaluate((selectors) => {
      const result = {
        title: document.title,
        url: window.location.href,
        meta: {
          description: document.querySelector('meta[name="description"]')?.content || '',
          keywords: document.querySelector('meta[name="keywords"]')?.content || '',
          ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
          ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
          ogImage: document.querySelector('meta[property="og:image"]')?.content || ''
        },
        body: document.body.innerText,
        html: document.documentElement.outerHTML
      };

      // Extract custom selectors if provided
      if (selectors && typeof selectors === 'object') {
        result.extracted = {};
        for (const [key, selector] of Object.entries(selectors)) {
          const elements = document.querySelectorAll(selector);
          if (elements.length === 1) {
            result.extracted[key] = elements[0].innerText;
          } else if (elements.length > 1) {
            result.extracted[key] = Array.from(elements).map(el => el.innerText);
          } else {
            result.extracted[key] = null;
          }
        }
      }

      return result;
    }, extractSelectors);

    // Take screenshot if requested
    if (screenshot) {
      data.screenshot = await page.screenshot({
        encoding: 'base64',
        fullPage: false
      });
    }

    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Scraping error:', error);
    return {
      success: false,
      error: error.message,
      url,
      timestamp: new Date().toISOString()
    };
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

/**
 * Scrape multiple URLs concurrently
 * @param {string[]} urls - Array of URLs to scrape
 * @param {object} options - Scraping options
 * @returns {Promise<object[]>} Array of scraped data
 */
async function scrapeMultiple(urls, options = {}) {
  const maxConcurrent = options.maxConcurrent || 3;
  const results = [];
  
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(url => scrapeUrl(url, options))
    );
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Extract links from a webpage
 * @param {string} url - URL to extract links from
 * @returns {Promise<object>} Links data
 */
async function extractLinks(url) {
  const result = await scrapeUrl(url, {
    extractSelectors: {
      links: 'a[href]'
    }
  });

  if (result.success && result.data.extracted?.links) {
    // Parse and normalize links
    const baseUrl = new URL(url);
    const links = result.data.extracted.links
      .map(link => {
        try {
          return new URL(link, baseUrl.origin).href;
        } catch (e) {
          return null;
        }
      })
      .filter(link => link !== null);

    result.data.links = [...new Set(links)]; // Remove duplicates
  }

  return result;
}

module.exports = {
  scrapeUrl,
  scrapeMultiple,
  extractLinks,
  isAvailable: () => !!puppeteer
};
