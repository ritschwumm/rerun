import { Duration }	from "rerun/util/duration";

export namespace Promises {
	export const sleep	= (millis:Duration):Promise<void>	=>
		new Promise((resolve, _reject) => { setTimeout(resolve, millis); });
}
