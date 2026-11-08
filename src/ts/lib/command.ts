import process			from "node:process";
import child_process	from "node:child_process";

import { Nea }			from "rerun/util/nea";

import { FsPath }		from "rerun/node/fsPath";
import { Logger }		from "rerun/node/logger";

export type Command	= Readonly<{
	kill:	(signal:NodeJS.Signals)	=> void,
}>;

export namespace Command {
	export type Props	= Readonly<{
		command:		Nea<string>,
		cwdPath:		FsPath,
		environment:	NodeJS.ProcessEnv,
		logger:			Logger,
		onExit:			()	=> void,
	}>;

	export const start	= ({ command, cwdPath, environment, logger, onExit }:Props):Command	=> {
		logger.log(`executing command "${command.join(" ")}"`);

		const [ cmd, ...args ]	= command;

		let child:child_process.ChildProcess|null =
			child_process.spawn(
				cmd,
				args,
				{
					cwd:		cwdPath,
					env:		environment,
					// ensure the command is put into a process group
					detached:	true,
					stdio:	[
						process.stdin,
						process.stdout,
						process.stderr,
					],
				}
			);

		const kill	= (signal:NodeJS.Signals):void	=> {
			if (child === null)				return;
			if (child.pid === undefined)	return;

			logger.log(`killing command ${child.pid}`);

			// kill the whole process group of the child process: this does
			// include both the process/shell we started and all their children
			process.kill(-child.pid, signal);
		};

		child?.on("exit", (code, signal) => {
			logger.log(`command ${exitMessage(code, signal)}`);
			// do not keep an instance as this may require memory
			child	= null;
			onExit();
		});

		return { kill };;
	};

	const exitMessage	= (code:number|null, signal:string|null):string	=>
		code	!== null ? `completed with ${code}`	:
		signal	!== null ? `exited with ${signal}`	:
		"finished";
}
