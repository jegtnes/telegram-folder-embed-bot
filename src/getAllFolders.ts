import { Database, type Statement } from "bun:sqlite";
import type { FolderTable } from "./types";

const dbFile: string = process.env.SQLITE_DB_FILE || "";

export function getAllFolders(userId: number): FolderTable[] {
	const db = new Database(dbFile);
	const query: Statement<FolderTable> = db.query(
		"SELECT * FROM servers WHERE telegram_id = $telegram_id",
	);
	const folders: FolderTable[] = query.all({ $telegram_id: `${userId}` });
	return folders;
}
