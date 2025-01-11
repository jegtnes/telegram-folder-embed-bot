import axios, { type AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { addProtocolToLink } from "./urlUtils";

export async function isFolderValid(url: string): Promise<boolean> {
	try {
		const urlWithProtocol = addProtocolToLink(url);
		const response: AxiosResponse = await axios.get(urlWithProtocol);
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
