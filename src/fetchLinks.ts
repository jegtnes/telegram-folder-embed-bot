import axios from "axios";
import * as cheerio from "cheerio";

export async function fetchLinks(
	url: string,
	query?: string,
): Promise<string[]> {
	try {
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);

		const links: string[] = $(`a[href]:icontains('${query}')`)
			.map((i, element) => {
				if (!element) return;
				const href = $(element).attr("href") || "";
				const fullLink = new URL(href, url);
				return fullLink.href;
			})
			.get()
			.filter((link) => {
				const extRx = link.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
				return extRx?.[1] === "jpg" || extRx?.[1] === "gif";
			})
			.slice(0, 40);
		return links;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`fucked it m8: ${error?.message}`);
		} else {
			console.error("fucked it so hard this isn't even an error");
		}
		return [];
	}
}
