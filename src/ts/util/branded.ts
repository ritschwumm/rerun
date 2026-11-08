export type Branded<T, B>	= T & Branding<T, B>;

export type Unbranded<T extends Branded<unknown, unknown>>	= T[typeof __BASE__];

export type Branding<T, B>	= {
	readonly [__BASE__]:	T,
	readonly [__BRAND__]:	B,
};

declare const __BASE__:		unique symbol;
declare const __BRAND__:	unique symbol;

export namespace Branded {
	/** this is unsafe casting, do not call unless proven to be correct */
	export const brand		= <T extends Branded<unknown, unknown>>(it:Unbranded<T>):T	=> it as T;

	export const unbrand	= <T>(it:Branded<T, unknown>):T	=> it;
};
