import ogs from 'open-graph-scraper';

/**
 * Extract metadata from a URL using Open Graph protocol
 * @param {string} url - The URL to scrape
 * @returns {Promise<{title: string, thumbnail: string|null}>}
 */
export async function extractMetadata(url) {
  try {
    const { result } = await ogs({ url });

    return {
      title: result.ogTitle || result.twitterTitle || result.dcTitle || 'Untitled',
      thumbnail: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || null
    };
  } catch (error) {
    console.error('Error extracting metadata:', error.message);

    // Fallback: extract title from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;

    return {
      title: lastPart.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, ''),
      thumbnail: null
    };
  }
}
