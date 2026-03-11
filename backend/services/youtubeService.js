const axios = require('axios');

class YoutubeService {
    constructor() {
        this.apiKey = process.env.SERPAPI_API_KEY || "";
        this.baseUrl = "https://serpapi.com/search";
    }

    /**
     * Search YouTube videos for a specific topic
     * @param {string} query - The search query (e.g., "Learn Data Structures")
     * @returns {Promise<Array>} - List of video objects { title, link, thumbnail, channel }
     */
    async searchVideos(query) {
        if (!this.apiKey) {
            console.warn("SerpAPI Key missing. Skipping YouTube search.");
            return [];
        }

        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    engine: "youtube",
                    search_query: query,
                    api_key: this.apiKey,
                    num: 15 // Fetch more to allow for filtering
                }
            });

            if (!response.data.video_results) {
                return [];
            }

            const videoResults = response.data.video_results.map(video => ({
                title: video.title,
                link: video.link,
                thumbnail: video.thumbnail?.static || video.thumbnail?.default,
                channel: video.channel?.name,
                views: video.views,
                length: video.length
            }));

            // Filter out Shorts (videos < 60 seconds)
            const longVideos = videoResults.filter(video => {
                if (!video.length) return false; // Filter out if length is unknown (to be safe)
                const parts = video.length.split(':').map(Number);
                let seconds = 0;
                if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
                else seconds = parts[0];
                return seconds >= 60;
            });

            // Sort by views (descending)
            longVideos.sort((a, b) => (b.views || 0) - (a.views || 0));

            console.log(`[YoutubeService] Query: "${query}" | Raw: ${videoResults.length} | Long: ${longVideos.length} | Returning: 6`);

            return longVideos.slice(0, 6); // Return top 6 valid videos
        } catch (error) {
            console.error(`YouTube search failed for query "${query}":`, error.message);
            return [];
        }
    }
}

module.exports = new YoutubeService();
