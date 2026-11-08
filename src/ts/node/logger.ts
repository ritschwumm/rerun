/* eslint-disable no-console */

export type Logger	=
	Readonly<{
		log:	(...msg:ReadonlyArray<unknown>)	=> void,
	}>;

export namespace Logger {
	export const loud:Logger	= ({
		log:	(...msg:ReadonlyArray<unknown>)	=> console.log(...msg),
	});

	export const slient:Logger	= ({
		log:	()	=> {},
	});
}
