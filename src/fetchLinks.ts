import axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import * as cheerio from "cheerio";

const axiosInstance = setupCache(axios);

export async function fetchLinks(
	url: string,
	query?: string,
): Promise<string[]> {
	try {
		const response = await axiosInstance.get(url);
		const $ = cheerio.load(response.data);

		const links: string[] = $(
			`a[href$='.jpg']:icontains('${query}'), a[href$='.gif']:icontains('${query}')`,
		)
			.slice(0, 40)
			.map((i, element) => {
				const href = $(element).attr("href") || "";
				const fullLink = new URL(href, url);
				return fullLink.href;
			})
			.get();

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
