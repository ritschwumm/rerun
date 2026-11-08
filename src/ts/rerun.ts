#!/usr/bin/env -S node --enable-source-maps

import util				from "node:util";
import process			from "node:process";

import { Nea }			from "rerun/util/nea";
import { Text }			from "rerun/util/text";
import { Duration }		from "rerun/util/duration";

import { Logger }		from "rerun/node/logger";
import { CodeError }	from "rerun/node/codeError";
import { FsPath }		from "rerun/node/fsPath";
import { Glob }			from "rerun/node/glob";

import { Controller }	from "rerun/lib/controller";

const main	= (args:ReadonlyArray<string>):void	=> {
	const params	= parseParams(args);
	if (params === "help") {
		Logger.loud.log(usage);
		return;
	}
	else if (params === "unknown_option" || params === "invalid_args") {
		Logger.loud.log(usage);
		process.exitCode	= 1;
		return;
	}

	const cwdPath	= params.cwdPath !== null ? FsPath.resolve(params.cwdPath) : FsPath.cwd();

	// changes only kill the command when the user wants that
	const obsoleteSignal	= params.killFlag ? "SIGTERM" : null;

	// killing us itself always kills the command, too
	const unwantedSignal	= "SIGTERM";

	const logger = params.verboseFlag ? Logger.loud : Logger.slient;

	const abortController	= new AbortController();
	const abortSignal		= abortController.signal;

	const stop	= () => {
		if (abortSignal.aborted)	return;
		logger.log("requested to die");
		abortController.abort();
	};
	process.on("SIGHUP",	stop);
	process.on("SIGINT",	stop);
	process.on("SIGTERM",	stop);

	void Controller.run({
		initial:			true,
		cwdPath:			cwdPath,
		includeGlobs:		params.includeGlobs,
		excludeGlobs:		params.excludeGlobs,
		pollMillis:			params.pollMillis,
		quickMillis:		params.quickMillis,
		stableCount:		params.stableCount,
		environment:		process.env,
		obsoleteSignal:		obsoleteSignal,
		unwantedSignal:		unwantedSignal,
		command:			params.command,
		logger:				logger,
		abortSignal:		abortSignal,
	});
};

//-----------------------------------------------------------------------------

type Params	= Readonly<{
	verboseFlag:	boolean,
	cwdPath:		FsPath|null,
	includeGlobs:	ReadonlyArray<Glob>,
	excludeGlobs:	ReadonlyArray<Glob>,
	pollMillis:		Duration,
	quickMillis:	Duration,
	stableCount:	number,
	killFlag:		boolean,
	command:		Nea<string>,
}>;

const scriptName	= FsPath.basename(FsPath.brand(process.argv[1]));

const defaults	= {
	pollMillis:		Duration.brand(400),
	quickMillis:	Duration.brand(50),
	stableCount:	3,
};

const usage	=
	Text.block(`
		usage: ${scriptName} [...option] [--] command [...args]

		options
			--help/-h					display this help
			--verbose/-v				print some debug output
			--include/-i	<glob>		watch files matching this glob
			--exclude/-e	<glob>		ignore files matching this glob
			--cwd/-c					working directory for watching and running the command
			--poll/-p		<millis>	polling interval for filesystem scans during steady state (default: ${defaults.pollMillis} ms)
			--quick/-q		<millis>	polling interval for filesystem scans while stabilizing (default: ${defaults.quickMillis} ms)
			--stable/-s		<count>		how often to poll (quickly) before considering files stable (default: ${defaults.stableCount})
			--kill/-k					kill a running command instead of waiting for it to finish

		globs
			glob syntax is based on node's builtin function fsPromises.glob() which is in
			turn based on (or identical to) minimatch. attention: dotfiles are only included
			if explicitly requested, e.g. like this: '{,.}env'
	`);

const parseParams	= (args:ReadonlyArray<string>):Params|"help"|"unknown_option"|"invalid_args"	=> {
	try {
		// NOTE does support "--" as a tokens: [ { kind: 'option-terminator', index: 0 } ]
		const parameters	=
			util.parseArgs({
				args:	Array.from(args),
				options: {
					// other
					help:	{
						type:		"boolean",
						multiple:	false,
						short:		"h",
						default:	false,
					},
					verbose:	{
						type:		"boolean",
						multiple:	false,
						short:		"v",
						default:	false,
					},
					include:	{
						type:		"string",
						multiple:	true,
						short:		"i",
						default:	[],
					},
					exclude:	{
						type:		"string",
						multiple:	true,
						short:		"e",
						default:	[],
					},
					cwd:	{
						type:		"string",
						multiple:	false,
						short:		"c",
						// default:	"",
					},
					poll:	{
						type:		"string",
						multiple:	false,
						short:		"p",
						// default:	"",
					},
					quick:	{
						type:		"string",
						multiple:	false,
						short:		"q",
						// default:	"",
					},
					stable:	{
						type:		"string",
						multiple:	false,
						short:		"s",
						// default:	"",
					},
					kill:	{
						type:		"boolean",
						multiple:	false,
						short:		"k",
						default:	false,
					},
				},
				strict:				true,
				allowPositionals:	true,
				tokens:				true,
			});

		const values	= parameters.values;

		if (values.help)							return "help";

		if (!Nea.is(values.include))				return "invalid_args";

		let pollMillis	= defaults.pollMillis;
		if (values.poll !== undefined) {
			pollMillis	= Duration.brand(parseInt(values.poll));
			if (!Number.isSafeInteger(pollMillis))	return "invalid_args";
			if (pollMillis <= 0)					return "invalid_args";
		}

		let quickMillis	= defaults.quickMillis;
		if (values.quick !== undefined) {
			quickMillis	= Duration.brand(parseInt(values.quick));
			if (!Number.isSafeInteger(quickMillis))	return "invalid_args";
			if (quickMillis <= 0)					return "invalid_args";
		}

		let stableCount	= defaults.stableCount;
		if (values.stable !== undefined) {
			stableCount	= parseInt(values.stable);
			if (!Number.isSafeInteger(stableCount))	return "invalid_args";
			if (stableCount < 0)					return "invalid_args";
		}

		const command	= parameters.positionals;
		if (!Nea.is(command))						return "invalid_args";

		const cwdPath	=
			values.cwd !== undefined
			?	FsPath.brand(values.cwd)
			:	null;

		return {
			verboseFlag:	values.verbose,
			cwdPath:		cwdPath,
			includeGlobs:	values.include.map(Glob.brand),
			excludeGlobs:	values.exclude.map(Glob.brand),
			pollMillis:		pollMillis,
			quickMillis:	quickMillis,
			stableCount:	stableCount,
			killFlag:		values.kill,
			command:		command,
		};
	}
	catch (e) {
		if (CodeError.is(e) && e.code === "ERR_PARSE_ARGS_UNKNOWN_OPTION") {
			return "unknown_option";
		}
		throw e;
	}
};

//-----------------------------------------------------------------------------

main(process.argv.slice(2));
