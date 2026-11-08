import { Branded }	from "rerun/util/branded";

// in milliseconds
export type Duration	= Branded<number, "Duration">;

export namespace Duration {
	export const brand	= (it:number):Duration	=> Branded.brand(it);

	export const since	= () => {
		const start	= Date.now();
		return ():Duration => {
			const end	= Date.now();
			return Branded.brand(end - start);
		};
	};
}
