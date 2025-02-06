import { Database, type Statement } from "bun:sqlite";
import type { FolderTable } from "./types";

import { dbFilePath } from "./index";

export function getAllFolders(userId: number): FolderTable[] {
	const db = new Database(dbFilePath);
	try {
		const query: Statement<FolderTable> = db.query(
			"SELECT * FROM servers WHERE telegram_id = $telegram_id",
		);
		const folders: FolderTable[] = query.all({ $telegram_id: `${userId}` });
		return folders;
	} catch (error) {
		console.error(error);
	}

	return [];
}
