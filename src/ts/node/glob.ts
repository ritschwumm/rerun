import { Branded }	from "rerun/util/branded";

export type Glob	= Branded<string, "Glob">;

export namespace Glob {
	export const brand	= Branded.brand<Glob>;
}
