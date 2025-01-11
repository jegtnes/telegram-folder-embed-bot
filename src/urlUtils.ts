export function addProtocolToLink(link: string): string {
	const structuredURL = new URL(
		link.indexOf("://") === -1 ? `http://${link}` : link,
	);
	return structuredURL.href;
}

export function removeProtocolFromLink(link: string): string {
	try {
		const structuredURL = new URL(link);
		return `${structuredURL.host}${structuredURL.pathname}${structuredURL.search}`;
	} catch {
		return link;
	}
}
