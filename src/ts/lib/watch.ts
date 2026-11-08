import { FsPath }		from "rerun/node/fsPath";
import { Glob }			from "rerun/node/glob";

import { Duration }		from "rerun/util/duration";
import { Promises }		from "rerun/util/promises";

import { Logger }		from "rerun/node/logger";

import { Fingerprint }	from "rerun/lib/fingerprint";

export namespace Watch {
	export type Params	= {
		cwdPath:		FsPath,
		includeGlobs:	ReadonlyArray<Glob>,
		excludeGlobs:	ReadonlyArray<Glob>,
		onEvent:		(ev:Event)	=> Duration,
		logger:			Logger,
		abortSignal:	AbortSignal,
	};

	export type Event	= "initial"|"changed"|"stable";

	export const run	= async ({ cwdPath, includeGlobs, excludeGlobs, onEvent, logger, abortSignal }:Params):Promise<void>	=> {
		let lastFingerprint:Fingerprint|null	= null;

		for (;;) {
			try {
				if (abortSignal.aborted)	break;

				const sinceScanStart	= Duration.since();

				const fingerprint		= await Fingerprint.scan({ includeGlobs, excludeGlobs, cwdPath, abortSignal });
				if (fingerprint === null)	break;

				const scanDuration		= sinceScanStart();
				logger.log(`scanned files in ${scanDuration.toFixed(0)}ms`);

				const event:Event	=
					lastFingerprint === null		? "initial"	:
					fingerprint !== lastFingerprint	? "changed"	:
					"stable";

				const delay	= onEvent(event);

				lastFingerprint	= fingerprint;

				await Promises.sleep(delay);
			}
			catch (e) {
				// if (Error.isError(e) && e.name === "AbortError")	return;
				logger.log("watcher failed", e);
				// throw e;

				await Promises.sleep(soon);
			}
		}
	};

	// TODO hardcoded
	const soon	= Duration.brand(1000);
}
