import axios, { type AxiosResponse } from "axios";
import * as cheerio from "cheerio";

export async function isFolderValid(url: string): Promise<boolean> {
	try {
		const structuredURL = new URL(
			url.indexOf("://") === -1 ? `http://${url}` : url,
		);
		const response: AxiosResponse = await axios.get(structuredURL.href);
		const $: cheerio.CheerioAPI = cheerio.load(response.data);
		const h1 = $("h1:first-of-type");
		return h1?.text().startsWith("Index of");
	} catch (error) {
		if (
			!(error.code === "ERR_INVALID_URL" || error.code === "ConnectionRefused")
		) {
			console.error(error);
		}

		return false;
	}
}

const asd = await isFolderValid("google.com");
console.log(asd);
