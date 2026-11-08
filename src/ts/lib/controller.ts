import { Fn }		from "rerun/util/fn";
import { Nea }		from "rerun/util/nea";
import { Promises }	from "rerun/util/promises";
import { Duration }	from "rerun/util/duration";

import { Logger }	from "rerun/node/logger";
import { FsPath }	from "rerun/node/fsPath";
import { Glob }		from "rerun/node/glob";

import { Watch }	from "rerun/lib/watch";
import { Command }	from "rerun/lib/command";

export namespace Controller {
	export type Params	= Readonly<{
		initial:			boolean,
		cwdPath:			FsPath,
		includeGlobs:		ReadonlyArray<Glob>,
		excludeGlobs:		ReadonlyArray<Glob>,
		pollMillis:			Duration,
		quickMillis:		Duration,
		stableCount:		number,
		environment:		NodeJS.ProcessEnv,
		obsoleteSignal:		KillSignal|null,
		unwantedSignal:		KillSignal|null,
		command:			Nea<string>,
		logger:				Logger,
		abortSignal:		AbortSignal,
	}>;

	export type KillSignal	= "SIGTERM"|"SIGINT"|"SIGKILL";

	export const run	= async ({ initial, cwdPath, includeGlobs, excludeGlobs, pollMillis, quickMillis, stableCount, environment, obsoleteSignal, unwantedSignal, command, logger, abortSignal }:Params):Promise<void> => {
		//-----------------------------------------------------------------------------
		//## request detection

		let changed		= false;

		const receive	= ():boolean	=> {
			const result	= changed;
			changed	= false;
			return result;
		};

		let considering		= false;
		let stableCounter	= 0;

		const onEvent	= (event:Watch.Event):Duration	=> {
			if (event === "initial") {
				considering		= false;
				stableCounter	= 0;

				if (initial) {
					changed	= true;
				}
			}
			else if (event === "changed") {
				considering		= true;
				stableCounter	= 0;
			}
			else if (event === "stable") {
				stableCounter	= stableCounter + 1;
			}
			else Fn.impossible(event);

			if (considering && stableCounter === stableCount) {
				considering	= false;
				changed		= true;
			}

			// use short delay when we are hoping for a stable filesystem soon to speed up rebuilds
			const pollDelay	= considering ? quickMillis : pollMillis;

			return pollDelay;
		};

		// pushes events into the queue
		const watch	=
			Watch.run({
				cwdPath,
				includeGlobs,
				excludeGlobs,
				onEvent,
				logger,
				abortSignal,
			});

		//-----------------------------------------------------------------------------
		//## restart mechanism

		type Child	= Command | "killing" | "none";

		const isCommand	= (it:Child):it is Command	=> it !== "killing" && it !== "none";

		let child:Child	= Fn.identity<Child>("none");

		// a new child is currently required, will be reset when there is one
		let starting	= false;

		// pulls events from the queue
		for (;;) {
			await Promises.sleep(shortly);

			if (abortSignal.aborted)	break;

			if (!starting) {
				// no starts in progress:
				// start when the watcher has an event for us
				starting	= receive();
			}
			else {
				// something changed: ensure a new command has been started, then remove the requirement
				if (isCommand(child)) {
					// we have child we want gone before starting a new one
					if (obsoleteSignal !== null) {
						logger.log("killing the child process");
						child.kill(obsoleteSignal);
						child	= "killing";
					}
					else {
						logger.log("waiting for the child process to exit");
					}
				}
				else if (child === "killing") {
					// we can neither restart nor finish until the child is gone
					logger.log("waiting for the child process to die");
				}
				else if (child === "none") {
					// the child is gone, we can start a new one
					child	=
						Command.start({
							command,
							cwdPath,
							environment,
							logger,
							onExit:	() => { child	= "none"; },
						});

					// we are no longer starting a new child
					starting	= false;
				}
				else Fn.impossible(child);
			}
		}

		// after the abortSignal fired, wait for shutdown
		for (;;) {
			await Promises.sleep(shortly);

			if (isCommand(child)) {
				// we have child we want gone before starting a new one
				if (unwantedSignal !== null) {
					logger.log("killing the child process");
					child.kill(unwantedSignal);
					child	= "killing";
				}
				else {
					logger.log("waiting for the child process to exit");
				}
			}
			else if (child === "killing") {
				// we can neither restart nor finish until the child is gone
				logger.log("waiting for the child process to die");
			}
			else if (child === "none") {
				// the child is gone, we can go, too
				break;
			}
			else Fn.impossible(child);
		}

		await watch;
	};

	const shortly	= Duration.brand(10);
}
