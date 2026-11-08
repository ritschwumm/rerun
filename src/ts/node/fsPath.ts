import process		from "node:process";
import path			from "node:path";

import { Branded }	from "rerun/util/branded";

export type FsPath	= Branded<string, "FsPath">;

export namespace FsPath {
	export const brand	= Branded.brand<FsPath>;

	export const cwd	= ():FsPath =>
		brand(process.cwd());

	export const join	= (...parts:ReadonlyArray<FsPath>):FsPath	=>
		brand(path.join(...parts));

	export const resolve	= (...parts:ReadonlyArray<FsPath>):FsPath	=>
		brand(path.resolve(...parts));

	export const dirname	= (self:FsPath):FsPath	=>
		brand(path.dirname(self));

	export const basename	= (self:FsPath):FsPath	=>
		brand(path.basename(self));
}
