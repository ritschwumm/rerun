export type Nea<T>	= readonly [ T, ...ReadonlyArray<T> ];

export namespace Nea {
	export const is	= <T>(it:ReadonlyArray<T>):it is Nea<T>	=> it.length !== 0;
}
