import fsPromises	from "node:fs/promises";

import { Branded }	from "rerun/util/branded";

import { FsPath }	from "rerun/node/fsPath";
import { FsUtil }	from "rerun/node/fsUtil";
import { Glob }		from "rerun/node/glob";

export type Fingerprint	= Branded<string, "Fingerprint">;

export namespace Fingerprint {
	export type ScanParams	= Readonly<{
		cwdPath:		FsPath,
		includeGlobs:	ReadonlyArray<Glob>,
		excludeGlobs:	ReadonlyArray<Glob>,
		abortSignal:	AbortSignal,
	}>;

	// returns null when the scan was aborted
	export const scan	= async ({ cwdPath, includeGlobs, excludeGlobs, abortSignal }:ScanParams):Promise<Fingerprint|null> => {
		if (abortSignal.aborted)	return null;

		const paths	=
			fsPromises.glob(
				includeGlobs,
				{
					cwd:		cwdPath,
					// NOTE passing a function here does not work - it is never called
					exclude:	excludeGlobs,
				}
			);

		if (abortSignal.aborted)	return null;

		const lines	= [];
		for await (const path of paths) {
			if (abortSignal.aborted)	return null;

			const absolute	= FsPath.brand(path);
			const stat		= await FsUtil.stat(absolute, "nofollow");
			if (stat === FsUtil.ENOENT)	continue;
			if (!stat.isFile())			continue;
			lines.push(`${absolute}\u0000${stat.mtimeMs.toFixed(0)}`);
		}

		// in place, we may have a lot of lines and don't want to waste memory
		lines.sort();

		return Branded.brand(lines.join("\u0000"));
	};
}
