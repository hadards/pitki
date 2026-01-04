/**
 * Detect the source platform from a URL
 * @param {string} url - The URL to analyze
 * @returns {string} - The detected source platform
 */
export function detectSource(url) {
  if (!url) return 'Text/WhatsApp';

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'Facebook';
    if (domain.includes('linkedin.com')) return 'LinkedIn';
    if (domain.includes('medium.com')) return 'Medium';
    if (domain.includes('twitter.com') || domain.includes('x.com')) return 'Twitter/X';
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'YouTube';
    if (domain.includes('reddit.com')) return 'Reddit';
    if (domain.includes('instagram.com')) return 'Instagram';
    if (domain.includes('tiktok.com')) return 'TikTok';
    if (domain.includes('github.com')) return 'GitHub';
    if (domain.includes('stackoverflow.com')) return 'Stack Overflow';

    // Return cleaned domain name for unknown sources
    return domain.replace('www.', '');
  } catch (error) {
    // Invalid URL
    return 'Text/WhatsApp';
  }
}
