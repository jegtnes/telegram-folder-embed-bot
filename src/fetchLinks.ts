import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchLinks(url: string): Promise<string[]> {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const links: string[] = $('a[href]')
            .map((i, element) => {
                if(!element) return;
                const href = $(element).attr('href') || "";
                const fullLink = new URL(href, url);
                return fullLink.href;
            })
            .get();

        return links;
    } catch (error: any) {
        console.error(`fucked it m8: ${error.message}`);
        return [];
    }
}

(async () => {
    const links = await fetchLinks('https://folder.jegtnes.com');
    console.debug(links);
    return;
})();