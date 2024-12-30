import type { Context, NarrowedContext } from "telegraf";
import type {
	InlineQueryResultGif,
	InlineQueryResultPhoto,
	Update,
	Convenience,
} from "telegraf/types";

export type CommandContext = Context & Convenience.CommandContextExtn;
export type InlineQueryContext = NarrowedContext<
	Context,
	Update.InlineQueryUpdate
>;

export type InlineQueryResultsPossible =
	| InlineQueryResultGif
	| InlineQueryResultPhoto;

export type PartialQueryResult = {
	id: string;
	thumbnail_url: string;
	title: string;
	photo_url?: string;
	gif_url?: string;
	type?: "gif" | "photo";
};
