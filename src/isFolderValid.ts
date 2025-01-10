import axios, { type AxiosResponse } from "axios";
import * as cheerio from "cheerio";

export async function isFolderValid(url: string): Promise<boolean> {
	try {
		const response: AxiosResponse = await axios.get(url);
		const $: cheerio.CheerioAPI = cheerio.load(response.data);
		const h1 = $("h1:first-of-type");
		return h1?.text().startsWith("Index of");
	} catch (error) {
		console.error(error);
		return false;
	}
}
